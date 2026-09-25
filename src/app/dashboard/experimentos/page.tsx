import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { carregarSessao, listarHipoteses } from '@/lib/vamo/dados'
import { ListaExperimentos } from './lista-experimentos'
import { SemEmpresa } from '@/components/vamo/sem-empresa'
import { SemProduto } from '@/components/vamo/sem-produto'
import { rotaLiberada } from '@/lib/vamo/menu'

export type Experimento = {
  id: string
  hypothesis_id: string | null
  title: string
  kpi: string
  baseline: number | null
  target: number | null
  result: number | null
  starts_on: string | null
  ends_on: string | null
  owner_name: string | null
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado'
  learning: string | null
}

export default async function ExperimentosPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>
}) {
  const params = await searchParams
  const sessao = await carregarSessao(params.org)
  if (!sessao) redirect('/login')

  // O cadeado da barra lateral so esconde o item; a rota tambem
  // precisa recusar quem chega por URL digitada.
  if (!rotaLiberada('/dashboard/experimentos', sessao.role)) return <SemProduto tela="Experimentos" />

  const org = sessao.organizacaoAtual
  if (!org) return <SemEmpresa papel={sessao.role} />

  const supabase = await createClient()
  const [{ data: experimentos }, hipoteses] = await Promise.all([
    supabase
      .from('experiments')
      .select('*')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false }),
    listarHipoteses(org.id),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Experimentos
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          Onde a hipótese vira teste, o teste vira número e o número vira aprendizado.
        </p>
      </header>

      <ListaExperimentos
        organizationId={org.id}
        experimentos={(experimentos ?? []) as Experimento[]}
        hipoteses={hipoteses.map((h) => ({
          id: h.id,
          resumo: `${h.if_action.slice(0, 60)}${h.if_action.length > 60 ? '…' : ''}`,
          status: h.status,
        }))}
        org={params.org}
      />
    </div>
  )
}
