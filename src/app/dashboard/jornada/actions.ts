'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ResultadoEtapa = { ok: boolean; mensagem?: string }

/** O aluno marca a própria etapa; admin e mentor também podem marcar. */
export async function marcarEtapa(
  organizationId: string,
  stepId: number,
  concluida: boolean
): Promise<ResultadoEtapa> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, mensagem: 'Sessão expirada. Entre novamente.' }

  const { error } = await supabase.from('program_progress').upsert(
    {
      organization_id: organizationId,
      step_id: stepId,
      status: concluida ? 'concluida' : 'disponivel',
      completed_at: concluida ? new Date().toISOString() : null,
    },
    { onConflict: 'organization_id,step_id' }
  )

  if (error) return { ok: false, mensagem: error.message }
  revalidatePath('/dashboard/jornada')
  return { ok: true }
}
