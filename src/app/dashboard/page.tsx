'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Target, TrendingDown, Activity, ArrowRight } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const chartData = [
  { name: "Jan", receita: 120000 },
  { name: "Fev", receita: 180000 },
  { name: "Mar", receita: 220000 },
  { name: "Abr", receita: 260000 },
  { name: "Mai", receita: 310000 },
  { name: "Jun", receita: 350000 },
]

export default function DashboardPage() {
  const receitaAtual = 350000
  const meta = 500000
  const gap = meta - receitaAtual
  const progresso = (receitaAtual / meta) * 100

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER DO DASHBOARD */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">Sua Máquina de Crescimento</h2>
          <p className="text-muted-foreground mt-2 text-lg">Antes de tentar crescer, precisamos entender como sua empresa cresce hoje.</p>
        </div>
        
        <Dialog>
          <DialogTrigger
            render={
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_15px_rgba(72,209,122,0.3)] transition-all" />
            }
          >
            <Activity className="mr-2 h-4 w-4" />
            Novo Diagnóstico
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] bg-card border-border/50 text-white shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Iniciar Novo Diagnóstico</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                Vamos identificar os maiores gargalos da sua máquina. Preencha os dados básicos para a IA iniciar a análise.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="url">Site ou Landing Page da sua empresa</Label>
                <Input id="url" placeholder="https://suaempresa.com.br" className="bg-background/50 border-white/10 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desafio">Qual seu maior gargalo hoje?</Label>
                <select id="desafio" className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 text-white">
                  <option value="leads" className="bg-card text-white">Gerar mais Leads (Topo de Funil)</option>
                  <option value="vendas" className="bg-card text-white">Converter Leads em Vendas (Fundo de Funil)</option>
                  <option value="retencao" className="bg-card text-white">Reter clientes e evitar Churn (Pós-venda)</option>
                  <option value="dados" className="bg-card text-white">Não tenho clareza dos meus números</option>
                </select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <DialogClose
                render={
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" />
                }
              >
                Cancelar
              </DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                Iniciar Análise
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* MÉTRICAS PRINCIPAIS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">RECEITA ATUAL</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(receitaAtual)}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">META</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(meta)}</div>
            <p className="text-xs text-muted-foreground mt-1">Objetivo anual</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-destructive/20 shadow-xl hover:shadow-destructive/5 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">GAP</CardTitle>
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(gap)}</div>
            <p className="text-xs text-muted-foreground mt-1">Faltam para atingir a meta</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">PROGRESSO</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">{progresso.toFixed(1)}%</div>
            <Progress value={progresso} className="mt-3 h-2 bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progresso}%` }} />
            </Progress>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICOS E PASSOS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* GRÁFICO */}
        <Card className="col-span-4 bg-gradient-to-br from-card to-card/30 border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">Evolução da Receita</CardTitle>
            <CardDescription>Crescimento acumulado ao longo dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D68F" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D68F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="#8C9690" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#8C9690" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `R$${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#101513', borderColor: '#232c27', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#00D68F' }}
                    formatter={(value) => [formatCurrency(Number(value ?? 0)), "Receita"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="#00D68F" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorReceita)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* PRÓXIMOS PASSOS */}
        <Card className="col-span-3 bg-gradient-to-br from-card to-card/30 border-border/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          <CardHeader>
            <CardTitle className="text-xl text-white">Próximos Passos</CardTitle>
            <CardDescription>Ações recomendadas baseadas no seu funil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              <div className="flex items-start gap-4 group cursor-pointer">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  1
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-base font-semibold leading-none text-white group-hover:text-primary transition-colors">Definir Hipótese Principal</p>
                  <p className="text-sm text-muted-foreground">Etapa de Conversão (MQL → Opps)</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>

              <div className="flex items-start gap-4 group cursor-not-allowed opacity-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border">
                  2
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold leading-none text-white">Lançar Experimento</p>
                  <p className="text-sm text-muted-foreground">Depende da hipótese validada</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group cursor-not-allowed opacity-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border">
                  3
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold leading-none text-white">Ajustar Arquitetura</p>
                  <p className="text-sm text-muted-foreground">Revisar metas trimestrais</p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
