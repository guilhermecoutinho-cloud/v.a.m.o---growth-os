'use client'

import { useState, useEffect } from 'react'
import { useAnimatedNumber } from '@/lib/use-animated-number'
import { AlertCircle, Target, TrendingUp, Settings2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)
}

export default function Funil3DPage() {
  const [funil, setFunil] = useState({
    leads: 800,
    mql: 400,
    opps: 160,
    vendas: 40,
    ticket: 8750
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFunil({
      ...funil,
      [e.target.name]: parseFloat(e.target.value) || 0
    })
  }

  // Cálculos dinâmicos
  const convLeadMql = funil.leads > 0 ? (funil.mql / funil.leads) * 100 : 0
  const convMqlOpp = funil.mql > 0 ? (funil.opps / funil.mql) * 100 : 0
  const convOppVenda = funil.opps > 0 ? (funil.vendas / funil.opps) * 100 : 0

  const layers = [
    {
      id: 'leads',
      label: 'Leads Gerados',
      val: funil.leads,
      topColor: 'rgba(99, 102, 241, 0.5)',
      baseColor: 'rgba(99, 102, 241, 0.1)',
      topRx: 260, botRx: 200,
      topY: 60, botY: 180,
      conversion: null
    },
    {
      id: 'mql',
      label: 'MQL (Qualificados)',
      val: funil.mql,
      topColor: 'rgba(56, 189, 248, 0.5)',
      baseColor: 'rgba(56, 189, 248, 0.1)',
      topRx: 200, botRx: 140,
      topY: 180, botY: 300,
      conversion: convLeadMql.toFixed(1),
      isMenor: convLeadMql < 10
    },
    {
      id: 'opps',
      label: 'Oportunidades',
      val: funil.opps,
      topColor: 'rgba(20, 184, 166, 0.5)',
      baseColor: 'rgba(20, 184, 166, 0.1)',
      topRx: 140, botRx: 80,
      topY: 300, botY: 420,
      conversion: convMqlOpp.toFixed(1),
      isMenor: convMqlOpp < 20
    },
    {
      id: 'vendas',
      label: 'Clientes (Vendas)',
      val: funil.vendas,
      topColor: 'rgba(217, 119, 6, 0.5)',
      baseColor: 'rgba(217, 119, 6, 0.1)',
      topRx: 80, botRx: 40,
      topY: 420, botY: 540,
      conversion: convOppVenda.toFixed(1),
      isMenor: convOppVenda < 15
    }
  ]

  const perspective = 0.15
  const centerX = 400

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-[1400px] mx-auto px-4">
      
      <div className="flex flex-col items-center text-center space-y-4 mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-widest uppercase mb-2">
          <TrendingUp className="h-4 w-4" /> Simulador de Conversão 3D
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">Seu Funil Atual</h2>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Insira os números reais da sua empresa à esquerda e veja a máquina 3D adaptar o funil e encontrar gargalos em tempo real.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[300px_1fr] xl:grid-cols-[350px_1fr] items-start">
        
        {/* LADO ESQUERDO: PAINEL DE EDIÇÃO */}
        <div className="bg-card p-6 rounded-3xl border border-white/5 shadow-2xl space-y-8 sticky top-8 z-20">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Settings2 className="h-5 w-5 text-primary" />
              Parâmetros Atuais
            </h3>
            <p className="text-xs text-muted-foreground mb-6">Atualize os volumes para ver o funil 3D recalculando tudo ao vivo.</p>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2 group">
              <Label htmlFor="leads" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground group-focus-within:text-indigo-400 transition-colors">Leads Gerados</Label>
              <Input type="number" id="leads" name="leads" value={funil.leads} onChange={handleChange} className="bg-background border-white/5 focus:border-indigo-500/50 h-12 text-lg rounded-xl transition-all" />
            </div>
            
            <div className="space-y-2 group">
              <Label htmlFor="mql" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground group-focus-within:text-sky-400 transition-colors">MQLs (Qualificados)</Label>
              <Input type="number" id="mql" name="mql" value={funil.mql} onChange={handleChange} className="bg-background border-white/5 focus:border-sky-500/50 h-12 text-lg rounded-xl transition-all" />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="opps" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground group-focus-within:text-teal-400 transition-colors">Oportunidades (Opps)</Label>
              <Input type="number" id="opps" name="opps" value={funil.opps} onChange={handleChange} className="bg-background border-white/5 focus:border-teal-500/50 h-12 text-lg rounded-xl transition-all" />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="vendas" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground group-focus-within:text-amber-500 transition-colors">Vendas Fechadas</Label>
              <Input type="number" id="vendas" name="vendas" value={funil.vendas} onChange={handleChange} className="bg-background border-white/5 focus:border-amber-500/50 h-12 text-lg rounded-xl transition-all" />
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2 group">
              <Label htmlFor="ticket" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">Ticket Médio (R$)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input type="number" id="ticket" name="ticket" value={funil.ticket} onChange={handleChange} className="pl-9 bg-background border-white/5 focus:border-primary/50 h-12 text-lg rounded-xl transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: FUNIL 3D SVG */}
        <div className="relative w-full aspect-[800/650] max-h-[85vh] mx-auto select-none pt-10">
          
          <svg 
            viewBox="0 0 800 650" 
            className="w-full h-full drop-shadow-2xl overflow-visible"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {layers.map(layer => (
                <linearGradient key={`grad-${layer.id}`} id={`grad-${layer.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={layer.baseColor} stopOpacity={0.7} />
                  <stop offset="50%" stopColor={layer.baseColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={layer.baseColor} stopOpacity={0.9} />
                </linearGradient>
              ))}
              
              <style>
                {`
                  @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-40px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  .funnel-layer {
                    animation: dropIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                  }
                  .funnel-label {
                    animation: dropIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                  }
                `}
              </style>
            </defs>

            {/* LINHAS PONTILHADAS CONECTORAS (Desenhadas no SVG para não quebrar no CSS) */}
            {layers.map((layer, index) => {
              const midY = (layer.topY + layer.botY) / 2
              const midRx = (layer.topRx + layer.botRx) / 2
              
              return (
                <g 
                  key={`lines-${layer.id}`} 
                  className="funnel-label"
                  style={{ animationDelay: (index * 0.15 + 0.4) + 's' }}
                >
                  {/* Linha Esquerda (Conversão) */}
                  {layer.conversion && (
                    <line 
                      x1={centerX - midRx - 20} 
                      y1={midY} 
                      x2={240} 
                      y2={midY} 
                      stroke="rgba(255,255,255,0.2)" 
                      strokeWidth="1.5" 
                      strokeDasharray="4 4" 
                    />
                  )}
                  {/* Linha Direita (Label) */}
                  <line 
                    x1={centerX + midRx + 20} 
                    y1={midY} 
                    x2={560} 
                    y2={midY} 
                    stroke="rgba(255,255,255,0.2)" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                  />
                </g>
              )
            })}

            {/* DESENHO DOS CONES 3D */}
            {[...layers].reverse().map((layer, i) => {
              const topRy = layer.topRx * perspective
              const botRy = layer.botRx * perspective
              // Reverter o index para o delay correto (top para base)
              const delay = (layers.length - 1 - i) * 0.15
              
              return (
                <g 
                  key={layer.id} 
                  className="funnel-layer hover:brightness-125 transition-all duration-500 cursor-pointer origin-center"
                  style={{ animationDelay: delay + 's' }}
                >
                  {/* Corpo do cone */}
                  <path 
                    d={`M ${centerX - layer.topRx} ${layer.topY} 
                        L ${centerX - layer.botRx} ${layer.botY} 
                        A ${layer.botRx} ${botRy} 0 0 0 ${centerX + layer.botRx} ${layer.botY} 
                        L ${centerX + layer.topRx} ${layer.topY} 
                        Z`} 
                    fill={`url(#grad-${layer.id})`}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1"
                  />
                  
                  {/* Tampa brilhante */}
                  <ellipse 
                    cx={centerX} 
                    cy={layer.topY} 
                    rx={layer.topRx} 
                    ry={topRy} 
                    fill={layer.topColor}
                    fillOpacity={0.8}
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="2"
                  />
                </g>
              )
            })}
          </svg>

          {/* OVERLAYS HTML PERFEITAMENTE ALINHADOS AO CENTRO DOS SEGMENTOS */}
          {layers.map((layer, index) => {
            const delay = index * 0.15
            const midY = (layer.topY + layer.botY) / 2
            
            return (
              <div 
                key={`overlay-${layer.id}`}
                className="absolute w-full h-0 flex items-center funnel-label pointer-events-none"
                style={{
                  top: (midY / 650) * 100 + '%',
                  animationDelay: (delay + 0.4) + 's'
                }}
              >
                
                {/* 1. Label da Esquerda (Conversão) */}
                <div 
                  className="absolute top-0 -translate-y-1/2 flex justify-end"
                  style={{ right: '70%', width: '30%' }}
                >
                  {layer.conversion && (
                    <div className="text-right pointer-events-auto bg-background/40 p-2 md:p-3 rounded-xl backdrop-blur-sm border border-white/5 shadow-lg">
                      <span className="text-[10px] md:text-xs font-semibold uppercase text-muted-foreground tracking-widest block mb-1">Conversão</span>
                      <span className="text-xl md:text-2xl font-bold text-white block">{layer.conversion}%</span>
                      {layer.isMenor && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] md:text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                          <AlertCircle className="h-3.5 w-3.5" /> <span>Investigar</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Número Central (Grande e centralizado na tampa) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 pointer-events-auto">
                  <AnimatedValue value={layer.val} />
                </div>

                {/* 3. Label da Direita (Nome da Etapa) */}
                <div 
                  className="absolute top-0 -translate-y-1/2 flex flex-col justify-center items-start"
                  style={{ left: '70%', width: '30%' }}
                >
                  <div className="pointer-events-auto bg-background/40 p-2 md:p-3 rounded-xl backdrop-blur-sm border border-white/5 shadow-lg">
                    <span className="text-xs md:text-sm font-bold uppercase text-white tracking-widest drop-shadow-md block">
                      {layer.label}
                    </span>
                    {layer.id === 'vendas' && (
                      <div className="mt-3 bg-card/90 backdrop-blur-md border border-border/50 rounded-lg p-3 md:p-4 shadow-xl pointer-events-auto min-w-[150px] md:min-w-[180px]">
                        <div className="text-[10px] md:text-xs text-muted-foreground mb-1 uppercase tracking-widest font-semibold">Ticket Médio</div>
                        <div className="text-sm md:text-base font-semibold text-white mb-3">{formatCurrency(funil.ticket)}</div>
                        <div className="text-[10px] md:text-xs text-primary mb-1 uppercase tracking-widest font-semibold">Receita Mensal</div>
                        <div className="text-lg md:text-2xl font-bold text-primary drop-shadow-sm">{formatCurrency(funil.vendas * funil.ticket)}</div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Componente para animar apenas o valor impresso
function AnimatedValue({ value }: { value: number }) {
  const animatedNumber = useAnimatedNumber(value, 1500)
  
  return (
    <span className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.2)] tracking-tighter">
      {animatedNumber}
    </span>
  )
}
