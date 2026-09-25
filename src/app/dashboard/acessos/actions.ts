'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type ActionState = {
  ok: boolean
  message: string
}

/**
 * Toda action passa por aqui antes de tocar no banco. Sem isso, um
 * aluno logado poderia chamar a Server Action direto e criar o próprio
 * acesso de administrador.
 */
async function exigirAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const papel =
    (user.app_metadata?.role as string) ??
    (await supabase.from('profiles').select('role').eq('id', user.id).single()).data?.role

  return papel === 'admin' ? user : null
}

/**
 * Para onde o link do e-mail leva. Precisa ser /auth/callback: é lá que
 * o código vira sessão. Apontar direto para /login deixaria a pessoa
 * numa tela de senha sem ter senha para digitar.
 */
async function urlDeRedirecionamento() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')
  return host ? `${proto}://${host}/auth/callback?next=/definir-senha` : undefined
}

/**
 * Cria o acesso por CONVITE: o Supabase envia um e-mail e a pessoa
 * define a própria senha. O admin nunca digita nem transporta senha.
 */
export async function convidarAcesso(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await exigirAdmin())) {
    return { ok: false, message: 'Apenas administradores podem convidar.' }
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const nome = String(formData.get('full_name') ?? '').trim()
  const papel = String(formData.get('role') ?? 'student')
  const empresaExistente = String(formData.get('organization_id') ?? '')
  const empresaNova = String(formData.get('new_organization') ?? '').trim()
  const mentorId = String(formData.get('mentor_id') ?? '')

  if (!email.includes('@')) return { ok: false, message: 'Informe um e-mail válido.' }
  if (!['student', 'mentor', 'sales', 'admin'].includes(papel)) {
    return { ok: false, message: 'Perfil de acesso inválido.' }
  }
  if (papel === 'student' && !empresaExistente && !empresaNova) {
    return { ok: false, message: 'Escolha uma empresa ou crie uma nova para o aluno.' }
  }

  const admin = createAdminClient()

  // A empresa vem antes do convite: se falhar, ninguém é criado.
  let organizationId = empresaExistente || null
  if (!organizationId && empresaNova) {
    const modelo = String(formData.get('business_model') ?? 'transacional')
    const { data, error } = await admin
      .from('organizations')
      .insert({
        name: empresaNova,
        segment: String(formData.get('segment') ?? '').trim() || null,
        employees_count: String(formData.get('employees_count') ?? '').trim() || null,
        business_model: modelo === 'recorrente' ? 'recorrente' : 'transacional',
      })
      .select('id')
      .single()
    if (error) return { ok: false, message: `Não foi possível criar a empresa: ${error.message}` }
    organizationId = data.id
  }

  const { data: convidado, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: nome || null },
    redirectTo: await urlDeRedirecionamento(),
  })

  let userId = convidado?.user?.id
  let reaproveitou = false

  if (error) {
    const jaExiste = error.message.toLowerCase().includes('already')
    if (!jaExiste) {
      return { ok: false, message: `Não foi possível convidar: ${error.message}` }
    }
    // A conta já existe: em vez de abandonar a empresa recém-criada,
    // vinculamos a pessoa a ela. Antes a função voltava aqui e a
    // empresa ficava órfã, sem nenhum membro.
    const { data: lista } = await admin.auth.admin.listUsers()
    userId = lista?.users.find((u) => u.email?.toLowerCase() === email)?.id
    reaproveitou = true
    if (!userId) {
      return { ok: false, message: 'Já existe uma conta com este e-mail, mas não a encontrei.' }
    }
  }

  if (!userId) return { ok: false, message: 'Convite enviado, mas o usuário não foi retornado.' }

  // O papel vai em app_metadata, que só o servidor escreve. O trigger
  // do banco grava 'student' por padrão e ignora o que vier do cliente.
  await admin.auth.admin.updateUserById(userId, { app_metadata: { role: papel } })
  await admin.from('profiles').update({ role: papel, full_name: nome || null }).eq('id', userId)

  if (organizationId) {
    // upsert: repetir o vínculo não gera erro nem duplicata.
    const { error: erroVinculo } = await admin.from('organization_members').upsert(
      {
        organization_id: organizationId,
        user_id: userId,
        role: papel,
        member_role: 'owner',
      },
      { onConflict: 'organization_id,user_id' }
    )
    if (erroVinculo) {
      return {
        ok: false,
        message: `Conta pronta, mas o vínculo com a empresa falhou: ${erroVinculo.message}`,
      }
    }
    if (mentorId) {
      await admin
        .from('mentor_assignments')
        .upsert({ organization_id: organizationId, mentor_id: mentorId })
    }
  }

  revalidatePath('/dashboard', 'layout')
  return {
    ok: true,
    message: reaproveitou
      ? `${email} já tinha conta e foi vinculado à empresa.`
      : `Convite enviado para ${email}.`,
  }
}

/** Reenvia o link de acesso; a pessoa define a senha por e-mail. */
export async function reenviarAcesso(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await exigirAdmin())) {
    return { ok: false, message: 'Apenas administradores podem reenviar.' }
  }

  const email = String(formData.get('email') ?? '')
  const admin = createAdminClient()

  const { error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: await urlDeRedirecionamento() },
  })

  if (error) return { ok: false, message: `Não foi possível reenviar: ${error.message}` }
  return { ok: true, message: `Link de acesso reenviado para ${email}.` }
}

export async function revogarAcesso(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const atual = await exigirAdmin()
  if (!atual) return { ok: false, message: 'Apenas administradores podem revogar.' }

  const userId = String(formData.get('user_id') ?? '')
  const email = String(formData.get('email') ?? '')

  if (userId === atual.id) {
    return { ok: false, message: 'Você não pode revogar o próprio acesso.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { ok: false, message: `Não foi possível revogar: ${error.message}` }

  revalidatePath('/dashboard/acessos')
  return { ok: true, message: `Acesso de ${email} revogado.` }
}
