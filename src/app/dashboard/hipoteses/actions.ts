'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { No, Alavanca } from '@/lib/vamo/modelo'

export type ResultadoHipotese = { ok: boolean; mensagem?: string; id?: string }

export async function criarHipotese(entrada: {
  organizationId: string
  no: No
  alavanca: Alavanca
  se: string
  entao: string
  porque: string
  itemBibliotecaId?: string | null
  contexto?: Record<string, unknown> | null
  status?: 'rascunho' | 'a_testar'
}): Promise<ResultadoHipotese> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, mensagem: 'Sessão expirada. Entre novamente.' }

  if (!entrada.se.trim() || !entrada.entao.trim()) {
    return { ok: false, mensagem: 'Preencha ao menos o SE e o ENTÃO.' }
  }

  const { data, error } = await supabase
    .from('hypotheses')
    .insert({
      organization_id: entrada.organizationId,
      node: entrada.no,
      lever: entrada.alavanca,
      if_action: entrada.se.trim(),
      then_result: entrada.entao.trim(),
      because_evidence: entrada.porque.trim(),
      library_item_id: entrada.itemBibliotecaId ?? null,
      snapshot_context: entrada.contexto ?? null,
      status: entrada.status ?? 'a_testar',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { ok: false, mensagem: `Não foi possível salvar: ${error.message}` }

  revalidatePath('/dashboard', 'layout')
  return { ok: true, id: data?.id }
}

export async function mudarStatusHipotese(
  id: string,
  status: 'rascunho' | 'a_testar' | 'em_teste' | 'validada' | 'refutada' | 'inconclusiva'
): Promise<ResultadoHipotese> {
  const supabase = await createClient()
  const { error } = await supabase.from('hypotheses').update({ status }).eq('id', id)
  if (error) return { ok: false, mensagem: error.message }
  revalidatePath('/dashboard', 'layout')
  return { ok: true }
}

/**
 * Registrar o descarte importa tanto quanto criar a hipótese: é o que
 * permite ao mentor (e ao futuro agente) saber o que já foi investigado
 * e afastado.
 */
export async function descartarCausa(entrada: {
  organizationId: string
  no: No
  alavanca: Alavanca
  tituloCausa: string
  motivo: string
  itemBibliotecaId?: string | null
}): Promise<ResultadoHipotese> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, mensagem: 'Sessão expirada. Entre novamente.' }

  const { error } = await supabase.from('hypotheses').insert({
    organization_id: entrada.organizationId,
    node: entrada.no,
    lever: entrada.alavanca,
    if_action: entrada.tituloCausa,
    then_result: '—',
    because_evidence: '—',
    library_item_id: entrada.itemBibliotecaId ?? null,
    status: 'refutada',
    discard_reason: entrada.motivo || 'Descartada sem motivo registrado.',
    created_by: user.id,
  })

  if (error) return { ok: false, mensagem: error.message }
  revalidatePath('/dashboard', 'layout')
  return { ok: true }
}
