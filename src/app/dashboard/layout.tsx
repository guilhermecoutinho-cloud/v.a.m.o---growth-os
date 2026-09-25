import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { carregarSessao } from '@/lib/vamo/dados'

export default async function DashboardLayout({
  children,
  searchParams,
}: {
  children: React.ReactNode
  searchParams?: Promise<{ org?: string }>
}) {
  const params = (await searchParams) ?? {}
  const sessao = await carregarSessao(params.org)

  if (!sessao) redirect('/login')

  return (
    <div className="flex min-h-screen bg-background">
      {/* Suspense porque a barra lê a URL (useSearchParams). */}
      <Suspense fallback={<div className="w-64 shrink-0 border-r border-border/50" />}>
        <Sidebar
          email={sessao.email}
          role={sessao.role}
          organizacoes={sessao.organizacoes}
          organizacaoAtual={sessao.organizacaoAtual}
        />
      </Suspense>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl p-6 sm:p-8">{children}</div>
      </main>
    </div>
  )
}
