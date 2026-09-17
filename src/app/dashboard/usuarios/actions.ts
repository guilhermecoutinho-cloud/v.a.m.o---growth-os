'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type ActionState = {
  ok: boolean
  message: string
  credentials?: { email: string; password: string }
}

/**
 * Toda action abaixo passa por aqui antes de tocar no banco.
 * Sem isso, um aluno logado poderia chamar a Server Action direto
 * e criar o proprio acesso de admin.
 */
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin' ? user : null
}

export async function criarAcesso(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await requireAdmin())) {
    return { ok: false, message: 'Apenas administradores podem criar acessos.' }
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('full_name') ?? '').trim()
  const role = String(formData.get('role') ?? 'student')

  if (!email || !email.includes('@')) {
    return { ok: false, message: 'Informe um e-mail válido.' }
  }
  if (password.length < 8) {
    return { ok: false, message: 'A senha precisa ter ao menos 8 caracteres.' }
  }
  if (role !== 'student' && role !== 'admin' && role !== 'mentor' && role !== 'sales') {
    return { ok: false, message: 'Perfil de acesso inválido.' }
  }

  const admin = createAdminClient()

  // email_confirm: true entrega a conta ja liberada — o comprador entra
  // direto com a senha enviada, sem precisar clicar em link nenhum.
  const { data: criado, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || null },
    // Guardado tambem aqui por rastreabilidade: app_metadata so o
    // servidor escreve, ao contrario de user_metadata.
    app_metadata: { role },
  })

  if (error) {
    const jaExiste = error.message.toLowerCase().includes('already')
    return {
      ok: false,
      message: jaExiste
        ? 'Já existe uma conta com este e-mail.'
        : `Não foi possível criar o acesso: ${error.message}`,
    }
  }

  // O trigger sempre grava 'student': o Supabase preenche o app_metadata
  // depois do insert em auth.users, entao o trigger nao o enxerga a tempo.
  // Para qualquer papel diferente, ajustamos aqui. So a service_role passa
  // pelo trigger anti-escalacao (auth.uid() e nulo para ela).
  if (role !== 'student' && criado.user) {
    const { error: erroPapel } = await admin
      .from('profiles')
      .update({ role })
      .eq('id', criado.user.id)

    if (erroPapel) {
      return {
        ok: false,
        message:
          `Conta criada, mas o perfil ficou como Aluno: ${erroPapel.message}. ` +
          `Ajuste o perfil pelo painel do Supabase.`,
      }
    }
  }

  revalidatePath('/dashboard/usuarios')
  return {
    ok: true,
    message: `Acesso criado para ${email}.`,
    credentials: { email, password },
  }
}

export async function redefinirSenha(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await requireAdmin())) {
    return { ok: false, message: 'Apenas administradores podem alterar senhas.' }
  }

  const userId = String(formData.get('user_id') ?? '')
  const password = String(formData.get('password') ?? '')
  const email = String(formData.get('email') ?? '')

  if (password.length < 8) {
    return { ok: false, message: 'A senha precisa ter ao menos 8 caracteres.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, { password })

  if (error) {
    return { ok: false, message: `Não foi possível alterar a senha: ${error.message}` }
  }

  revalidatePath('/dashboard/usuarios')
  return {
    ok: true,
    message: `Senha atualizada para ${email}.`,
    credentials: { email, password },
  }
}

export async function revogarAcesso(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const atual = await requireAdmin()
  if (!atual) {
    return { ok: false, message: 'Apenas administradores podem revogar acessos.' }
  }

  const userId = String(formData.get('user_id') ?? '')
  const email = String(formData.get('email') ?? '')

  if (userId === atual.id) {
    return { ok: false, message: 'Você não pode revogar o próprio acesso.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) {
    return { ok: false, message: `Não foi possível revogar: ${error.message}` }
  }

  revalidatePath('/dashboard/usuarios')
  return { ok: true, message: `Acesso de ${email} revogado.` }
}
