'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { RegistroEtapa } from '@/lib/vamo/referencias'

export type ResultadoJornada = { ok: boolean; mensagem?: string }

/** Grava como uma etapa da jornada acontece hoje na empresa. */
export async function salvarEtapaJornada(
  organizationId: string,
  stageId: string,
  registro: RegistroEtapa
): Promise<ResultadoJornada> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, mensagem: 'Sessão expirada. Entre novamente.' }

  const { error } = await supabase.from('journey_stages').upsert(
    {
      organization_id: organizationId,
      stage_id: stageId,
      como_acontece: registro.como_acontece || null,
      canal: registro.canal || null,
      responsavel: registro.responsavel || null,
      indicador: registro.indicador || null,
    },
    { onConflict: 'organization_id,stage_id' }
  )

  if (error) return { ok: false, mensagem: error.message }
  revalidatePath('/dashboard/arquitetura')
  return { ok: true }
}
