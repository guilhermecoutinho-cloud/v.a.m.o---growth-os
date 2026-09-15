'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target, TrendingUp, Zap, Filter, Users, Trophy, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

// Hook animado para números
function useAnimatedNumber(end: number, duration: number = 800) {
  const [count, setCount] = useState(end)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number
    const startValue = count

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      setCount(startValue + (end - startValue) * easeProgress)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, count])

  return Math.floor(count)
}

function AnimatedValue({ value, isCurrency = false }: { value: number, isCurrency?: boolean }) {
  const count = useAnimatedNumber(value)
  if (isCurrency) {
    return <>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(count)}</>
  }
  return <>{count.toLocaleString('pt-BR')}</>
}

// Componente de Slider Customizado e Premium
const PremiumSlider = ({ 
  label, value, min, max, step = 1, onChange, isCurrency = false, isPercent = false, color = "primary"
}: { 
  label: string, value: number, min: number, max: number, step?: number, onChange: (val: number) => void, isCurrency?: boolean, isPercent?: boolean, color?: string
}) => {
  const displayValue = isCurrency 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
    : isPercent ? `${value}%` : value.toLocaleString('pt-BR')

  const percentage = ((value - min) / (max - min)) * 100

  // Cores dinâmicas
  const trackColor = color === 'primary' ? 'bg-[#00D68F]' : color === 'blue' ? 'bg-indigo-500' : 'bg-emerald-500'
  const thumbGlow = color === 'primary' ? 'shadow-[0_0_15px_rgba(72,209,122,0.8)]' : color === 'blue' ? 'shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'shadow-[0_0_15px_rgba(16,185,129,0.8)]'

  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-center">
        <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground group-hover:text-white transition-colors">{label}</Label>
        <span className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-full">{displayValue}</span>
      </div>
      <div className="relative h-2 rounded-full bg-white/5 cursor-pointer flex items-center">
        {/* Fill */}
        <div className={cn("absolute left-0 h-full rounded-full transition-all duration-75", trackColor)} style={{ width: `${percentage}%` }}></div>
        {/* Input real invisível por cima para manter acessibilidade e interatividade nativa */}
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Thumb customizado */}
        <div 
          className={cn("absolute w-4 h-4 bg-white rounded-full transition-all duration-75 -ml-2 z-0", thumbGlow)}
          style={{ left: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

export default function ArquiteturaReceitaPage() {
  const [inputs, setInputs] = useState({
    meta: 500000,
    ticket: 8750,
    convOppVenda: 25,
    convMqlOpp: 40,
    convLeadMql: 50,
    cpl: 30
  })

  const handleChange = (name: string, value: number) => {
    setInputs(prev => ({ ...prev, [name]: value }))
  }

  // Cálculos do Funil Reverso
  const vendasNecessarias = inputs.meta / (inputs.ticket || 1)
  const oppNecessarias = vendasNecessarias / ((inputs.convOppVenda || 1) / 100)
  const mqlNecessarios = oppNecessarias / ((inputs.convMqlOpp || 1) / 100)
  const leadsNecessarios = mqlNecessarios / ((inputs.convLeadMql || 1) / 100)
  const investimento = leadsNecessarios * inputs.cpl

  // Para desenhar as barras de volume (Leads = 100%)
  const maxVolume = leadsNecessarios || 1
  const getWidth = (val: number) => `${Math.max((val / maxVolume) * 100, 2)}%`

  const stages = [
    {
      id: 'vendas',
      label: 'Vendas Necessárias',
      value: vendasNecessarias,
      icon: Trophy,
      color: 'text-[#00D68F]',
      fill: 'bg-[#00D68F]/20',
      border: 'border-[#00D68F]/50'
    },
    {
      id: 'opps',
      label: 'Oportunidades (Opps)',
      value: oppNecessarias,
      icon: Zap,
      color: 'text-emerald-400',
      fill: 'bg-emerald-500/20',
      border: 'border-emerald-500/50'
    },
    {
      id: 'mql',
      label: 'MQL (Qualificados)',
      value: mqlNecessarios,
      icon: Filter,
      color: 'text-teal-400',
      fill: 'bg-teal-500/20',
      border: 'border-teal-500/50'
    },
    {
      id: 'leads',
      label: 'Leads Necessários',
      value: leadsNecessarios,
      icon: Users,
      color: 'text-indigo-400',
      fill: 'bg-indigo-500/20',
      border: 'border-indigo-500/50'
    }
  ]

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-7xl mx-auto px-4">
      
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-widest uppercase mb-2">
          <TrendingUp className="h-4 w-4" /> Simulador Interativo
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">Arquitetura de Receita</h2>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Ajuste as alavancas à esquerda e veja a máquina de crescimento se adaptar em tempo real à direita.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] items-start">
        
        {/* LADO ESQUERDO: PAINEL DE CONTROLE (SLIDERS) */}
        <div className="bg-card/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col gap-8">
          
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
              <Target className="h-5 w-5 text-primary" /> Alvos Principais
            </h3>
            <div className="space-y-8">
              <PremiumSlider 
                label="Meta de Receita" 
                value={inputs.meta} 
                min={50000} 
                max={2000000} 
                step={10000} 
                onChange={(v) => handleChange('meta', v)} 
                isCurrency 
                color="primary"
              />
              <PremiumSlider 
                label="Ticket Médio" 
                value={inputs.ticket} 
                min={500} 
                max={50000} 
                step={250} 
                onChange={(v) => handleChange('ticket', v)} 
                isCurrency 
                color="primary"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-white/5 pb-4 mt-4">
              <Filter className="h-5 w-5 text-teal-400" /> Taxas de Conversão
            </h3>
            <div className="space-y-8">
              <PremiumSlider 
                label="Conversão Lead → MQL" 
                value={inputs.convLeadMql} 
                min={1} 
                max={100} 
                onChange={(v) => handleChange('convLeadMql', v)} 
                isPercent 
                color="emerald"
              />
              <PremiumSlider 
                label="Conversão MQL → Oportunidade" 
                value={inputs.convMqlOpp} 
                min={1} 
                max={100} 
                onChange={(v) => handleChange('convMqlOpp', v)} 
                isPercent 
                color="emerald"
              />
              <PremiumSlider 
                label="Conversão Opp → Venda" 
                value={inputs.convOppVenda} 
                min={1} 
                max={100} 
                onChange={(v) => handleChange('convOppVenda', v)} 
                isPercent 
                color="emerald"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-white/5 pb-4 mt-4">
              <Wallet className="h-5 w-5 text-indigo-400" /> Custos de Aquisição
            </h3>
            <div className="space-y-8">
              <PremiumSlider 
                label="Custo por Lead (CPL)" 
                value={inputs.cpl} 
                min={1} 
                max={200} 
                onChange={(v) => handleChange('cpl', v)} 
                isCurrency 
                color="blue"
              />
            </div>
          </div>

        </div>


        {/* LADO DIREITO: VOLUMES (FUNIL REVERSO VISUAL) */}
        <div className="relative space-y-6 flex flex-col justify-center min-h-full py-4">
          
          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 backdrop-blur-md shadow-[0_0_30px_rgba(72,209,122,0.1)] text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Meta Financeira</h3>
            <div className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter drop-shadow-lg">
              <AnimatedValue value={inputs.meta} isCurrency />
            </div>
          </div>

          <div className="flex flex-col gap-4 relative mt-8">
            {/* Linha guia central de fundo */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2 z-0 hidden md:block"></div>
            
            {stages.map((stage) => {
              const Icon = stage.icon
              return (
                <div key={stage.id} className="relative z-10 bg-black/40 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-300 group">
                  {/* Barra de volume que reage ao slider */}
                  <div 
                    className={cn("absolute inset-y-0 left-0 transition-all duration-700 ease-out", stage.fill)}
                    style={{ width: getWidth(stage.value) }}
                  >
                    {/* Borda brilhante da barra */}
                    <div className={cn("absolute inset-y-0 right-0 w-1 shadow-[0_0_15px_rgba(255,255,255,0.5)]", stage.border)}></div>
                  </div>
                  
                  {/* Conteúdo do Card */}
                  <div className="relative p-5 md:px-8 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-black/50 border border-white/10 backdrop-blur-md group-hover:scale-110 transition-transform", stage.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-white/80">{stage.label}</h3>
                    </div>
                    <div className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-md tracking-tighter">
                      <AnimatedValue value={stage.value} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/20 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.1)] text-center relative overflow-hidden group mt-8">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-2">Orçamento / Investimento Necessário</h3>
            <div className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter drop-shadow-lg">
              <AnimatedValue value={investimento} isCurrency />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
