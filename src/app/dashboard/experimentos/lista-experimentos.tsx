'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import {
  criarExperimento,
  atualizarExperimento,
  type StatusExperimento,
} from './actions'
import type { Experimento } from './page'
import { formatarNumero } from '@/lib/vamo/calculos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ChevronDown, FlaskConical, Plus, X } from 'lucide-react'

const STATUS: Record<StatusExperimento, { rotulo: string; classe: string }> = {
  planejado:    { rotulo: 'Planejado',    classe: 'bg-white/10 text-muted-foreground' },
  em_andamento: { rotulo: 'Em andamento', classe: 'bg-sky-500/15 text-sky-400' },
  concluido:    { rotulo: 'Concluído',    classe: 'bg-primary/15 text-primary' },
  cancelado:    { rotulo: 'Cancelado',    classe: 'bg-destructive/15 text-destructive' },
}

const ORDEM = Object.keys(STATUS) as StatusExperimento[]

type HipoteseResumo = { id: string; resumo: string; status: string }

export function ListaExperimentos({
  organizationId,
  experimentos,
  hipoteses,
  org,
}: {
  organizationId: string
  experimentos: Experimento[]
  hipoteses: HipoteseResumo[]
  org?: string
}) {
  const [novo, setNovo] = useState(false)
  const comOrg = (r: string) => (org ? `${r}?org=${org}` : r)

  return (
    <div className="space-y-4">
      <Button onClick={() => setNovo((v) => !v)} variant={novo ? 'outline' : 'default'}>
        {novo ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
        {novo ? 'Cancelar' : 'Novo experimento'}
      </Button>

      {novo && (
        <FormularioExperimento
          organizationId={organizationId}
          hipoteses={hipoteses}
          onPronto={() => setNovo(false)}
        />
      )}

      {experimentos.length === 0 && !novo ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <FlaskConical className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white">Nenhum experimento ainda</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Um experimento nasce de uma hipótese: escolha uma que esteja a testar e defina como
            vai medir o resultado.
          </p>
          {hipoteses.length === 0 && (
            <Link
              href={comOrg('/dashboard/hipoteses')}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Ver hipóteses
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {experimentos.map((e) => (
            <LinhaExperimento key={e.id} experimento={e} hipoteses={hipoteses} />
          ))}
        </div>
      )}
    </div>
  )
}

function LinhaExperimento({
  experimento: e,
  hipoteses,
}: {
  experimento: Experimento
  hipoteses: HipoteseResumo[]
}) {
  const [aberto, setAberto] = useState(false)
  const [status, setStatus] = useState(e.status)
  const [resultado, setResultado] = useState<string>(e.result?.toString() ?? '')
  const [aprendizado, setAprendizado] = useState(e.learning ?? '')
  const [salvo, setSalvo] = useState(false)
  const [salvando, iniciar] = useTransition()

  const hipotese = hipoteses.find((h) => h.id === e.hypothesis_id)

  // Só faz sentido falar em "atingiu" com meta e resultado registrados.
  const atingiu =
    e.target != null && e.result != null
      ? e.result >= e.target
      : null

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
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-white">{e.title}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', STATUS[status].classe)}>
              {STATUS[status].rotulo}
            </span>
            {atingiu !== null && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  atingiu ? 'bg-primary/15 text-primary' : 'bg-amber-500/15 text-amber-400'
                )}
              >
                {atingiu ? 'Meta atingida' : 'Abaixo da meta'}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            KPI: {e.kpi}
            {e.baseline != null && ` · linha de base ${formatarNumero(e.baseline)}`}
            {e.target != null && ` · meta ${formatarNumero(e.target)}`}
          </p>
        </div>
      </button>

      {aberto && (
        <div className="space-y-4 border-t border-border/50 px-4 py-4 pl-11">
          {hipotese && (
            <p className="text-sm text-muted-foreground">
              <strong className="text-white/80">Hipótese:</strong> {hipotese.resumo}
            </p>
          )}

          <div className="grid gap-3 text-sm sm:grid-cols-4">
            <Dado rotulo="Linha de base" valor={formatarNumero(e.baseline)} />
            <Dado rotulo="Meta" valor={formatarNumero(e.target)} />
            <Dado rotulo="Prazo" valor={periodo(e.starts_on, e.ends_on)} />
            <Dado rotulo="Responsável" valor={e.owner_name ?? '—'} />
          </div>

          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Resultado</Label>
              <Input
                type="number"
                value={resultado}
                onChange={(ev) => {
                  setResultado(ev.target.value)
                  setSalvo(false)
                }}
                placeholder="—"
                className="h-9 bg-input/60 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">O que aprendemos</Label>
              <Textarea
                rows={2}
                value={aprendizado}
                onChange={(ev) => {
                  setAprendizado(ev.target.value)
                  setSalvo(false)
                }}
                placeholder="O que este teste ensinou, tenha dado certo ou não."
                className="bg-input/60 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Status</span>
              <select
                value={status}
                onChange={(ev) => {
                  setStatus(ev.target.value as StatusExperimento)
                  setSalvo(false)
                }}
                className="h-9 rounded-lg border border-border/60 bg-input/60 px-3 text-sm text-white"
              >
                {ORDEM.map((s) => (
                  <option key={s} value={s} className="bg-card">
                    {STATUS[s].rotulo}
                  </option>
                ))}
              </select>
            </label>

            <Button
              type="button"
              size="sm"
              disabled={salvando}
              onClick={() =>
                iniciar(async () => {
                  const r = await atualizarExperimento({
                    id: e.id,
                    status,
                    resultado: resultado === '' ? null : Number(resultado.replace(',', '.')),
                    aprendizado: aprendizado || null,
                  })
                  if (r.ok) setSalvo(true)
                })
              }
            >
              {salvando ? 'Salvando…' : 'Salvar'}
            </Button>
            {salvo && <span className="text-xs text-primary">Salvo.</span>}
          </div>
        </div>
      )}
    </div>
  )
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{rotulo}</div>
      <div className="mt-0.5 text-sm font-medium tabular-nums text-white">{valor}</div>
    </div>
  )
}

