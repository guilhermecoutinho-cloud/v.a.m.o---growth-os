import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuadroLeads } from './quadro-leads'

export default async function LeadsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const papel =
    (user.app_metadata?.role as string) ??
    (await supabase.from('profiles').select('role').eq('id', user.id).single()).data?.role
  if (papel !== 'sales' && papel !== 'admin') redirect('/dashboard')

  // O RLS já limita o vendedor aos próprios leads.
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Leads</h1>
        <p className="mt-1.5 text-muted-foreground">
          Do primeiro contato à conversão em aluno, com o diagnóstico no meio do caminho.
        </p>
      </header>

      <QuadroLeads leads={leads ?? []} />
    </div>
  )
}
