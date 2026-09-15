'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function DiagnosticoComercialPage() {
  const [etapa, setEtapa] = useState<'form' | 'resultado'>('form')
  
  const [formData, setFormData] = useState({
    nome: '', empresa: '', cargo: '', segmento: '',
    receitaAtual: 0, meta: 0, ticket: 0,
    investimento: 0, leads: 0, canais: '',
    mql: 0, opps: 0, vendas: 0,
    recorrencia: 'nao', ltv: 0
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const calcularResultado = () => {
    setEtapa('resultado')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  if (etapa === 'resultado') {
    const gap = formData.meta - formData.receitaAtual
    const taxaLeadMql = formData.leads ? (formData.mql / formData.leads) * 100 : 0
    const taxaMqlOpp = formData.mql ? (formData.opps / formData.mql) * 100 : 0
    const taxaOppVenda = formData.opps ? (formData.vendas / formData.opps) * 100 : 0

    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Resultado do Diagnóstico</h2>
          <p className="text-muted-foreground mt-1">Visão consolidada para apresentação ao lead.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">RECEITA ATUAL</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(formData.receitaAtual)}</div></CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">META</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(formData.meta)}</div></CardContent>
          </Card>
          <Card className="bg-card border-destructive/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-destructive">GAP</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">{formatCurrency(gap)}</div></CardContent>
          </Card>
        </div>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Funil e Conversões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center text-center">
              <div>
                <div className="text-2xl font-bold">{formData.leads}</div>
                <div className="text-xs text-muted-foreground uppercase">Leads</div>
              </div>
              <div className="text-primary font-mono text-sm">→ {taxaLeadMql.toFixed(1)}% →</div>
              <div>
                <div className="text-2xl font-bold">{formData.mql}</div>
                <div className="text-xs text-muted-foreground uppercase">MQL</div>
              </div>
              <div className="text-primary font-mono text-sm">→ {taxaMqlOpp.toFixed(1)}% →</div>
              <div>
                <div className="text-2xl font-bold">{formData.opps}</div>
                <div className="text-xs text-muted-foreground uppercase">Opps</div>
              </div>
              <div className="text-primary font-mono text-sm">→ {taxaOppVenda.toFixed(1)}% →</div>
              <div>
                <div className="text-2xl font-bold">{formData.vendas}</div>
                <div className="text-xs text-muted-foreground uppercase">Vendas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-primary/50">
          <CardHeader>
            <CardTitle>Hipótese Inicial (Comercial)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Onde o empresário acredita que está o principal gargalo?</Label>
              <Textarea placeholder="Ex: Problema na qualificação de leads..." className="bg-input" />
            </div>
            <div className="space-y-2">
              <Label>Qual evidência sustenta isso?</Label>
              <Textarea placeholder="Ex: Baixa taxa de MQL para Opp..." className="bg-input" />
            </div>
            <div className="space-y-2">
              <Label>Qual dado está faltando?</Label>
              <Textarea placeholder="Ex: Não sabem o CPL exato..." className="bg-input" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button variant="outline" onClick={() => setEtapa('form')}>Voltar e Editar</Button>
            <div className="space-x-2">
              <Select defaultValue="vamo">
                <SelectTrigger className="w-[200px] inline-flex bg-input mr-2">
                  <SelectValue placeholder="Recomendação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vamo">V.A.M.O. (R$ 4.997)</SelectItem>
                  <SelectItem value="estruturacao">Estruturação (R$ 14k)</SelectItem>
                  <SelectItem value="gaas">GaaS (R$ 48k)</SelectItem>
                  <SelectItem value="sem_fit">Sem Fit</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Converter em Aluno
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Diagnóstico Comercial</h2>
        <p className="text-muted-foreground mt-1">Preencha os dados do lead durante a reunião.</p>
      </div>

      <Card className="bg-card">
        <CardHeader><CardTitle>Contexto</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Nome</Label><Input name="nome" value={formData.nome} onChange={handleChange} className="bg-input" /></div>
          <div className="space-y-2"><Label>Empresa</Label><Input name="empresa" value={formData.empresa} onChange={handleChange} className="bg-input" /></div>
          <div className="space-y-2"><Label>Cargo</Label><Input name="cargo" value={formData.cargo} onChange={handleChange} className="bg-input" /></div>
          <div className="space-y-2"><Label>Segmento</Label><Input name="segmento" value={formData.segmento} onChange={handleChange} className="bg-input" /></div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader><CardTitle>Financeiro</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Receita Atual (R$)</Label><Input type="number" name="receitaAtual" value={formData.receitaAtual || ''} onChange={handleChange} className="bg-input" /></div>
          <div className="space-y-2"><Label>Meta (R$)</Label><Input type="number" name="meta" value={formData.meta || ''} onChange={handleChange} className="bg-input" /></div>
          <div className="space-y-2"><Label>Ticket (R$)</Label><Input type="number" name="ticket" value={formData.ticket || ''} onChange={handleChange} className="bg-input" /></div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader><CardTitle>Aquisição & Comercial</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2"><Label>Investimento</Label><Input type="number" name="investimento" value={formData.investimento || ''} onChange={handleChange} className="bg-input" /></div>
          <div className="space-y-2"><Label>Leads</Label><Input type="number" name="leads" value={formData.leads || ''} onChange={handleChange} className="bg-input" /></div>
          <div className="space-y-2"><Label>MQL</Label><Input type="number" name="mql" value={formData.mql || ''} onChange={handleChange} className="bg-input" /></div>
          <div className="space-y-2"><Label>Oportunidades</Label><Input type="number" name="opps" value={formData.opps || ''} onChange={handleChange} className="bg-input" /></div>
          <div className="space-y-2"><Label>Vendas</Label><Input type="number" name="vendas" value={formData.vendas || ''} onChange={handleChange} className="bg-input" /></div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={calcularResultado} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
          Gerar Visão do Funil
        </Button>
      </div>
    </div>
  )
}
