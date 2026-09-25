'use client'

import { useState, useTransition } from 'react'
import { salvarEtapaJornada } from './jornada-actions'
import {
  ETAPAS_JORNADA,
  REGISTRO_VAZIO,
  indicadorSugerido,
  type RegistroEtapa,
} from '@/lib/vamo/referencias'
import { ALAVANCAS } from '@/lib/vamo/modelo'
import type { Snapshot } from '@/lib/vamo/tipos'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, Compass, Loader2, Sparkles } from 'lucide-react'

type Gravado = Record<string, RegistroEtapa>

export function JornadaEmpresa({
  organizationId,
  registros,
  snapshot,
}: {
  organizationId: string
  registros: Gravado
  snapshot: Snapshot | null
}) {
  const [aberta, setAberta] = useState<string | null>(null)
  const preenchidas = ETAPAS_JORNADA.filter(
    (e) => registros[e.id]?.como_acontece
  ).length

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            <Compass className="h-3.5 w-3.5" />
            Jornada da sua empresa
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Como cada etapa acontece hoje, ao lado do que ela deveria ter. Quem compara é você.
          </p>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          {preenchidas} de {ETAPAS_JORNADA.length} descritas
        </span>
      </div>

      <div className="space-y-2">
        {ETAPAS_JORNADA.map((etapa) => (
          <LinhaEtapa
            key={etapa.id}
            etapa={etapa}
            registro={registros[etapa.id] ?? REGISTRO_VAZIO}
            organizationId={organizationId}
            snapshot={snapshot}
            aberta={aberta === etapa.id}
            onAlternar={() => setAberta((a) => (a === etapa.id ? null : etapa.id))}
          />
        ))}
      </div>
    </section>
  )
}

function LinhaEtapa({
  etapa,
  registro,
  organizationId,
  snapshot,
  aberta,
  onAlternar,
}: {
  etapa: (typeof ETAPAS_JORNADA)[number]
  registro: RegistroEtapa
  organizationId: string
  snapshot: Snapshot | null
  aberta: boolean
  onAlternar: () => void
}) {
  const [dados, setDados] = useState<RegistroEtapa>(registro)
  const [salvo, setSalvo] = useState(false)
  const [salvando, iniciar] = useTransition()

  const sugestao = indicadorSugerido(etapa.id, snapshot)
  const descrita = Boolean(registro.como_acontece || dados.como_acontece)
  const alavanca = etapa.alavanca ? ALAVANCAS[etapa.alavanca] : null

  function campo(k: keyof RegistroEtapa) {
    return (v: string) => {
      setDados((d) => ({ ...d, [k]: v }))
      setSalvo(false)
    }
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border transition-colors',
        aberta ? 'border-primary/40 bg-white/[0.02]' : 'border-border/50'
      )}
    >
      <button
        type="button"
        onClick={onAlternar}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold',
            descrita
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border text-muted-foreground'
          )}
        >
          {descrita ? <Check className="h-3 w-3" /> : ''}
        </span>

        <span className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-white">{etapa.nome}</span>
          {alavanca && (
            <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              {alavanca.numero} {alavanca.nome}
            </span>
          )}
        </span>

        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            aberta && 'rotate-180'
          )}
        />
      </button>

      {aberta && (
        <div className="grid gap-5 border-t border-border/50 px-4 py-4 lg:grid-cols-[1fr_minmax(0,280px)]">
          {/* O que o aluno preenche */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Como acontece hoje</Label>
              <Textarea
                rows={3}
                value={dados.como_acontece}
                onChange={(e) => campo('como_acontece')(e.target.value)}
                placeholder="Descreva do jeito que é na prática, mesmo que ainda seja informal."
                className="bg-input/60 text-sm text-foreground"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Canal ou ferramenta</Label>
                <Input
                  value={dados.canal}
                  onChange={(e) => campo('canal')(e.target.value)}
                  placeholder="Instagram, CRM, planilha…"
                  className="h-9 bg-input/60 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Responsável</Label>
                <Input
                  value={dados.responsavel}
                  onChange={(e) => campo('responsavel')(e.target.value)}
                  placeholder="Quem toca esta etapa"
                  className="h-9 bg-input/60 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Indicador que mede</Label>
                <Input
                  value={dados.indicador}
                  onChange={(e) => campo('indicador')(e.target.value)}
                  placeholder="Qual número acompanham"
                  className="h-9 bg-input/60 text-sm"
                />
                {sugestao && !dados.indicador && (
                  <button
                    type="button"
                    onClick={() => campo('indicador')(sugestao)}
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    <Sparkles className="h-3 w-3" />
                    Usar do Funil Atual: {sugestao}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                disabled={salvando}
                onClick={() =>
                  iniciar(async () => {
                    const r = await salvarEtapaJornada(organizationId, etapa.id, dados)
                    if (r.ok) setSalvo(true)
                  })
                }
              >
                {salvando ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Salvando…
                  </>
                ) : (
                  'Salvar etapa'
                )}
              </Button>
              {salvo && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Check className="h-3 w-3" /> Salvo
                </span>
              )}
            </div>
          </div>

          {/* Referência fixa, ao lado */}
          <aside className="rounded-xl border border-border/50 bg-white/[0.02] p-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              O que esta etapa deveria ter
            </h4>
            <p className="mt-2 text-sm text-white/80">{etapa.referencia}</p>
            <p className="mt-3 text-[11px] italic text-muted-foreground">
              Referência de apoio. A comparação com o que você tem hoje é sua.
            </p>
          </aside>
        </div>
      )}
    </div>
  )
}
