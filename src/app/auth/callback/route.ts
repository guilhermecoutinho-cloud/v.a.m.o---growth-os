import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Porta de entrada dos links enviados por e-mail (convite e recuperação
 * de senha).
 *
 * O Supabase manda a pessoa para cá com um código de uso único. Aqui ele
 * vira sessão, e só então dá para definir a senha — sem esta troca, a
 * pessoa chegava ao login sem ter senha alguma e ficava presa.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const tipo = searchParams.get('type')
  const proximo = searchParams.get('next') ?? '/definir-senha'

  const supabase = await createClient()

  // Fluxo novo (PKCE): ?code=
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${proximo}`)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('O link expirou ou já foi usado. Peça um novo.')}`
    )
  }

  // Fluxo por token_hash: ?token_hash=&type=invite|recovery
  if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({
      type: tipo as 'invite' | 'recovery' | 'email',
      token_hash: tokenHash,
    })
    if (!error) return NextResponse.redirect(`${origin}${proximo}`)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('O link expirou ou já foi usado. Peça um novo.')}`
    )
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('Link inválido. Peça um novo acesso.')}`
  )
}
