'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CampoSnapshot } from '@/lib/vamo/modelo'

export type ResultadoSalvar = {
  ok: boolean
  mensagem?: string
  salvoEm?: string
}

type Valores = Partial<Record<CampoSnapshot, number | null>>

/**
 * Grava a fotografia do mês. Upsert por (organização, período): o mesmo
 * mês é sempre atualizado, nunca duplicado.
 */
export async function salvarSnapshot(
  organizationId: string,
  periodo: string,
  valores: Valores,
  camposDesconhecidos: CampoSnapshot[]
): Promise<ResultadoSalvar> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, mensagem: 'Sessão expirada. Entre novamente.' }

  // Campo marcado como "Não sei" é gravado como null: zero seria um
  // número medido, e não é isso que a pessoa está dizendo.
  const limpos: Valores = { ...valores }
  for (const campo of camposDesconhecidos) limpos[campo] = null

  const { error } = await supabase.from('metric_snapshots').upsert(
    {
      organization_id: organizationId,
      period: periodo,
      ...limpos,
      unknown_fields: camposDesconhecidos,
      created_by: user.id,
    },
    { onConflict: 'organization_id,period' }
  )

  if (error) return { ok: false, mensagem: `Não foi possível salvar: ${error.message}` }

  revalidatePath('/dashboard', 'layout')
  return {
    ok: true,
    salvoEm: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  }
}

/** Define ou atualiza a meta mensal de receita. */
export async function salvarMeta(
  organizationId: string,
  valor: number
): Promise<ResultadoSalvar> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, mensagem: 'Sessão expirada. Entre novamente.' }

  if (!Number.isFinite(valor) || valor <= 0) {
    return { ok: false, mensagem: 'Informe uma meta maior que zero.' }
  }

  const { error } = await supabase.from('revenue_goals').insert({
    organization_id: organizationId,
    period_type: 'mensal',
    target_revenue: valor,
    created_by: user.id,
  })

  if (error) return { ok: false, mensagem: `Não foi possível salvar a meta: ${error.message}` }

  revalidatePath('/dashboard', 'layout')
  return { ok: true }
}
