'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { salvarSnapshot } from './actions'
import { CAMPOS_SNAPSHOT, type CampoSnapshot } from '@/lib/vamo/modelo'
import type { Snapshot, Cenario } from '@/lib/vamo/tipos'
import {
  taxa,
  formatarTaxa,
  formatarMoeda,
  formatarNumero,
  rotuloPeriodo,
} from '@/lib/vamo/calculos'
import { detectarPontos, type PontoParaInvestigar } from '@/lib/vamo/investigacao'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AlertTriangle, Check, Loader2, Search } from 'lucide-react'
import { PainelInvestigacao } from '@/components/vamo/painel-investigacao'

type Valores = Partial<Record<CampoSnapshot, number | null>>

const ORDEM_FUNIL: CampoSnapshot[] = [
  'investment',
  'leads',
  'mqls',
  'opportunities',
  'sales',
  'avg_ticket',
]

const EXTRAS: CampoSnapshot[] = [
  'active_customers',
  'repurchase_rate',
  'churn_rate',
  'referral_rate',
]

export function FunilEditor({
  organizationId,
  periodo,
  snapshot,
  cenarioMeta,
  pisos,
}: {
  organizationId: string
  periodo: string
  snapshot: Snapshot | null
  cenarioMeta: Cenario | null
  pisos: { lead_mql: number; mql_opp: number; opp_sale: number }
}) {
  const [valores, setValores] = useState<Valores>(() => extrair(snapshot))
  const [desconhecidos, setDesconhecidos] = useState<Set<CampoSnapshot>>(
    () => new Set(snapshot?.unknown_fields ?? [])
  )
  const [salvoEm, setSalvoEm] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, iniciarSalvamento] = useTransition()
  const primeiraRenderizacao = useRef(true)

  // Sem efeito de sincronia com as props: a página monta este editor
  // com key={periodo}, então trocar de mês já remonta o componente com
  // o estado inicial correto.

  // Autosave com espera: grava ~800 ms depois da última tecla.
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false
      return
    }
    const t = setTimeout(() => {
      iniciarSalvamento(async () => {
        const r = await salvarSnapshot(organizationId, periodo, valores, [...desconhecidos])
        if (r.ok) {
          setSalvoEm(r.salvoEm ?? null)
          setErro(null)
        } else {
          setErro(r.mensagem ?? 'Não foi possível salvar.')
        }
      })
    }, 800)
    return () => clearTimeout(t)
  }, [valores, desconhecidos, organizationId, periodo])

  function definir(campo: CampoSnapshot, bruto: string) {
    const n = bruto === '' ? null : Number(bruto.replace(',', '.'))
    setValores((v) => ({ ...v, [campo]: n != null && Number.isFinite(n) ? n : null }))
  }

  function alternarDesconhecido(campo: CampoSnapshot) {
    setDesconhecidos((atual) => {
      const novo = new Set(atual)
      if (novo.has(campo)) novo.delete(campo)
      else {
        novo.add(campo)
        setValores((v) => ({ ...v, [campo]: null }))
      }
      return novo
    })
  }

  // Snapshot "ao vivo" para calcular taxas e pontos enquanto se digita.
  const aoVivo: Snapshot = {
    ...(snapshot ?? ({} as Snapshot)),
    ...valores,
    unknown_fields: [...desconhecidos],
    organization_id: organizationId,
    period: periodo,
  } as Snapshot

  const tLeadMql = taxa(aoVivo.mqls, aoVivo.leads)
  const tMqlOpp = taxa(aoVivo.opportunities, aoVivo.mqls)
  const tOppSale = taxa(aoVivo.sales, aoVivo.opportunities)
  const pontos = detectarPontos(aoVivo, cenarioMeta, pisos)
  const pontoDe = (no: string) => pontos.find((p) => p.no === no)

  const avisos = validar(aoVivo)

  return (
    <div className="space-y-6">
      {/* Cabeçalho do período e estado do salvamento */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Registrando <span className="font-medium text-white">{rotuloPeriodo(periodo)}</span>
        </p>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {salvando ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Salvando…
            </>
          ) : erro ? (
            <span className="text-destructive">{erro}</span>
          ) : salvoEm ? (
            <>
              <Check className="h-3 w-3 text-primary" /> Salvo às {salvoEm}
            </>
          ) : null}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* ---- ENTRADA DOS NÚMEROS ---- */}
        <div className="space-y-5 rounded-2xl border border-border/60 bg-card p-5">
          <div>
            <h3 className="text-sm font-semibold text-white">Números do mês</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Não saber também é um dado. Registre e investigue.
            </p>
          </div>

          <div className="space-y-4">
            {ORDEM_FUNIL.map((campo) => (
              <CampoNumero
                key={campo}
                campo={campo}
                valor={valores[campo] ?? null}
                desconhecido={desconhecidos.has(campo)}
                onChange={definir}
                onToggle={alternarDesconhecido}
              />
            ))}
          </div>

          <details className="group">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-white">
              Retenção e indicação
            </summary>
            <div className="mt-4 space-y-4">
              {EXTRAS.map((campo) => (
                <CampoNumero
                  key={campo}
                  campo={campo}
                  valor={valores[campo] ?? null}
                  desconhecido={desconhecidos.has(campo)}
                  onChange={definir}
                  onToggle={alternarDesconhecido}
                />
              ))}
            </div>
          </details>

          {avisos.length > 0 && (
            <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-3">
              {avisos.map((a) => (
                <p key={a} className="flex gap-2 text-xs text-amber-300/90">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  {a}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* ---- FUNIL ---- */}
        <div className="space-y-3">
          <EtapaFunil
            rotulo="Leads"
            valor={aoVivo.leads}
            desconhecido={desconhecidos.has('leads')}
            largura={100}
            cor="#4f46e5"
            ponto={pontoDe('aquisicao')}
          />
          <Conversao taxa={tLeadMql} rotulo="Lead → MQL" ponto={pontoDe('lead_mql')} />

          <EtapaFunil
            rotulo="MQLs"
            valor={aoVivo.mqls}
            desconhecido={desconhecidos.has('mqls')}
            largura={78}
            cor="#7c3aed"
            ponto={pontoDe('lead_mql')}
          />
          <Conversao taxa={tMqlOpp} rotulo="MQL → Oportunidade" ponto={pontoDe('mql_opp')} />

          <EtapaFunil
            rotulo="Oportunidades"
            valor={aoVivo.opportunities}
            desconhecido={desconhecidos.has('opportunities')}
            largura={56}
            cor="#db2777"
            ponto={pontoDe('mql_opp')}
          />
          <Conversao taxa={tOppSale} rotulo="Oportunidade → Venda" ponto={pontoDe('opp_sale')} />

          <EtapaFunil
            rotulo="Vendas"
            valor={aoVivo.sales}
            desconhecido={desconhecidos.has('sales')}
            largura={34}
            cor="#00D68F"
            ponto={pontoDe('opp_sale')}
            destaque
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Resumo
              rotulo="Ticket médio"
              valor={formatarMoeda(aoVivo.avg_ticket)}
              ausente={desconhecidos.has('avg_ticket')}
            />
            <Resumo
              rotulo="Receita do mês"
              valor={formatarMoeda(
                aoVivo.revenue ??
                  (aoVivo.sales != null && aoVivo.avg_ticket != null
                    ? aoVivo.sales * aoVivo.avg_ticket
                    : null)
              )}
              destaque
            />
          </div>
        </div>
      </div>

      {/* ---- PAINEL DE INVESTIGAÇÃO ---- */}
      {pontos.length > 0 && (
        <PainelInvestigacao
          organizationId={organizationId}
          snapshot={aoVivo}
          pontos={pontos}
        />
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- */

function extrair(s: Snapshot | null): Valores {
  if (!s) return {}
  const v: Valores = {}
  for (const c of CAMPOS_SNAPSHOT) v[c.id] = s[c.id] ?? null
  return v
}

function validar(s: Snapshot): string[] {
  const avisos: string[] = []
  const { leads, mqls, opportunities, sales } = s
  if (mqls != null && leads != null && mqls > leads)
    avisos.push('MQLs maior que Leads. Vale conferir a contagem.')
  if (opportunities != null && mqls != null && opportunities > mqls)
    avisos.push('Oportunidades maior que MQLs. Vale conferir a contagem.')
  if (sales != null && opportunities != null && sales > opportunities)
    avisos.push('Vendas maior que Oportunidades. Vale conferir a contagem.')
  return avisos
}

function CampoNumero({
  campo,
  valor,
  desconhecido,
  onChange,
  onToggle,
}: {
  campo: CampoSnapshot
  valor: number | null
  desconhecido: boolean
  onChange: (c: CampoSnapshot, v: string) => void
  onToggle: (c: CampoSnapshot) => void
}) {
  const def = CAMPOS_SNAPSHOT.find((c) => c.id === campo)!
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={campo} className="text-sm text-foreground">
          {def.rotulo}
          {def.tipo === 'moeda' && <span className="text-muted-foreground"> (R$)</span>}
          {def.tipo === 'percent' && <span className="text-muted-foreground"> (%)</span>}
        </Label>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-white">
          <input
            type="checkbox"
            checked={desconhecido}
            onChange={() => onToggle(campo)}
            className="h-3 w-3 accent-primary"
          />
          Não sei
        </label>
      </div>
      <Input
        id={campo}
        type="number"
        inputMode="decimal"
        value={desconhecido || valor == null ? '' : valor}
        disabled={desconhecido}
        placeholder={desconhecido ? 'Não medido' : '0'}
        onChange={(e) => onChange(campo, e.target.value)}
        className={cn(
          'h-10 bg-input/60 text-foreground',
          desconhecido && 'border-dashed text-muted-foreground'
        )}
      />
    </div>
  )
}

function EtapaFunil({
  rotulo,
  valor,
  desconhecido,
  largura,
  cor,
  ponto,
  destaque,
}: {
  rotulo: string
  valor: number | null
  desconhecido: boolean
  largura: number
  cor: string
  ponto?: PontoParaInvestigar
  destaque?: boolean
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'flex h-16 items-center justify-between rounded-xl px-5 transition-all',
          desconhecido && 'border border-dashed border-border bg-transparent'
        )}
        style={{
          width: `${largura}%`,
          backgroundColor: desconhecido ? undefined : `${cor}22`,
          borderLeft: desconhecido ? undefined : `3px solid ${cor}`,
        }}
      >
        <span className="text-sm font-medium text-white">{rotulo}</span>
        <span
          className={cn(
            'tabular-nums',
            desconhecido
              ? 'text-sm italic text-muted-foreground'
              : destaque
                ? 'text-2xl font-bold text-white'
                : 'text-xl font-semibold text-white'
          )}
        >
          {desconhecido ? 'Dado ausente' : formatarNumero(valor)}
        </span>
      </div>

      {ponto?.maiorImpacto && (
        <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
          Maior impacto
        </span>
      )}
    </div>
  )
}

function Conversao({
  taxa: t,
  rotulo,
  ponto,
}: {
  taxa: number | null
  rotulo: string
  ponto?: PontoParaInvestigar
}) {
  return (
    <div className="flex items-center gap-3 pl-5 text-xs">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="font-semibold tabular-nums text-white">{formatarTaxa(t)}</span>
      {ponto && (
        <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-400">
          <Search className="h-3 w-3" />
          Investigar
        </span>
      )}
    </div>
  )
}

function Resumo({
  rotulo,
  valor,
  destaque,
  ausente,
}: {
  rotulo: string
  valor: string
  destaque?: boolean
  ausente?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        destaque ? 'border-primary/40 bg-primary/[0.06]' : 'border-border/60 bg-card'
      )}
    >
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{rotulo}</div>
      <div
        className={cn(
          'mt-1 font-bold tabular-nums',
          ausente ? 'text-base italic text-muted-foreground' : 'text-2xl text-white'
        )}
      >
        {ausente ? 'Dado ausente' : valor}
      </div>
    </div>
  )
}
