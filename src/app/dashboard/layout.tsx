import { Sidebar } from '@/components/layout/sidebar'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar email={user?.email} role={perfil?.role} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
