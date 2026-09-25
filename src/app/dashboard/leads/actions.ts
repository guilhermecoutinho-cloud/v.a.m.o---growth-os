'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { periodoDe } from '@/lib/vamo/calculos'
import type { EtapaLead, MotivoPerda, Produto } from '@/lib/vamo/comercial'
import type { CampoSnapshot } from '@/lib/vamo/modelo'

export type ResultadoLead = { ok: boolean; mensagem?: string; id?: string }

async function exigirComercial() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const papel =
    (user.app_metadata?.role as string) ??
    (await supabase.from('profiles').select('role').eq('id', user.id).single()).data?.role
  return papel === 'sales' || papel === 'admin' ? user : null
}

export async function criarLead(_prev: unknown, formData: FormData): Promise<ResultadoLead> {
  const user = await exigirComercial()
  if (!user) return { ok: false, mensagem: 'Acesso restrito ao time comercial.' }

  const empresa = String(formData.get('company_name') ?? '').trim()
  if (!empresa) return { ok: false, mensagem: 'Informe o nome da empresa.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leads')
    .insert({
      owner_id: user.id,
      company_name: empresa,
      contact_name: String(formData.get('contact_name') ?? '').trim() || null,
      email: String(formData.get('email') ?? '').trim() || null,
      phone: String(formData.get('phone') ?? '').trim() || null,
      segment: String(formData.get('segment') ?? '').trim() || null,
    })
    .select('id')
    .single()

  if (error) return { ok: false, mensagem: error.message }
  revalidatePath('/dashboard/leads')
  return { ok: true, id: data.id }
}

/** Mover para "Perdido" exige motivo — é o que alimenta o aprendizado. */
export async function moverLead(
  leadId: string,
  etapa: EtapaLead,
  motivo?: MotivoPerda | null
): Promise<ResultadoLead> {
  if (!(await exigirComercial())) {
    return { ok: false, mensagem: 'Acesso restrito ao time comercial.' }
  }
  if (etapa === 'perdido' && !motivo) {
    return { ok: false, mensagem: 'Escolha o motivo da perda.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads')
    .update({ stage: etapa, lost_reason: etapa === 'perdido' ? motivo : null })
    .eq('id', leadId)

  if (error) return { ok: false, mensagem: error.message }
  revalidatePath('/dashboard/leads')
  return { ok: true }
}

export async function salvarDiagnostico(entrada: {
  leadId: string
  receitaAtual: number | null
  meta: number | null
  snapshot: Partial<Record<CampoSnapshot, number | null>>
  camposDesconhecidos: CampoSnapshot[]
  opiniaoLead: string
  evidencia: string
  produto: Produto | null
  resumo: string
}): Promise<ResultadoLead> {
  if (!(await exigirComercial())) {
    return { ok: false, mensagem: 'Acesso restrito ao time comercial.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('sales_diagnostics').insert({
    lead_id: entrada.leadId,
    current_revenue: entrada.receitaAtual,
    target_revenue: entrada.meta,
    snapshot_json: {
      valores: entrada.snapshot,
      desconhecidos: entrada.camposDesconhecidos,
    },
    lead_opinion_opportunity: entrada.opiniaoLead || null,
    evidence_answer: entrada.evidencia || null,
    recommended_product: entrada.produto,
    summary_text: entrada.resumo || null,
  })

  if (error) return { ok: false, mensagem: error.message }
  revalidatePath('/dashboard/leads')
  return { ok: true }
}

/**
 * Converte o lead em aluno. O que foi levantado na reunião vira a
 * máquina da empresa: o aluno entra e encontra tudo preenchido, sem
 * redigitar nada.
 */
export async function converterEmAluno(leadId: string): Promise<ResultadoLead> {
  if (!(await exigirComercial())) {
    return { ok: false, mensagem: 'Acesso restrito ao time comercial.' }
  }

  const admin = createAdminClient()

  const { data: lead } = await admin.from('leads').select('*').eq('id', leadId).single()
  if (!lead) return { ok: false, mensagem: 'Lead não encontrado.' }
  if (!lead.email) return { ok: false, mensagem: 'O lead precisa de um e-mail para receber o acesso.' }
  if (lead.organization_id) return { ok: false, mensagem: 'Este lead já foi convertido.' }

  const { data: diag } = await admin
    .from('sales_diagnostics')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1)

  const diagnostico = diag?.[0]

  // 1. Empresa
  const { data: org, error: erroOrg } = await admin
    .from('organizations')
    .insert({ name: lead.company_name, segment: lead.segment })
    .select('id')
    .single()
  if (erroOrg) return { ok: false, mensagem: `Não foi possível criar a empresa: ${erroOrg.message}` }

  // 2. A máquina levantada na reunião vira o snapshot do mês
  if (diagnostico?.snapshot_json) {
    const s = diagnostico.snapshot_json as {
      valores?: Record<string, number | null>
      desconhecidos?: string[]
    }
    await admin.from('metric_snapshots').insert({
      organization_id: org.id,
      period: periodoDe(new Date()),
      ...(s.valores ?? {}),
      unknown_fields: s.desconhecidos ?? [],
      notes: 'Registrado na reunião diagnóstica comercial.',
    })
  }

  // 3. Meta
  if (diagnostico?.target_revenue) {
    await admin.from('revenue_goals').insert({
      organization_id: org.id,
      period_type: 'mensal',
      target_revenue: diagnostico.target_revenue,
    })
  }

  // 4. Convite de acesso
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'

  const { data: convidado, error: erroConvite } = await admin.auth.admin.inviteUserByEmail(
    lead.email,
    {
      data: { full_name: lead.contact_name },
      redirectTo: host ? `${proto}://${host}/login` : undefined,
    }
  )

  if (erroConvite && !erroConvite.message.toLowerCase().includes('already')) {
    return { ok: false, mensagem: `Empresa criada, mas o convite falhou: ${erroConvite.message}` }
  }

  if (convidado?.user?.id) {
    await admin.auth.admin.updateUserById(convidado.user.id, {
      app_metadata: { role: 'student' },
    })
    await admin.from('organization_members').insert({
      organization_id: org.id,
      user_id: convidado.user.id,
      role: 'student',
      member_role: 'owner',
    })
  }

  // 5. Fecha o lead
  await admin
    .from('leads')
    .update({ stage: 'vendido', organization_id: org.id })
    .eq('id', leadId)

  revalidatePath('/dashboard/leads')
  return { ok: true, mensagem: `${lead.company_name} criada e convite enviado para ${lead.email}.` }
}
