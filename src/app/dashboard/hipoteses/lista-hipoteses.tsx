'use client'

import { useMemo, useState, useTransition } from 'react'
import { mudarStatusHipotese } from './actions'
import type { Hipotese } from '@/lib/vamo/tipos'
import { ALAVANCAS, NO_POR_ID } from '@/lib/vamo/modelo'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

const STATUS: Record<Hipotese['status'], { rotulo: string; classe: string }> = {
  rascunho:     { rotulo: 'Rascunho',     classe: 'bg-white/10 text-muted-foreground' },
  a_testar:     { rotulo: 'A testar',     classe: 'bg-amber-500/15 text-amber-400' },
  em_teste:     { rotulo: 'Em teste',     classe: 'bg-sky-500/15 text-sky-400' },
  validada:     { rotulo: 'Validada',     classe: 'bg-primary/15 text-primary' },
  refutada:     { rotulo: 'Refutada',     classe: 'bg-destructive/15 text-destructive' },
  inconclusiva: { rotulo: 'Inconclusiva', classe: 'bg-white/10 text-muted-foreground' },
}

const ORDEM_STATUS = Object.keys(STATUS) as Hipotese['status'][]

export function ListaHipoteses({
  hipoteses,
  experimentos,
}: {
  hipoteses: Hipotese[]
  experimentos: Record<string, string>
}) {
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroAlavanca, setFiltroAlavanca] = useState<string>('todas')

  const visiveis = useMemo(
    () =>
      hipoteses.filter(
        (h) =>
          (filtroStatus === 'todos' || h.status === filtroStatus) &&
          (filtroAlavanca === 'todas' || h.lever === filtroAlavanca)
      ),
    [hipoteses, filtroStatus, filtroAlavanca]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Filtro
          rotulo="Status"
          valor={filtroStatus}
          onChange={setFiltroStatus}
          opcoes={[
            { v: 'todos', r: 'Todos' },
            ...ORDEM_STATUS.map((s) => ({ v: s, r: STATUS[s].rotulo })),
          ]}
        />
        <Filtro
          rotulo="Alavanca"
          valor={filtroAlavanca}
          onChange={setFiltroAlavanca}
          opcoes={[
            { v: 'todas', r: 'Todas' },
            ...Object.entries(ALAVANCAS).map(([k, a]) => ({
              v: k,
              r: `${a.numero} ${a.nome}`,
            })),
          ]}
        />
        <span className="self-center text-sm text-muted-foreground">
          {visiveis.length} de {hipoteses.length}
        </span>
      </div>

      <div className="space-y-2">
        {visiveis.map((h) => (
          <LinhaHipotese key={h.id} hipotese={h} experimentos={experimentos} />
        ))}
        {visiveis.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma hipótese com esses filtros.
          </p>
        )}
      </div>
    </div>
  )
}

function Filtro({
  rotulo,
  valor,
  onChange,
  opcoes,
}: {
  rotulo: string
  valor: string
  onChange: (v: string) => void
  opcoes: Array<{ v: string; r: string }>
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-border/60 bg-input/60 px-3 text-sm text-white focus-visible:border-primary focus-visible:outline-none"
      >
        {opcoes.map((o) => (
          <option key={o.v} value={o.v} className="bg-card text-white">
            {o.r}
          </option>
        ))}
      </select>
    </label>
  )
}

function LinhaHipotese({
  hipotese: h,
  experimentos,
}: {
  hipotese: Hipotese
  experimentos: Record<string, string>
}) {
  const [aberto, setAberto] = useState(false)
  const [status, setStatus] = useState(h.status)
  const [salvando, iniciar] = useTransition()

  const alavanca = ALAVANCAS[h.lever]
  const no = NO_POR_ID[h.node]
  const experimento = h.library_item_id ? experimentos[h.library_item_id] : undefined
  const contexto = h.snapshot_context as Record<string, unknown> | null

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
      >
        <ChevronDown
          className={cn(
            'mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            aberto && 'rotate-180'
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>{no?.rotulo ?? h.node}</span>
            <span className="text-border">•</span>
            <span>
              {alavanca.numero} {alavanca.nome}
            </span>
            <span className={cn('rounded-full px-2 py-0.5 font-bold', STATUS[status].classe)}>
              {STATUS[status].rotulo}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-white">
            <strong className="text-primary">SE</strong> {h.if_action}{' '}
            <strong className="text-primary">ENTÃO</strong> {h.then_result}
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {new Date(h.created_at).toLocaleDateString('pt-BR')}
        </span>
      </button>

      {aberto && (
        <div className="space-y-4 border-t border-border/50 px-4 py-4 pl-11">
          <div className="space-y-2 text-sm">
            <p>
              <strong className="text-primary">SE</strong>{' '}
              <span className="text-white">{h.if_action}</span>
            </p>
            <p>
              <strong className="text-primary">ENTÃO</strong>{' '}
              <span className="text-white">{h.then_result}</span>
            </p>
            <p>
              <strong className="text-primary">PORQUE</strong>{' '}
              <span className="text-white">{h.because_evidence}</span>
            </p>
          </div>

          {contexto && Object.keys(contexto).length > 0 && (
            <div className="rounded-lg bg-white/[0.03] p-3 text-xs text-muted-foreground">
              <strong className="text-white/80">Dados no momento da criação:</strong>{' '}
              {contexto.periodo ? `${contexto.periodo} · ` : ''}
              {contexto.taxa_atual != null
                ? `taxa ${Number(contexto.taxa_atual).toFixed(2).replace('.', ',')}%`
                : ''}
              {contexto.taxa_alvo != null
                ? ` · necessária ${Number(contexto.taxa_alvo).toFixed(1).replace('.', ',')}%`
                : ''}
            </div>
          )}

          {experimento && (
            <div className="rounded-lg bg-primary/[0.06] p-3 text-xs text-muted-foreground">
              <strong className="text-primary">Experimento possível:</strong> {experimento}
            </div>
          )}

          {h.discard_reason && (
            <p className="text-xs text-muted-foreground">
              <strong className="text-white/80">Motivo do descarte:</strong> {h.discard_reason}
            </p>
          )}

          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Status</span>
            <select
              value={status}
              disabled={salvando}
              onChange={(e) => {
                const novo = e.target.value as Hipotese['status']
                setStatus(novo)
                iniciar(async () => {
                  await mudarStatusHipotese(h.id, novo)
                })
              }}
              className="h-9 rounded-lg border border-border/60 bg-input/60 px-3 text-sm text-white focus-visible:border-primary focus-visible:outline-none"
            >
              {ORDEM_STATUS.map((s) => (
                <option key={s} value={s} className="bg-card text-white">
                  {STATUS[s].rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  )
}
