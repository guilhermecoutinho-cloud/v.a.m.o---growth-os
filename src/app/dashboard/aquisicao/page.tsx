import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { carregarSessao, buscarSnapshot, periodoAtual } from '@/lib/vamo/dados'
import { TabelaCanais } from './tabela-canais'
import { SeletorPeriodo } from '../funil/seletor-periodo'
import { SemEmpresa } from '@/components/vamo/sem-empresa'

export type LinhaCanal = {
  id: string
  channel: string
  channel_other: string | null
  investment: number | null
  reach: number | null
  leads: number | null
  sales: number | null
}

export default async function AquisicaoPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; periodo?: string }>
}) {
  const params = await searchParams
  const sessao = await carregarSessao(params.org)
  if (!sessao) redirect('/login')

  const org = sessao.organizacaoAtual
  if (!org) return <SemEmpresa papel={sessao.role} />

  const periodo = params.periodo ?? periodoAtual()
  const supabase = await createClient()

  const [{ data: canais }, snapshot] = await Promise.all([
    supabase
      .from('acquisition_channels')
      .select('id, channel, channel_other, investment, reach, leads, sales')
      .eq('organization_id', org.id)
      .eq('period', periodo),
    buscarSnapshot(org.id, periodo),
  ])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Aquisição
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            De onde vêm os leads e quanto cada canal custa.
          </p>
        </div>
        <SeletorPeriodo periodo={periodo} org={params.org} base="/dashboard/aquisicao" />
      </header>

      <TabelaCanais
        key={periodo}
        organizationId={org.id}
        periodo={periodo}
        canais={(canais ?? []) as LinhaCanal[]}
        leadsDoFunil={snapshot?.leads ?? null}
      />
    </div>
  )
}
