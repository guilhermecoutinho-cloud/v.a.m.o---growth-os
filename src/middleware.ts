import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Sem as variaveis, createServerClient lanca excecao. Como o matcher
  // cobre o site inteiro, isso derrubaria todas as rotas com
  // MIDDLEWARE_INVOCATION_FAILED em vez de mostrar qualquer pagina.
  // Melhor deixar passar: as paginas protegidas ainda checam a sessao
  // no servidor, e o erro fica legivel nos logs.
  if (!url || !anonKey) {
    console.error(
      '[middleware] Supabase nao configurado: defina NEXT_PUBLIC_SUPABASE_URL ' +
        'e NEXT_PUBLIC_SUPABASE_ANON_KEY nas variaveis de ambiente.'
    )
    return supabaseResponse
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Uma falha de rede aqui nao pode derrubar o site inteiro: sem usuario,
  // a rota protegida manda para o login, que e o comportamento seguro.
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (erro) {
    console.error('[middleware] Falha ao consultar a sessao:', erro)
  }

  // Protect private routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                           request.nextUrl.pathname.startsWith('/sales') ||
                           request.nextUrl.pathname.startsWith('/onboarding')

  if (!user && isProtectedRoute) {
    const destino = request.nextUrl.clone()
    destino.pathname = '/login'
    return NextResponse.redirect(destino)
  }

  // Redirect to dashboard if logged in and trying to access login
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const destino = request.nextUrl.clone()
    destino.pathname = '/dashboard'
    return NextResponse.redirect(destino)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
