import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  Target,
  TrendingDown,
  Activity,
  ArrowRight,
  Search,
  PlusCircle,
} from 'lucide-react'
import { carregarSessao, carregarPainel } from '@/lib/vamo/dados'
import { detectarPontos, tituloPonto } from '@/lib/vamo/investigacao'
import {
  receitaDe,
  formatarMoeda,
  formatarTaxa,
  rotuloPeriodo,
  rotuloPeriodoCurto,
} from '@/lib/vamo/calculos'
import { ALAVANCAS, NO_POR_ID } from '@/lib/vamo/modelo'
import { GraficoReceitaLazy } from '@/components/dashboard/grafico-receita-lazy'
import { SemEmpresa } from '@/components/vamo/sem-empresa'
import { SemDados } from '@/components/vamo/sem-dados'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>
}) {
  const params = await searchParams
  const sessao = await carregarSessao(params.org)
  if (!sessao) redirect('/login')

  const org = sessao.organizacaoAtual
  if (!org) return <SemEmpresa papel={sessao.role} />

  const { snapshots, atual, anterior, meta, cenarios, pisos, hipoteses } =
    await carregarPainel(org.id)

  const comOrg = (r: string) => (params.org ? `${r}?org=${params.org}` : r)

  if (!atual) return <SemDados href={comOrg('/dashboard/funil')} />

  const receita = receitaDe(atual)
  const metaMensal = meta?.target_revenue ?? null
  const gap = metaMensal != null && receita != null ? Math.max(0, metaMensal - receita) : null
  const progresso =
    metaMensal != null && receita != null && metaMensal > 0 ? (receita / metaMensal) * 100 : null

  const receitaAnterior = receitaDe(anterior)
  const variacao =
    receita != null && receitaAnterior != null && receitaAnterior > 0
      ? ((receita - receitaAnterior) / receitaAnterior) * 100
      : null

  const cenarioMeta = cenarios.find((c) => c.name === 'meta') ?? null
  const pontos = detectarPontos(atual, cenarioMeta, pisos)
  const principal = pontos.find((p) => p.maiorImpacto) ?? pontos[0] ?? null

  const aTestar = hipoteses.filter((h) => h.status === 'a_testar')

  const dadosGrafico = snapshots
    .map((s) => ({ name: rotuloPeriodoCurto(s.period), receita: receitaDe(s) ?? 0 }))
    .filter((d) => d.receita > 0)

  // Próximos passos seguem o estado real da operação.
  const passos: Array<{ titulo: string; detalhe: string; href: string }> = []
  if (principal) {
    passos.push({
      titulo: `Investigar: ${tituloPonto(principal)}`,
      detalhe:
        principal.impacto != null && principal.impacto > 0
          ? `Impacto potencial de ${formatarMoeda(principal.impacto)}/mês`
          : 'Ponto sinalizado para investigação',
      href: comOrg('/dashboard/funil'),
    })
  }
  if (aTestar.length > 0) {
    passos.push({
      titulo: `Desenhar experimento para: ${aTestar[0].if_action.slice(0, 48)}…`,
      detalhe: `${aTestar.length} hipótese(s) aguardando teste`,
      href: comOrg('/dashboard/hipoteses'),
    })
  }
  if (!metaMensal) {
    passos.push({
      titulo: 'Definir a meta mensal de receita',
      detalhe: 'Sem meta, não dá para calcular o que falta',
      href: comOrg('/dashboard/arquitetura'),
    })
  }
  if (passos.length === 0) {
    passos.push({
      titulo: 'Registrar os números do próximo mês',
      detalhe: 'Manter a série viva é o que permite comparar',
      href: comOrg('/dashboard/funil'),
    })
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Sua Operação de Crescimento
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            {org.name} · {rotuloPeriodo(atual.period)}
          </p>
        </div>
        <Button
          className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          render={<Link href={comOrg('/dashboard/funil')} />}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Diagnóstico
        </Button>
      </header>

      {/* MÉTRICAS */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Metrica
          titulo="Receita do mês"
          valor={formatarMoeda(receita)}
          nota={
            variacao != null
              ? `${variacao >= 0 ? '+' : ''}${variacao.toFixed(1).replace('.', ',')}% vs. mês anterior`
              : 'Registre o próximo mês para ver a evolução'
          }
          icone={DollarSign}
        />
        <Metrica
          titulo="Meta mensal"
          valor={formatarMoeda(metaMensal)}
          nota={metaMensal ? 'Definida na Arquitetura' : 'Ainda não definida'}
          icone={Target}
        />
        <Metrica
          titulo="Gap"
          valor={formatarMoeda(gap)}
          nota={gap != null ? 'Falta para atingir a meta' : 'Depende da meta'}
          icone={TrendingDown}
          alerta
        />
        <Metrica
          titulo="Progresso"
          valor={progresso != null ? formatarTaxa(progresso) : '—'}
          nota={progresso != null ? 'Receita sobre a meta mensal' : 'Depende da meta'}
          icone={Activity}
        />
      </div>

      {/* PONTO DE MAIOR IMPACTO */}
      {principal && (
        <Card className="border-amber-500/30 bg-card">
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
                <Search className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
                  Ponto de maior impacto potencial
                </div>
                <h3 className="mt-0.5 text-lg font-bold text-white">{tituloPonto(principal)}</h3>
                <p className="text-sm text-muted-foreground">
                  {principal.taxaAtual != null && (
                    <>
                      Sua taxa {formatarTaxa(principal.taxaAtual, 2)} · necessária{' '}
                      {formatarTaxa(principal.taxaAlvo)} ·{' '}
                    </>
                  )}
                  Alavanca {ALAVANCAS[NO_POR_ID[principal.no].alavanca].numero}{' '}
                  {ALAVANCAS[NO_POR_ID[principal.no].alavanca].nome}
                </p>
              </div>
            </div>
            <Button variant="outline" render={<Link href={comOrg('/dashboard/funil')} />}>
              Investigar
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* GRÁFICO E PASSOS */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="border-border/60 bg-card lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-xl text-white">Evolução da Receita</CardTitle>
            <CardDescription>
              {dadosGrafico.length > 1
                ? `Últimos ${dadosGrafico.length} meses registrados`
                : 'Registre mais um mês para ver a curva'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dadosGrafico.length > 1 ? (
              <GraficoReceitaLazy data={dadosGrafico} />
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
                Um único mês não forma série. Registre o próximo.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl text-white">Próximos Passos</CardTitle>
            <CardDescription>Baseados no estado atual da sua operação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {passos.map((p, i) => (
                <Link
                  key={p.titulo}
                  href={p.href}
                  className="group flex items-start gap-4 rounded-lg transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white transition-colors group-hover:text-primary">
                      {p.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.detalhe}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 -translate-x-2 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Metrica({
  titulo,
  valor,
  nota,
  icone: Icone,
  alerta,
}: {
  titulo: string
  valor: string
  nota: string
  icone: typeof DollarSign
  alerta?: boolean
}) {
  return (
    <Card
      className={
        alerta
          ? 'border-destructive/20 bg-card shadow-xl'
          : 'border-border/60 bg-card shadow-xl'
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {titulo}
        </CardTitle>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            alerta ? 'bg-destructive/10' : 'bg-primary/10'
          }`}
        >
          <Icone className={`h-4 w-4 ${alerta ? 'text-destructive' : 'text-primary'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-white">{valor}</div>
        <p className="mt-1 text-xs text-muted-foreground">{nota}</p>
      </CardContent>
    </Card>
  )
}
