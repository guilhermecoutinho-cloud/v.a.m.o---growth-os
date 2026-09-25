'use client'

import { useState } from 'react'
import { useAnimatedNumber } from '@/lib/use-animated-number'
import { Label } from "@/components/ui/label"
import { TrendingUp, Target, Filter, Wallet, HeartHandshake, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const trackColor = color === 'primary' ? 'bg-[#00D68F]' : color === 'blue' ? 'bg-indigo-500' : color === 'pink' ? 'bg-pink-500' : 'bg-emerald-500'
  const thumbGlow = color === 'primary' ? 'shadow-[0_0_15px_rgba(72,209,122,0.8)]' : color === 'blue' ? 'shadow-[0_0_15px_rgba(99,102,241,0.8)]' : color === 'pink' ? 'shadow-[0_0_15px_rgba(236,72,153,0.8)]' : 'shadow-[0_0_15px_rgba(16,185,129,0.8)]'

  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-center">
        <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground group-hover:text-white transition-colors">{label}</Label>
        <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded-full">{displayValue}</span>
      </div>
      <div className="relative h-2 rounded-full bg-white/5 cursor-pointer flex items-center">
        <div className={cn("absolute left-0 h-full rounded-full transition-all duration-75", trackColor)} style={{ width: `${percentage}%` }}></div>
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div 
          className={cn("absolute w-4 h-4 bg-white rounded-full transition-all duration-75 -ml-2 z-0", thumbGlow)}
          style={{ left: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

// O Funil Gravata Borboleta em SVG (Agora dinâmico com missões)
const BowtieFunnel = ({ data, missions }: { data: any, missions: Record<string, boolean> }) => {
  const segments = [
    // Marketing & Vendas (Esquerda)
    { id: 'consciencia', label: 'Consciência', value: data.consciencia, poly: "50,20 148,51.85 148,348.15 50,380", color: "#4f46e5", textX: 99, textY: 200 },
    { id: 'consideracao', label: 'Consideração', value: data.consideracao, poly: "150,52.5 248,84.35 248,315.65 150,347.5", color: "#7c3aed", textX: 199, textY: 200 },
    { id: 'avaliacao', label: 'Avaliação', value: data.avaliacao, poly: "250,85 348,116.85 348,283.15 250,315", color: "#db2777", textX: 299, textY: 200 },
    { id: 'decisao', label: 'Decisão', value: data.decisao, poly: "350,117.5 448,149.35 448,250.65 350,282.5", color: "#e11d48", textX: 399, textY: 200 },
    
    // Centro (Venda)
    { id: 'venda', label: 'Venda', value: data.vendas, poly: "450,150 550,150 550,250 450,250", color: "#00D68F", textX: 500, textY: 200, isCenter: true },
    
    // Experiência do Cliente (Direita)
    { id: 'integracao', label: 'Integração', value: data.integracao, poly: "552,149.35 650,117.5 650,282.5 552,250.65", color: "#e11d48", textX: 601, textY: 200 },
    { id: 'suporte', label: 'Suporte', value: data.suporte, poly: "652,116.85 750,85 750,315 652,283.15", color: "#db2777", textX: 701, textY: 200 },
    { id: 'retencao', label: 'Retenção', value: data.retencao, poly: "752,84.35 850,52.5 850,347.5 752,315.65", color: "#7c3aed", textX: 801, textY: 200 },
    { id: 'recomendacao', label: 'Recomendação', value: data.recomendacao, poly: "852,51.85 950,20 950,380 852,348.15", color: "#4f46e5", textX: 901, textY: 200 },
  ]

  return (
    <div className="w-full relative py-8">
      <svg viewBox="0 -30 1000 450" className="w-full h-auto drop-shadow-2xl">
        {/* Títulos */}
        <text x="250" y="-10" fill="rgba(255,255,255,0.7)" fontSize="18" fontWeight="800" textAnchor="middle" style={{ textTransform: "uppercase" }} letterSpacing="2">Marketing & Vendas</text>
        <text x="750" y="-10" fill="rgba(255,255,255,0.7)" fontSize="18" fontWeight="800" textAnchor="middle" style={{ textTransform: "uppercase" }} letterSpacing="2">Experiência do Cliente</text>
        
        {/* Linhas Conectoras Superiores */}
        <path d="M 50,5 L 448,5" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
        <path d="M 50,0 L 50,10" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
        <path d="M 448,0 L 448,10" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
        
        <path d="M 552,5 L 950,5" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
        <path d="M 552,0 L 552,10" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
        <path d="M 950,0 L 950,10" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />

        {segments.map((seg) => (
          <g key={seg.id} className="transition-transform hover:-translate-y-1 duration-300 group cursor-default">
            <polygon 
              points={seg.poly} 
              fill={missions[seg.id] ? seg.color : "#1e293b"} 
              opacity={missions[seg.id] ? "0.9" : "0.7"}
              className="transition-colors duration-500"
            />
            {seg.isCenter ? (
              <g>
                <text x={seg.textX} y={seg.textY - 15} fill={missions[seg.id] ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.5)"} fontSize="12" fontWeight="bold" textAnchor="middle" style={{ textTransform: "uppercase" }} className="transition-colors duration-500">{seg.label}</text>
                <text x={seg.textX} y={seg.textY + 10} fill={missions[seg.id] ? "black" : "rgba(255,255,255,0.8)"} fontSize="22" fontWeight="900" textAnchor="middle" className="transition-colors duration-500">
                  {Math.floor(seg.value).toLocaleString('pt-BR')}
                </text>
              </g>
            ) : (
              <g transform={`rotate(-90 ${seg.textX} ${seg.textY})`}>
                <text x={seg.textX} y={seg.textY - 15} fill={missions[seg.id] ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)"} fontSize="13" fontWeight="bold" textAnchor="middle" style={{ textTransform: "uppercase" }} letterSpacing="1" className="transition-colors duration-500">{seg.label}</text>
                <text x={seg.textX} y={seg.textY + 15} fill={missions[seg.id] ? "white" : "rgba(255,255,255,0.6)"} fontSize="26" fontWeight="900" textAnchor="middle" style={missions[seg.id] ? { textShadow: '0 2px 10px rgba(0,0,0,0.3)' } : {}} className="transition-colors duration-500">
                  {Math.floor(seg.value).toLocaleString('pt-BR')}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

export default function ArquiteturaReceitaPage() {
  // Estado das Missões
  const [missions, setMissions] = useState({
    consciencia: false,
    consideracao: false,
    avaliacao: false,
    decisao: false,
    venda: false,
    integracao: false,
    suporte: false,
    retencao: false,
    recomendacao: false,
  })

  const toggleMission = (id: string) => {
    setMissions(prev => ({ ...prev, [id]: !prev[id as keyof typeof prev] }))
  }

  // Estado dos Sliders
  const [inputs, setInputs] = useState({
    // Alvos
    meta: 500000,
    ticket: 8750,
    cpl: 30,

    // Taxas Esquerda (Marketing & Vendas)
    convLeadMql: 50,      // Consciência -> Consideração
    convMqlAvaliacao: 60, // Consideração -> Avaliação
    convAvaliacaoDecisao: 40, // Avaliação -> Decisão
    convDecisaoVenda: 25, // Decisão -> Venda

    // Taxas Direita (Experiência do Cliente)
    convOnboarding: 90,   // Venda -> Integração
    convSuporte: 80,      // Integração -> Suporte
    convRetencao: 85,     // Suporte -> Retenção
    convRecomendacao: 20  // Retenção -> Recomendação
  })

  const handleChange = (name: string, value: number) => {
    setInputs(prev => ({ ...prev, [name]: value }))
  }

  // Cálculos
  // 1. Centro (Vendas Necessárias)
  const vendas = inputs.meta / (inputs.ticket || 1)
  
  // 2. Esquerda (Calculado de trás pra frente)
  const decisao = vendas / ((inputs.convDecisaoVenda || 1) / 100)
  const avaliacao = decisao / ((inputs.convAvaliacaoDecisao || 1) / 100)
  const consideracao = avaliacao / ((inputs.convMqlAvaliacao || 1) / 100)
  const consciencia = consideracao / ((inputs.convLeadMql || 1) / 100)

  // 3. Direita (Calculado pra frente)
  const integracao = vendas * ((inputs.convOnboarding || 1) / 100)
  const suporte = integracao * ((inputs.convSuporte || 1) / 100)
  const retencao = suporte * ((inputs.convRetencao || 1) / 100)
  const recomendacao = retencao * ((inputs.convRecomendacao || 1) / 100)

  // Custos
  const investimento = consciencia * inputs.cpl

  const funnelData = {
    consciencia, consideracao, avaliacao, decisao,
    vendas,
    integracao, suporte, retencao, recomendacao
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-7xl mx-auto px-4">
      
      <div className="flex flex-col items-center text-center space-y-4 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-widest uppercase mb-2">
          <TrendingUp className="h-4 w-4" /> Simulador Interativo
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">Arquitetura de Receita</h2>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Ajuste as taxas do seu Funil Gravata Borboleta e descubra a máquina de crescimento exata que você precisa.
        </p>
      </div>

      {/* O FUNIL GRAVATA BORBOLETA VISUAL COM MISSÕES */}
      <div className="bg-card/40 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        <BowtieFunnel data={funnelData} missions={missions} />
        
        {/* CHECKLIST DE MISSÕES */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="flex flex-col items-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Missões de Implementação</h3>
            <p className="text-sm text-muted-foreground text-center max-w-lg">
              Marque as etapas que você já construiu na sua empresa. A gravata vai ganhando cor conforme a sua máquina se torna realidade!
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.keys(missions).map(key => (
              <div 
                key={key} 
                onClick={() => toggleMission(key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 border",
                  missions[key as keyof typeof missions] 
                    ? "bg-primary/20 border-primary/50 text-white shadow-[0_0_15px_rgba(0,214,143,0.3)]" 
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                )}
              >
                {missions[key as keyof typeof missions] ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4" />}
                <span className="text-sm font-semibold capitalize">
                  {key === 'venda' ? 'Venda (Conversão)' : key}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PAINEL DE CONTROLE (SLIDERS EM 3 COLUNAS) */}
      <div className="grid gap-6 md:grid-cols-3 items-start">
        
        {/* Coluna 1: Marketing & Vendas */}
        <div className="bg-card/80 p-6 rounded-3xl border border-white/10 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <Filter className="h-5 w-5 text-indigo-400" /> Marketing & Vendas
          </h3>
          <div className="space-y-6">
            <PremiumSlider 
              label="Consciência → Consideração (Lead → MQL)" 
              value={inputs.convLeadMql} 
              min={1} max={100} 
              onChange={(v) => handleChange('convLeadMql', v)} 
              isPercent color="blue"
            />
            <PremiumSlider 
              label="Consideração → Avaliação (MQL → SAL)" 
              value={inputs.convMqlAvaliacao} 
              min={1} max={100} 
              onChange={(v) => handleChange('convMqlAvaliacao', v)} 
              isPercent color="blue"
            />
            <PremiumSlider 
              label="Avaliação → Decisão (SAL → Opp)" 
              value={inputs.convAvaliacaoDecisao} 
              min={1} max={100} 
              onChange={(v) => handleChange('convAvaliacaoDecisao', v)} 
              isPercent color="pink"
            />
            <PremiumSlider 
              label="Decisão → Venda (Opp → Cliente)" 
              value={inputs.convDecisaoVenda} 
              min={1} max={100} 
              onChange={(v) => handleChange('convDecisaoVenda', v)} 
              isPercent color="pink"
            />
          </div>
        </div>

        {/* Coluna 2: Alvos Principais */}
        <div className="bg-card/80 p-6 rounded-3xl border border-white/10 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <Target className="h-5 w-5 text-primary" /> Alvos Financeiros
          </h3>
          <div className="space-y-6">
            <PremiumSlider 
              label="Meta de Receita" 
              value={inputs.meta} 
              min={50000} max={2000000} step={10000} 
              onChange={(v) => handleChange('meta', v)} 
              isCurrency color="primary"
            />
            <PremiumSlider 
              label="Ticket Médio" 
              value={inputs.ticket} 
              min={500} max={50000} step={250} 
              onChange={(v) => handleChange('ticket', v)} 
              isCurrency color="primary"
            />
            <PremiumSlider 
              label="Custo por Lead (CPL)" 
              value={inputs.cpl} 
              min={1} max={200} 
              onChange={(v) => handleChange('cpl', v)} 
              isCurrency color="emerald"
            />
          </div>

          <div className="mt-4 bg-primary/10 border border-primary/20 p-6 rounded-2xl text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Wallet className="h-6 w-6 text-primary mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold uppercase tracking-widest text-primary/80 mb-2">Investimento Necessário</p>
            <h2 className="text-3xl font-extrabold text-white tracking-tighter">
              <AnimatedValue value={investimento} isCurrency />
            </h2>
          </div>
        </div>

        {/* Coluna 3: Experiência do Cliente */}
        <div className="bg-card/80 p-6 rounded-3xl border border-white/10 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <HeartHandshake className="h-5 w-5 text-pink-400" /> Experiência do Cliente
          </h3>
          <div className="space-y-6">
            <PremiumSlider 
              label="Sucesso na Integração (Onboarding)" 
              value={inputs.convOnboarding} 
              min={1} max={100} 
              onChange={(v) => handleChange('convOnboarding', v)} 
              isPercent color="pink"
            />
            <PremiumSlider 
              label="Taxa de Engajamento (Suporte)" 
              value={inputs.convSuporte} 
              min={1} max={100} 
              onChange={(v) => handleChange('convSuporte', v)} 
              isPercent color="pink"
            />
            <PremiumSlider 
              label="Taxa de Renovação (Retenção)" 
              value={inputs.convRetencao} 
              min={1} max={100} 
              onChange={(v) => handleChange('convRetencao', v)} 
              isPercent color="blue"
            />
            <PremiumSlider 
              label="Taxa de Promotores (Recomendação)" 
              value={inputs.convRecomendacao} 
              min={1} max={100} 
              onChange={(v) => handleChange('convRecomendacao', v)} 
              isPercent color="blue"
            />
          </div>
        </div>

      </div>
    </div>
  )
}
