'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ResultadoCanal = { ok: boolean; mensagem?: string }

export type CanalId =
  | 'meta_ads'
  | 'google_ads'
  | 'organico'
  | 'indicacao'
  | 'outbound'
  | 'outro'

export async function salvarCanal(entrada: {
  organizationId: string
  periodo: string
  canal: CanalId
  canalOutro?: string
  investimento: number | null
  alcance: number | null
  leads: number | null
  vendas: number | null
}): Promise<ResultadoCanal> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, mensagem: 'Sessão expirada. Entre novamente.' }

  if (entrada.canal === 'outro' && !entrada.canalOutro?.trim()) {
    return { ok: false, mensagem: 'Dê um nome ao canal.' }
  }

  const { error } = await supabase.from('acquisition_channels').upsert(
    {
      organization_id: entrada.organizationId,
      period: entrada.periodo,
      channel: entrada.canal,
      channel_other: entrada.canal === 'outro' ? entrada.canalOutro!.trim() : '',
      investment: entrada.investimento,
      reach: entrada.alcance,
      leads: entrada.leads,
      sales: entrada.vendas,
      created_by: user.id,
    },
    { onConflict: 'organization_id,period,channel,channel_other' }
  )

  if (error) return { ok: false, mensagem: error.message }
  revalidatePath('/dashboard/aquisicao')
  return { ok: true }
}

export async function removerCanal(id: string): Promise<ResultadoCanal> {
  const supabase = await createClient()
  const { error } = await supabase.from('acquisition_channels').delete().eq('id', id)
  if (error) return { ok: false, mensagem: error.message }
  revalidatePath('/dashboard/aquisicao')
  return { ok: true }
}
