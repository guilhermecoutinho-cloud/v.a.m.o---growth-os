import { Sidebar } from '@/components/layout/sidebar'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // O papel ja viaja no token (app_metadata), entao o menu nao precisa
  // de uma segunda ida ao banco a cada navegacao. So consultamos a
  // tabela para contas antigas, criadas antes de o papel ir para la.
  let role = user?.app_metadata?.role as string | undefined

  if (user && !role) {
    const { data: perfil } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = perfil?.role
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar email={user?.email} role={role} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-8">{children}</div>
      </main>
    </div>
  )
}
