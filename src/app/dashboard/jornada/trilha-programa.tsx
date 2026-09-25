'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { marcarEtapa } from './actions'
import type { EtapaPrograma, ProgressoEtapa } from '@/lib/vamo/tipos'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, CircleDot, MonitorPlay, Radio, Users } from 'lucide-react'

const FORMATO: Record<EtapaPrograma['format'], { rotulo: string; icone: typeof Radio }> = {
  gravada: { rotulo: 'Aula gravada', icone: MonitorPlay },
  ao_vivo: { rotulo: 'Ao vivo', icone: Radio },
  presencial: { rotulo: 'Presencial', icone: Users },
}

export function TrilhaPrograma({
  organizationId,
  etapas,
  progresso,
  entregaveisProntos,
  org,
}: {
  organizationId: string
  etapas: EtapaPrograma[]
  progresso: ProgressoEtapa[]
  entregaveisProntos: number[]
  org?: string
}) {
  const [concluidas, setConcluidas] = useState<Set<number>>(
    () => new Set(progresso.filter((p) => p.status === 'concluida').map((p) => p.step_id))
  )
  const [salvando, iniciar] = useTransition()

  const prontos = new Set(entregaveisProntos)
  const total = etapas.length
  const feitas = concluidas.size
  const percentual = total > 0 ? Math.round((feitas / total) * 100) : 0

  // A etapa atual é a primeira ainda não concluída.
  const atual = etapas.find((e) => !concluidas.has(e.id)) ?? null

  function alternar(id: number) {
    const novo = new Set(concluidas)
    const vaiConcluir = !novo.has(id)
    if (vaiConcluir) novo.add(id)
    else novo.delete(id)
    setConcluidas(novo)
    iniciar(async () => {
      await marcarEtapa(organizationId, id, vaiConcluir)
    })
  }

  const comOrg = (r: string) => (org ? `${r}?org=${org}` : r)

  return (
    <div className="space-y-6">
      {/* Progresso */}
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
            <circle
              cx="18" cy="18" r="15.5" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(percentual / 100) * 97.4} 97.4`}
              className="transition-[stroke-dasharray] duration-700 ease-out"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
            {percentual}%
          </span>
        </div>
        <div>
          <div className="text-lg font-bold text-white">
            {feitas} de {total} etapas
          </div>
          <p className="text-sm text-muted-foreground">
            {atual ? `Você está em: ${atual.title}` : 'Programa concluído.'}
          </p>
        </div>
      </div>

      {/* Etapas */}
      <ol className="space-y-2">
        {etapas.map((etapa) => {
          const feita = concluidas.has(etapa.id)
          const ehAtual = atual?.id === etapa.id
          const Icone = FORMATO[etapa.format]?.icone ?? Radio
          const entregavelPronto = prontos.has(etapa.id)

          return (
            <li
              key={etapa.id}
              className={cn(
                'rounded-2xl border p-4 transition-colors sm:p-5',
                ehAtual
                  ? 'border-primary/50 bg-primary/[0.06]'
                  : feita
                    ? 'border-border/40 bg-card/50'
                    : 'border-border/60 bg-card'
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                  <button
                    type="button"
                    onClick={() => alternar(etapa.id)}
                    disabled={salvando}
                    aria-label={feita ? `Reabrir ${etapa.title}` : `Concluir ${etapa.title}`}
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors',
                      feita
                        ? 'border-primary bg-primary text-primary-foreground'
                        : ehAtual
                          ? 'border-primary text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/60'
                    )}
                  >
                    {feita ? <Check className="h-4 w-4" /> : etapa.step_order}
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icone className="h-3 w-3" />
                        {FORMATO[etapa.format]?.rotulo ?? etapa.format}
                      </span>
                      {ehAtual && (
                        <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-bold text-primary-foreground">
                          <CircleDot className="h-2.5 w-2.5" />
                          Você está aqui
                        </span>
                      )}
                    </div>

                    <h3
                      className={cn(
                        'mt-1 text-lg font-bold',
                        feita ? 'text-muted-foreground' : 'text-white'
                      )}
                    >
                      {etapa.title}
                    </h3>

                    {etapa.outcome && (
                      <p className="mt-1 text-sm text-muted-foreground">{etapa.outcome}</p>
                    )}

                    {etapa.deliverable && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground">Entregável:</span>
                        <span className={entregavelPronto ? 'text-primary' : 'text-white/70'}>
                          {etapa.deliverable}
                        </span>
                        {entregavelPronto && (
                          <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                            <Check className="h-2.5 w-2.5" /> Pronto
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {etapa.tool_route && (
                  <Button
                    variant={ehAtual ? 'default' : 'outline'}
                    size="sm"
                    className="shrink-0"
                    render={<Link href={comOrg(etapa.tool_route)} />}
                  >
                    Abrir ferramenta
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