function periodo(inicio: string | null, fim: string | null) {
  const f = (d: string | null) =>
    d ? new Date(`${d}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : null
  const a = f(inicio)
  const b = f(fim)
  if (a && b) return `${a} a ${b}`
  return a ?? b ?? '—'
}

function FormularioExperimento({
  organizationId,
  hipoteses,
  onPronto,
}: {
  organizationId: string
  hipoteses: HipoteseResumo[]
  onPronto: () => void
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, iniciar] = useTransition()

  return (
    <form
      action={(fd) =>
        iniciar(async () => {
          const r = await criarExperimento(null, fd)
          if (r.ok) onPronto()
          else setErro(r.mensagem ?? 'Não foi possível criar.')
        })
      }
      className="grid gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <input type="hidden" name="organization_id" value={organizationId} />

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="title" className="text-xs">Nome do experimento</Label>
        <Input id="title" name="title" required className="h-9 bg-input/60" />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="hypothesis_id" className="text-xs">Hipótese vinculada</Label>
        <select
          id="hypothesis_id"
          name="hypothesis_id"
          className="h-9 w-full rounded-lg border border-border/60 bg-input/60 px-2 text-sm text-white"
        >
          <option value="" className="bg-card">Sem hipótese</option>
          {hipoteses.map((h) => (
            <option key={h.id} value={h.id} className="bg-card">
              {h.resumo}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="kpi" className="text-xs">KPI que decide o resultado</Label>
        <Input
          id="kpi"
          name="kpi"
          required
          placeholder="Ex.: taxa Lead → MQL"
          className="h-9 bg-input/60"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="baseline" className="text-xs">Linha de base</Label>
        <Input id="baseline" name="baseline" type="number" className="h-9 bg-input/60" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="target" className="text-xs">Meta</Label>
        <Input id="target" name="target" type="number" className="h-9 bg-input/60" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="starts_on" className="text-xs">Início</Label>
        <Input id="starts_on" name="starts_on" type="date" className="h-9 bg-input/60" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ends_on" className="text-xs">Fim</Label>
        <Input id="ends_on" name="ends_on" type="date" className="h-9 bg-input/60" />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="owner_name" className="text-xs">Responsável</Label>
        <Input id="owner_name" name="owner_name" className="h-9 bg-input/60" />
      </div>

      <div className="sm:col-span-2 lg:col-span-4">
        <Button type="submit" size="sm" disabled={salvando}>
          {salvando ? 'Criando…' : 'Criar experimento'}
        </Button>
        {erro && <span className="ml-3 text-sm text-destructive">{erro}</span>}
      </div>
    </form>
  )
}
