'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type EstadoSenha = { ok: boolean; mensagem: string }

/**
 * Define a senha de quem chegou por um link de convite ou recuperação.
 * Exige sessão: sem ela, qualquer pessoa poderia trocar a senha alheia.
 */
export async function definirSenha(
  _prev: EstadoSenha,
  formData: FormData
): Promise<EstadoSenha> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false,
      mensagem: 'Seu link expirou. Peça um novo acesso ao suporte.',
    }
  }

  const senha = String(formData.get('password') ?? '')
  const confirmacao = String(formData.get('confirm') ?? '')

  if (senha.length < 8) {
    return { ok: false, mensagem: 'A senha precisa ter ao menos 8 caracteres.' }
  }
  if (senha !== confirmacao) {
    return { ok: false, mensagem: 'As duas senhas não são iguais.' }
  }

  const { error } = await supabase.auth.updateUser({ password: senha })
  if (error) {
    return { ok: false, mensagem: `Não foi possível salvar: ${error.message}` }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
