import { redirect } from 'next/navigation'

/**
 * A tela mudou de /dashboard/usuarios para /dashboard/acessos, para
 * casar com o nome que aparece no menu. Este redirect mantém links
 * antigos funcionando.
 */
export default function UsuariosRedirect() {
  redirect('/dashboard/acessos')
}
