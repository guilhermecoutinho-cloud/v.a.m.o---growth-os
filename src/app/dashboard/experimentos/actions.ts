'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type StatusExperimento = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado'
export type ResultadoExperimento = { ok: boolean; mensagem?: string; id?: string }

export async function criarExperimento(
  _prev: unknown,
  formData: FormData
): Promise<ResultadoExperimento> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, mensagem: 'Sessão expirada. Entre novamente.' }

  const organizationId = String(formData.get('organization_id') ?? '')
  const titulo = String(formData.get('title') ?? '').trim()
  const kpi = String(formData.get('kpi') ?? '').trim()

  if (!titulo) return { ok: false, mensagem: 'Dê um nome ao experimento.' }
  if (!kpi) return { ok: false, mensagem: 'Informe o KPI que decide o resultado.' }

  const num = (k: string) => {
    const v = String(formData.get(k) ?? '').trim()
    return v === '' ? null : Number(v.replace(',', '.'))
  }
  const texto = (k: string) => String(formData.get(k) ?? '').trim() || null

  const { data, error } = await supabase
    .from('experiments')
    .insert({
      organization_id: organizationId,
      hypothesis_id: texto('hypothesis_id'),
      title: titulo,
      kpi,
      baseline: num('baseline'),
      target: num('target'),
      starts_on: texto('starts_on'),
      ends_on: texto('ends_on'),
      owner_name: texto('owner_name'),
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { ok: false, mensagem: error.message }
  revalidatePath('/dashboard/experimentos')
  return { ok: true, id: data.id }
}

/**
 * Fecha o ciclo: registra o resultado e o que ficou aprendido. O
 * aprendizado importa tanto quanto o número — é o que evita repetir o
 * mesmo teste daqui a seis meses.
 */
export async function atualizarExperimento(entrada: {
  id: string
  status?: StatusExperimento
  resultado?: number | null
  aprendizado?: string | null
}): Promise<ResultadoExperimento> {
  const supabase = await createClient()
  const campos: Record<string, unknown> = {}
  if (entrada.status !== undefined) campos.status = entrada.status
  if (entrada.resultado !== undefined) campos.result = entrada.resultado
  if (entrada.aprendizado !== undefined) campos.learning = entrada.aprendizado

  const { error } = await supabase.from('experiments').update(campos).eq('id', entrada.id)
  if (error) return { ok: false, mensagem: error.message }

  revalidatePath('/dashboard/experimentos')
  return { ok: true }
}
