'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { criarLead, moverLead } from './actions'
import { ETAPAS_LEAD, MOTIVOS_PERDA, type EtapaLead, type MotivoPerda } from '@/lib/vamo/comercial'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Plus, Stethoscope, X } from 'lucide-react'

type Lead = {
  id: string
  company_name: string
  contact_name: string | null
  email: string | null
  segment: string | null
  stage: EtapaLead
  lost_reason: string | null
  organization_id: string | null
}

export function QuadroLeads({ leads: iniciais }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(iniciais)
  const [novo, setNovo] = useState(false)
  const [perdendo, setPerdendo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [, iniciar] = useTransition()

  function mover(id: string, etapa: EtapaLead, motivo?: MotivoPerda) {
    if (etapa === 'perdido' && !motivo) {
      setPerdendo(id)
      return
    }
    setLeads((ls) =>
      ls.map((l) => (l.id === id ? { ...l, stage: etapa, lost_reason: motivo ?? null } : l))
    )
    setPerdendo(null)
    iniciar(async () => {
      const r = await moverLead(id, etapa, motivo)
      if (!r.ok) setErro(r.mensagem ?? 'Não foi possível mover o lead.')
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={() => setNovo((v) => !v)} variant={novo ? 'outline' : 'default'}>
          {novo ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {novo ? 'Cancelar' : 'Novo lead'}
        </Button>
        {erro && <span className="text-sm text-destructive">{erro}</span>}
      </div>

      {novo && <FormularioLead onPronto={() => setNovo(false)} />}

      <div className="flex gap-3 overflow-x-auto pb-4">
        {ETAPAS_LEAD.map((etapa) => {
          const daEtapa = leads.filter((l) => l.stage === etapa.id)
          return (
            <div key={etapa.id} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: etapa.cor }}
                    aria-hidden
                  />
                  {etapa.rotulo}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {daEtapa.length}
                </span>
              </div>

              <div className="space-y-2 rounded-xl border border-border/50 bg-card/40 p-2">
                {daEtapa.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">—</p>
                )}
                {daEtapa.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-lg border border-border/60 bg-card p-3"
                  >
                    <p className="truncate text-sm font-semibold text-white">
                      {lead.company_name}
                    </p>
                    {lead.contact_name && (
                      <p className="truncate text-xs text-muted-foreground">
                        {lead.contact_name}
                      </p>
                    )}
                    {lead.lost_reason && (
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-destructive">
                        {MOTIVOS_PERDA.find((m) => m.id === lead.lost_reason)?.rotulo}
                      </p>
                    )}

                    {perdendo === lead.id ? (
                      <div className="mt-2 space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground">
                          Motivo da perda
                        </Label>
                        <select
                          autoFocus
                          onChange={(e) =>
                            mover(lead.id, 'perdido', e.target.value as MotivoPerda)
                          }
                          defaultValue=""
                          className="h-8 w-full rounded border border-border/60 bg-input/60 px-2 text-xs text-white"
                        >
                          <option value="" disabled className="bg-card">
                            Selecione…
                          </option>
                          {MOTIVOS_PERDA.map((m) => (
                            <option key={m.id} value={m.id} className="bg-card">
                              {m.rotulo}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setPerdendo(null)}
                          className="text-[10px] text-muted-foreground hover:text-white"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-1.5">
                        <select
                          value={lead.stage}
                          onChange={(e) => mover(lead.id, e.target.value as EtapaLead)}
                          aria-label={`Etapa de ${lead.company_name}`}
                          className="h-7 flex-1 rounded border border-border/60 bg-input/60 px-1.5 text-[11px] text-white"
                        >
                          {ETAPAS_LEAD.map((e) => (
                            <option key={e.id} value={e.id} className="bg-card">
                              {e.rotulo}
                            </option>
                          ))}
                        </select>
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          title="Reunião diagnóstica"
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded border border-border/60 text-muted-foreground transition-colors hover:border-primary hover:text-primary'
                          )}
                        >
                          <Stethoscope className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FormularioLead({ onPronto }: { onPronto: () => void }) {
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, iniciar] = useTransition()

  return (
    <form
      action={(fd) =>
        iniciar(async () => {
          const r = await criarLead(null, fd)
          if (r.ok) onPronto()
          else setErro(r.mensagem ?? 'Não foi possível criar.')
        })
      }
      className="grid gap-3 rounded-xl border border-border/60 bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="company_name" className="text-xs">Empresa</Label>
        <Input id="company_name" name="company_name" required className="h-9 bg-input/60" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact_name" className="text-xs">Contato</Label>
        <Input id="contact_name" name="contact_name" className="h-9 bg-input/60" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs">E-mail</Label>
        <Input id="email" name="email" type="email" className="h-9 bg-input/60" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="segment" className="text-xs">Segmento</Label>
        <Input id="segment" name="segment" className="h-9 bg-input/60" />
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Button type="submit" size="sm" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Criar lead'}
        </Button>
        {erro && <span className="ml-3 text-sm text-destructive">{erro}</span>}
      </div>
    </form>
  )
}
