'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ResultadoCenario = { ok: boolean; mensagem?: string }

/** Grava o cenário "otimizado": as taxas-alvo definidas nos sliders. */
export async function salvarCenario(
  organizationId: string,
  nome: 'atual' | 'meta' | 'otimizado',
  valores: {
    target_revenue?: number | null
    avg_ticket?: number | null
    cpl?: number | null
    rate_lead_mql?: number | null
    rate_mql_opp?: number | null
    rate_opp_sale?: number | null
  }
): Promise<ResultadoCenario> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, mensagem: 'Sessão expirada. Entre novamente.' }

  const { error } = await supabase.from('revenue_scenarios').upsert(
    { organization_id: organizationId, name: nome, ...valores, updated_at: new Date().toISOString() },
    { onConflict: 'organization_id,name' }
  )

  if (error) return { ok: false, mensagem: error.message }
  revalidatePath('/dashboard', 'layout')
  return { ok: true }
}

/** Define a meta mensal a partir da própria Arquitetura. */
export async function definirMeta(
  organizationId: string,
  valor: number
): Promise<ResultadoCenario> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, mensagem: 'Sessão expirada. Entre novamente.' }
  if (!Number.isFinite(valor) || valor <= 0)
    return { ok: false, mensagem: 'Informe uma meta maior que zero.' }

  const { error } = await supabase.from('revenue_goals').insert({
    organization_id: organizationId,
    period_type: 'mensal',
    target_revenue: valor,
    created_by: user.id,
  })
  if (error) return { ok: false, mensagem: error.message }

  revalidatePath('/dashboard', 'layout')
  return { ok: true }
}
