'use client'

import { useEffect, useState, useTransition } from 'react'
import { salvarCenario, definirMeta } from './actions'
import type { Snapshot, Cenario, MetaReceita } from '@/lib/vamo/tipos'
import {
  funilReverso,
  taxasDe,
  receitaDe,
  formatarMoeda,
  formatarNumero,
  formatarTaxa,
} from '@/lib/vamo/calculos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Check, HelpCircle, Loader2 } from 'lucide-react'

type Entradas = {
  meta: number
  ticket: number
  cpl: number
  leadMql: number
  mqlOpp: number
  oppSale: number
}

export function ArquiteturaEditor({
  organizationId,
  snapshot,
  metaAtual,
  cenarioOtimizado,
}: {
  organizationId: string
  snapshot: Snapshot | null
  metaAtual: MetaReceita | null
  cenarioOtimizado: Cenario | null
}) {
  const taxasHoje = taxasDe(snapshot)
  const receitaHoje = receitaDe(snapshot)

  // Os sliders partem dos dados reais, não de valores inventados.
  const [e, setE] = useState<Entradas>(() => ({
    meta: cenarioOtimizado?.target_revenue ?? metaAtual?.target_revenue ?? (receitaHoje ?? 100000) * 1.5,
    ticket: cenarioOtimizado?.avg_ticket ?? taxasHoje.ticket ?? 5000,
    cpl: cenarioOtimizado?.cpl ?? taxasHoje.cpl ?? 30,
    leadMql: cenarioOtimizado?.rate_lead_mql ?? taxasHoje.lead_mql ?? 20,
    mqlOpp: cenarioOtimizado?.rate_mql_opp ?? taxasHoje.mql_opp ?? 20,
    oppSale: cenarioOtimizado?.rate_opp_sale ?? taxasHoje.opp_sale ?? 15,
  }))

  const [salvo, setSalvo] = useState(false)
  const [salvando, iniciar] = useTransition()

  // Salva o cenário otimizado depois que os sliders param.
  useEffect(() => {
    const t = setTimeout(() => {
      iniciar(async () => {
        const r = await salvarCenario(organizationId, 'otimizado', {
          target_revenue: e.meta,
          avg_ticket: e.ticket,
          cpl: e.cpl,
          rate_lead_mql: e.leadMql,
          rate_mql_opp: e.mqlOpp,
          rate_opp_sale: e.oppSale,
        })
        if (r.ok) {
          setSalvo(true)
          setTimeout(() => setSalvo(false), 2000)
        }
      })
    }, 900)
    return () => clearTimeout(t)
  }, [e, organizationId])

  // Cenário META: bater a meta mantendo as taxas de HOJE.
  const comTaxasAtuais =
    taxasHoje.lead_mql != null && taxasHoje.mql_opp != null && taxasHoje.opp_sale != null
      ? funilReverso({
          metaReceita: e.meta,
          ticket: taxasHoje.ticket ?? e.ticket,
          taxaOppVenda: taxasHoje.opp_sale,
          taxaMqlOpp: taxasHoje.mql_opp,
          taxaLeadMql: taxasHoje.lead_mql,
          cpl: taxasHoje.cpl ?? e.cpl,
        })
      : null

  // Cenário OTIMIZADO: bater a meta com as taxas-alvo dos sliders.
  const otimizado = funilReverso({
    metaReceita: e.meta,
    ticket: e.ticket,
    taxaOppVenda: e.oppSale,
    taxaMqlOpp: e.mqlOpp,
    taxaLeadMql: e.leadMql,
    cpl: e.cpl,
  })

  const set = (k: keyof Entradas) => (v: number) => setE((a) => ({ ...a, [k]: v }))

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        {/* ---- CONTROLES ---- */}
        <div className="space-y-5 rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Taxas-alvo</h3>
            <span className="text-xs text-muted-foreground">
              {salvando ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : salvo ? (
                <span className="flex items-center gap-1 text-primary">
                  <Check className="h-3 w-3" /> Salvo
                </span>
              ) : null}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta" className="text-sm text-foreground">
              Meta de receita mensal (R$)
            </Label>
            <Input
              id="meta"
              type="number"
              value={e.meta}
              onChange={(ev) => set('meta')(Number(ev.target.value) || 0)}
              className="h-10 bg-input/60 text-foreground"
            />
            <MetaBotao organizationId={organizationId} valor={e.meta} atual={metaAtual?.target_revenue ?? null} />
          </div>

          <Slider rotulo="Ticket médio" valor={e.ticket} min={100} max={100000} passo={100} onChange={set('ticket')} moeda />
          <Slider rotulo="Custo por lead" valor={e.cpl} min={1} max={500} passo={1} onChange={set('cpl')} moeda />
          <Slider rotulo="Lead → MQL" valor={e.leadMql} min={1} max={100} passo={1} onChange={set('leadMql')} percent atual={taxasHoje.lead_mql} />
          <Slider rotulo="MQL → Oportunidade" valor={e.mqlOpp} min={1} max={100} passo={1} onChange={set('mqlOpp')} percent atual={taxasHoje.mql_opp} />
          <Slider rotulo="Oportunidade → Venda" valor={e.oppSale} min={1} max={100} passo={1} onChange={set('oppSale')} percent atual={taxasHoje.opp_sale} />
        </div>

        {/* ---- COMPARAÇÃO ---- */}
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Coluna
              titulo="Atual"
              descricao="O que sua operação entrega hoje"
              linhas={[
                ['Receita', formatarMoeda(receitaHoje)],
                ['Vendas', formatarNumero(snapshot?.sales ?? null)],
                ['Oportunidades', formatarNumero(snapshot?.opportunities ?? null)],
                ['MQLs', formatarNumero(snapshot?.mqls ?? null)],
                ['Leads', formatarNumero(snapshot?.leads ?? null)],
                ['Investimento', formatarMoeda(snapshot?.investment ?? null)],
              ]}
            />
            <Coluna
              titulo="Meta"
              descricao="Bater a meta com as taxas de hoje"
              linhas={
                comTaxasAtuais
                  ? [
                      ['Receita', formatarMoeda(e.meta)],
                      ['Vendas', formatarNumero(comTaxasAtuais.vendas)],
                      ['Oportunidades', formatarNumero(comTaxasAtuais.oportunidades)],
                      ['MQLs', formatarNumero(comTaxasAtuais.mqls)],
                      ['Leads', formatarNumero(comTaxasAtuais.leads)],
                      ['Investimento', formatarMoeda(comTaxasAtuais.investimento)],
                    ]
                  : null
              }
              vazio="Registre suas taxas atuais no Funil para comparar."
              diferencas={
                comTaxasAtuais && snapshot
                  ? [
                      null,
                      dif(comTaxasAtuais.vendas, snapshot.sales),
                      dif(comTaxasAtuais.oportunidades, snapshot.opportunities),
                      dif(comTaxasAtuais.mqls, snapshot.mqls),
                      dif(comTaxasAtuais.leads, snapshot.leads),
                      dif(comTaxasAtuais.investimento, snapshot.investment, true),
                    ]
                  : undefined
              }
            />
            <Coluna
              titulo="Otimizado"
              descricao="Bater a meta com as taxas-alvo"
              destaque
              linhas={[
                ['Receita', formatarMoeda(e.meta)],
                ['Vendas', formatarNumero(otimizado.vendas)],
                ['Oportunidades', formatarNumero(otimizado.oportunidades)],
                ['MQLs', formatarNumero(otimizado.mqls)],
                ['Leads', formatarNumero(otimizado.leads)],
                ['Investimento', formatarMoeda(otimizado.investimento)],
              ]}
              diferencas={
                comTaxasAtuais
                  ? [
                      null,
                      null,
                      dif(otimizado.oportunidades, comTaxasAtuais.oportunidades),
                      dif(otimizado.mqls, comTaxasAtuais.mqls),
                      dif(otimizado.leads, comTaxasAtuais.leads),
                      dif(otimizado.investimento, comTaxasAtuais.investimento, true),
                    ]
                  : undefined
              }
            />
          </div>

          <ComoCalculamos entradas={e} saida={otimizado} />
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */

function dif(novo: number, antigo: number | null, moeda = false): string | null {
  if (antigo == null) return null
  const d = novo - antigo
  if (d === 0) return null
  const sinal = d > 0 ? '+' : '−'
  const abs = Math.abs(d)
  return `${sinal}${moeda ? formatarMoeda(abs) : formatarNumero(abs)}`
}

function Coluna({
  titulo,
  descricao,
  linhas,
  diferencas,
  destaque,
  vazio,
}: {
  titulo: string
  descricao: string
  linhas: Array<[string, string]> | null
  diferencas?: Array<string | null>
  destaque?: boolean
  vazio?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        destaque ? 'border-primary/40 bg-primary/[0.05]' : 'border-border/60 bg-card'
      )}
    >
      <h4 className={cn('text-sm font-bold', destaque ? 'text-primary' : 'text-white')}>
        {titulo}
      </h4>
      <p className="mt-0.5 text-xs text-muted-foreground">{descricao}</p>

      {linhas ? (
        <dl className="mt-4 space-y-2.5">
          {linhas.map(([rotulo, valor], i) => (
            <div key={rotulo} className="flex items-baseline justify-between gap-2">
              <dt className="text-xs text-muted-foreground">{rotulo}</dt>
              <dd className="text-right">
                <span className="text-sm font-semibold tabular-nums text-white">{valor}</span>
                {diferencas?.[i] && (
                  <span className="ml-1.5 text-[10px] tabular-nums text-amber-400">
                    {diferencas[i]}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-xs italic text-muted-foreground">{vazio}</p>
      )}
    </div>
  )
}

function Slider({
  rotulo,
  valor,
  min,
  max,
  passo,
  onChange,
  moeda,
  percent,
  atual,
}: {
  rotulo: string
  valor: number
  min: number
  max: number
  passo: number
  onChange: (v: number) => void
  moeda?: boolean
  percent?: boolean
  atual?: number | null
}) {
  const exibido = moeda ? formatarMoeda(valor) : percent ? formatarTaxa(valor, 0) : String(valor)
  const pct = ((valor - min) / (max - min)) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{rotulo}</Label>
        <div className="flex items-baseline gap-2">
          {atual != null && (
            <span className="text-[10px] text-muted-foreground">
              hoje {formatarTaxa(atual, 1)}
            </span>
          )}
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-white">
            {exibido}
          </span>
        </div>
      </div>
      <div className="relative flex h-2 items-center rounded-full bg-white/5">
        <div
          className="absolute left-0 h-full rounded-full bg-primary transition-all duration-75"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={passo}
          value={valor}
          aria-label={rotulo}
          onChange={(ev) => onChange(Number(ev.target.value))}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="pointer-events-none absolute -ml-2 h-4 w-4 rounded-full bg-white shadow-[0_0_12px_rgba(0,214,143,0.8)]"
          style={{ left: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  )
}

function MetaBotao({
  organizationId,
  valor,
  atual,
}: {
  organizationId: string
  valor: number
  atual: number | null
}) {
  const [salvando, iniciar] = useTransition()
  const [feito, setFeito] = useState(false)

  if (atual === valor) {
    return <p className="text-xs text-muted-foreground">Esta é a meta mensal registrada.</p>
  }

  return feito ? (
    <p className="flex items-center gap-1 text-xs text-primary">
      <Check className="h-3 w-3" /> Meta registrada.
    </p>
  ) : (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={salvando}
      onClick={() =>
        iniciar(async () => {
          const r = await definirMeta(organizationId, valor)
          if (r.ok) setFeito(true)
        })
      }
    >
      {salvando ? 'Salvando…' : 'Definir como meta mensal'}
    </Button>
  )
}

function ComoCalculamos({
  entradas,
  saida,
}: {
  entradas: Entradas
  saida: ReturnType<typeof funilReverso>
}) {
  return (
    <details className="rounded-2xl border border-border/60 bg-card p-4">
      <summary className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-white">
        <HelpCircle className="h-4 w-4" />
        Como calculamos
      </summary>
      <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>
          <strong className="text-white">1.</strong> {formatarMoeda(entradas.meta)} ÷{' '}
          {formatarMoeda(entradas.ticket)} ={' '}
          <strong className="text-white">{formatarNumero(saida.vendas)} vendas</strong>
        </li>
        <li>
          <strong className="text-white">2.</strong> {formatarNumero(saida.vendas)} ÷{' '}
          {entradas.oppSale}% ={' '}
          <strong className="text-white">{formatarNumero(saida.oportunidades)} oportunidades</strong>
        </li>
        <li>
          <strong className="text-white">3.</strong> {formatarNumero(saida.oportunidades)} ÷{' '}
          {entradas.mqlOpp}% = <strong className="text-white">{formatarNumero(saida.mqls)} MQLs</strong>
        </li>
        <li>
          <strong className="text-white">4.</strong> {formatarNumero(saida.mqls)} ÷{' '}
          {entradas.leadMql}% = <strong className="text-white">{formatarNumero(saida.leads)} leads</strong>
        </li>
        <li>
          <strong className="text-white">5.</strong> {formatarNumero(saida.leads)} ×{' '}
          {formatarMoeda(entradas.cpl)} ={' '}
          <strong className="text-white">{formatarMoeda(saida.investimento)} de investimento</strong>
        </li>
      </ol>
      <p className="mt-3 text-xs text-muted-foreground">
        Toda quantidade é arredondada para cima. Arredondar para baixo entregaria um plano que não
        alcança a meta.
      </p>
    </details>
  )
}
