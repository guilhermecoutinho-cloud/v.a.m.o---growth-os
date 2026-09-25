'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type EstadoRecuperacao = { ok: boolean; mensagem: string }

/**
 * Envia o link de recuperação. A resposta é sempre a mesma, exista ou
 * não a conta: dizer "e-mail não cadastrado" revelaria quem tem acesso
 * à plataforma para quem estivesse testando endereços.
 */
export async function pedirNovaSenha(
  _prev: EstadoRecuperacao,
  formData: FormData
): Promise<EstadoRecuperacao> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!email.includes('@')) {
    return { ok: false, mensagem: 'Informe um e-mail válido.' }
  }

  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: host ? `${proto}://${host}/auth/callback?next=/definir-senha` : undefined,
  })

  return {
    ok: true,
    mensagem: 'Se existir uma conta com este e-mail, o link de acesso chegou na caixa de entrada.',
  }
}
