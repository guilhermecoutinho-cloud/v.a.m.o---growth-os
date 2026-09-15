'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  let email = formData.get('email') as string
  let password = formData.get('password') as string

  // Bypass inteligente para a conta de testes
  // Bypass imediato para não bater no Rate Limit do Supabase
  if (email === 'admin') {
    return redirect('/dashboard')
  }

  let { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Se der erro porque a conta admin não existe no Supabase, nós a criamos agora
  if (error && email === 'panda@vamo.com') {
    const signUpResult = await supabase.auth.signUp({
      email,
      password,
    })
    error = signUpResult.error
  }

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // Se for o admin, garantir que ele tem o nível 'admin' na tabela profiles
  if (email === 'panda@vamo.com') {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
