import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buscarPisos } from '@/lib/vamo/dados'
import { ReuniaoDiagnostica } from './reuniao-diagnostica'
import { ArrowLeft } from 'lucide-react'

export default async function ReuniaoPage({
  params,
}: {
  params: Promise<{ leadId: string }>
}) {
  const { leadId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const papel =
    (user.app_metadata?.role as string) ??
    (await supabase.from('profiles').select('role').eq('id', user.id).single()).data?.role
  if (papel !== 'sales' && papel !== 'admin') redirect('/dashboard')

  const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single()
  if (!lead) notFound()

  const [{ data: diags }, pisos] = await Promise.all([
    supabase
      .from('sales_diagnostics')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(1),
    buscarPisos(),
  ])

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para os leads
      </Link>

      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          {lead.company_name}
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          Reunião diagnóstica · 45 minutos
          {lead.contact_name ? ` · com ${lead.contact_name}` : ''}
        </p>
      </header>

      <ReuniaoDiagnostica
        lead={lead}
        diagnosticoAnterior={diags?.[0] ?? null}
        pisos={pisos}
      />
    </div>
  )
}
