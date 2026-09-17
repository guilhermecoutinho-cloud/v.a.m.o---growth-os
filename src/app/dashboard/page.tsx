import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DollarSign, Target, TrendingDown, Activity, ArrowRight } from 'lucide-react'
import { NovoDiagnostico } from '@/components/dashboard/novo-diagnostico'
import { GraficoReceitaLazy } from '@/components/dashboard/grafico-receita-lazy'

const chartData = [
  { name: 'Jan', receita: 120000 },
  { name: 'Fev', receita: 180000 },
  { name: 'Mar', receita: 220000 },
  { name: 'Abr', receita: 260000 },
  { name: 'Mai', receita: 310000 },
  { name: 'Jun', receita: 350000 },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)

const METRICAS = [
  {
    titulo: 'RECEITA ATUAL',
    valor: 350000,
    nota: '+12% em relação ao mês passado',
    icone: DollarSign,
  },
  { titulo: 'META', valor: 500000, nota: 'Objetivo anual', icone: Target },
  {
    titulo: 'GAP',
    valor: 150000,
    nota: 'Faltam para atingir a meta',
    icone: TrendingDown,
    alerta: true,
  },
]

const PASSOS = [
  {
    numero: 1,
    titulo: 'Definir Hipótese Principal',
    detalhe: 'Etapa de Conversão (MQL → Opps)',
    ativo: true,
  },
  {
    numero: 2,
    titulo: 'Lançar Experimento',
    detalhe: 'Depende da hipótese validada',
    ativo: false,
  },
  {
    numero: 3,
    titulo: 'Ajustar Arquitetura',
    detalhe: 'Revisar metas trimestrais',
    ativo: false,
  },
]

export default function DashboardPage() {
  const receitaAtual = 350000
  const meta = 500000
  const progresso = (receitaAtual / meta) * 100

  return (
    <div className="space-y-8">
      {/* HEADER DO DASHBOARD */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">
            Sua Máquina de Crescimento
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Antes de tentar crescer, precisamos entender como sua empresa cresce
            hoje.
          </p>
        </div>
        <NovoDiagnostico />
      </div>

      {/* MÉTRICAS PRINCIPAIS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {METRICAS.map(({ titulo, valor, nota, icone: Icone, alerta }) => (
          <Card
            key={titulo}
            className={`bg-gradient-to-br from-card to-card/50 shadow-xl transition-all duration-300 ${
              alerta
                ? 'border-destructive/20 hover:shadow-destructive/5'
                : 'border-border/50 hover:shadow-primary/5'
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {titulo}
              </CardTitle>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  alerta ? 'bg-destructive/10' : 'bg-primary/10'
                }`}
              >
                <Icone
                  className={`h-4 w-4 ${alerta ? 'text-destructive' : 'text-primary'}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-white">
                {formatCurrency(valor)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{nota}</p>
            </CardContent>
          </Card>
        ))}

        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-xl transition-all duration-300 hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PROGRESSO
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-white">
              {progresso.toFixed(1)}%
            </div>
            <Progress value={progresso} className="mt-3 h-2 overflow-hidden bg-muted">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${progresso}%` }}
              />
            </Progress>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICOS E PASSOS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/50 bg-gradient-to-br from-card to-card/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Evolução da Receita
            </CardTitle>
            <CardDescription>
              Crescimento acumulado ao longo dos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GraficoReceitaLazy data={chartData} />
          </CardContent>
        </Card>

        <Card className="relative col-span-3 overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/30 shadow-xl">
          <div className="pointer-events-none absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
          <CardHeader>
            <CardTitle className="text-xl text-white">Próximos Passos</CardTitle>
            <CardDescription>
              Ações recomendadas baseadas no seu funil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {PASSOS.map(({ numero, titulo, detalhe, ativo }) => (
                <div
                  key={numero}
                  className={`group flex items-start gap-4 ${
                    ativo ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                      ativo
                        ? 'border-primary/20 bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground'
                        : 'border-border bg-muted text-muted-foreground'
                    }`}
                  >
                    {numero}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p
                      className={`text-base font-semibold leading-none text-white ${
                        ativo ? 'transition-colors group-hover:text-primary' : ''
                      }`}
                    >
                      {titulo}
                    </p>
                    <p className="text-sm text-muted-foreground">{detalhe}</p>
                  </div>
                  {ativo && (
                    <ArrowRight className="h-5 w-5 -translate-x-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
