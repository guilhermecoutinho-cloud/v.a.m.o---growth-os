'use client'

import { useMemo, useState, useTransition } from 'react'
import { salvarCanal, removerCanal, type CanalId } from './actions'
import type { LinhaCanal } from './page'
import { formatarMoeda, formatarNumero } from '@/lib/vamo/calculos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AlertTriangle, Plus, Trash2, X } from 'lucide-react'

const CANAIS: Array<{ id: CanalId; rotulo: string }> = [
  { id: 'meta_ads', rotulo: 'Meta Ads' },
  { id: 'google_ads', rotulo: 'Google Ads' },
  { id: 'organico', rotulo: 'Orgânico' },
  { id: 'indicacao', rotulo: 'Indicação' },
  { id: 'outbound', rotulo: 'Outbound' },
  { id: 'outro', rotulo: 'Outro' },
]

const ROTULO = Object.fromEntries(CANAIS.map((c) => [c.id, c.rotulo]))

/** CPL e CAC são derivados: nunca divergem da verba e do volume. */
function cpl(investimento: number | null, leads: number | null) {
  if (investimento == null || !leads) return null
  return investimento / leads
}
function cac(investimento: number | null, vendas: number | null) {
  if (investimento == null || !vendas) return null
  return investimento / vendas
}

export function TabelaCanais({
  organizationId,
  periodo,
  canais,
  leadsDoFunil,
}: {
  organizationId: string
  periodo: string
  canais: LinhaCanal[]
  leadsDoFunil: number | null
}) {
  const [linhas, setLinhas] = useState(canais)
  const [novo, setNovo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [, iniciar] = useTransition()

  const totais = useMemo(() => {
    const soma = (f: (l: LinhaCanal) => number | null) =>
      linhas.reduce((t, l) => t + (f(l) ?? 0), 0)
    const investimento = soma((l) => l.investment)
    const leads = soma((l) => l.leads)
    const vendas = soma((l) => l.sales)
    return {
      investimento,
      alcance: soma((l) => l.reach),
      leads,
      vendas,
      cpl: cpl(investimento, leads),
      cac: cac(investimento, vendas),
    }
  }, [linhas])

  // O total daqui deveria bater com o Funil Atual do mesmo mês.
  const divergencia =
    leadsDoFunil != null && totais.leads > 0 && leadsDoFunil !== totais.leads

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button onClick={() => setNovo((v) => !v)} variant={novo ? 'outline' : 'default'}>
          {novo ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {novo ? 'Cancelar' : 'Adicionar canal'}
        </Button>
        {erro && <span className="text-sm text-destructive">{erro}</span>}
      </div>

      {novo && (
        <FormularioCanal
          organizationId={organizationId}
          periodo={periodo}
          usados={linhas.map((l) => l.channel)}
          onPronto={(linha) => {
            setLinhas((ls) => [...ls, linha])
            setNovo(false)
          }}
          onErro={setErro}
        />
      )}

      {linhas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 py-14 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum canal registrado neste mês.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sem isso, não dá para saber de onde vêm os leads nem quanto custam.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left">
                <Th>Canal</Th>
                <Th alinhar="right">Verba</Th>
                <Th alinhar="right">Alcance</Th>
                <Th alinhar="right">Leads</Th>
                <Th alinhar="right">Vendas</Th>
                <Th alinhar="right">CPL</Th>
                <Th alinhar="right">CAC</Th>
                <Th alinhar="right"> </Th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.id} className="border-b border-border/40 last:border-0">
                  <Td>
                    <span className="font-medium text-white">
                      {l.channel === 'outro' && l.channel_other
                        ? l.channel_other
                        : (ROTULO[l.channel] ?? l.channel)}
                    </span>
                  </Td>
                  <Td alinhar="right">{formatarMoeda(l.investment)}</Td>
                  <Td alinhar="right">{formatarNumero(l.reach)}</Td>
                  <Td alinhar="right">{formatarNumero(l.leads)}</Td>
                  <Td alinhar="right">{formatarNumero(l.sales)}</Td>
                  <Td alinhar="right" destaque>
                    {formatarMoeda(cpl(l.investment, l.leads))}
                  </Td>
                  <Td alinhar="right" destaque>
                    {formatarMoeda(cac(l.investment, l.sales))}
                  </Td>
                  <Td alinhar="right">
                    <button
                      type="button"
                      aria-label={`Remover ${ROTULO[l.channel] ?? l.channel}`}
                      onClick={() => {
                        setLinhas((ls) => ls.filter((x) => x.id !== l.id))
                        iniciar(async () => {
                          await removerCanal(l.id)
                        })
                      }}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border/60 bg-white/[0.02]">
                <Td>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Total
                  </span>
                </Td>
                <Td alinhar="right">{formatarMoeda(totais.investimento)}</Td>
                <Td alinhar="right">{formatarNumero(totais.alcance)}</Td>
                <Td alinhar="right">{formatarNumero(totais.leads)}</Td>
                <Td alinhar="right">{formatarNumero(totais.vendas)}</Td>
                <Td alinhar="right" destaque>
                  {formatarMoeda(totais.cpl)}
                </Td>
                <Td alinhar="right" destaque>
                  {formatarMoeda(totais.cac)}
                </Td>
                <Td> </Td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {divergencia && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-3 text-xs text-amber-300/90">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          Os canais somam {formatarNumero(totais.leads)} leads, mas o Funil Atual registra{' '}
          {formatarNumero(leadsDoFunil)} neste mês. Vale conferir de onde vem a diferença.
        </p>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- */

function Th({
  children,
  alinhar = 'left',
}: {
  children: React.ReactNode
  alinhar?: 'left' | 'right'
}) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
        alinhar === 'right' && 'text-right'
      )}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  alinhar = 'left',
  destaque,
}: {
  children: React.ReactNode
  alinhar?: 'left' | 'right'
  destaque?: boolean
}) {
  return (
    <td
      className={cn(
        'px-4 py-3 tabular-nums',
        alinhar === 'right' && 'text-right',
        destaque ? 'font-semibold text-primary' : 'text-muted-foreground'
      )}
    >
      {children}
    </td>
  )
}

function FormularioCanal({
  organizationId,
  periodo,
  usados,
  onPronto,
  onErro,
}: {
  organizationId: string
  periodo: string
  usados: string[]
  onPronto: (l: LinhaCanal) => void
  onErro: (m: string | null) => void
}) {
  const disponiveis = CANAIS.filter((c) => c.id === 'outro' || !usados.includes(c.id))
  const [canal, setCanal] = useState<CanalId>(disponiveis[0]?.id ?? 'outro')
  const [outro, setOutro] = useState('')
  const [salvando, iniciar] = useTransition()

  function enviar(fd: FormData) {
    const num = (k: string) => {
      const v = String(fd.get(k) ?? '').trim()
      return v === '' ? null : Number(v.replace(',', '.'))
    }
    const entrada = {
      organizationId,
      periodo,
      canal,
      canalOutro: outro,
      investimento: num('investment'),
      alcance: num('reach'),
      leads: num('leads'),
      vendas: num('sales'),
    }

    iniciar(async () => {
      const r = await salvarCanal(entrada)
      if (!r.ok) {
        onErro(r.mensagem ?? 'Não foi possível salvar.')
        return
      }
      onErro(null)
      onPronto({
        id: crypto.randomUUID(),
        channel: canal,
        channel_other: canal === 'outro' ? outro : null,
        investment: entrada.investimento,
        reach: entrada.alcance,
        leads: entrada.leads,
        sales: entrada.vendas,
      })
    })
  }

  return (
    <form
      action={enviar}
      className="grid gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div className="space-y-1.5">
        <Label className="text-xs">Canal</Label>
        <select
          value={canal}
          onChange={(e) => setCanal(e.target.value as CanalId)}
          className="h-9 w-full rounded-lg border border-border/60 bg-input/60 px-2 text-sm text-white"
        >
          {disponiveis.map((c) => (
            <option key={c.id} value={c.id} className="bg-card">
              {c.rotulo}
            </option>
          ))}
        </select>
        {canal === 'outro' && (
          <Input
            value={outro}
            onChange={(e) => setOutro(e.target.value)}
            required
            placeholder="Nome do canal"
            className="h-9 bg-input/60 text-sm"
          />
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="investment" className="text-xs">Verba (R$)</Label>
        <Input id="investment" name="investment" type="number" className="h-9 bg-input/60" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reach" className="text-xs">Alcance</Label>
        <Input id="reach" name="reach" type="number" className="h-9 bg-input/60" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="leads" className="text-xs">Leads</Label>
        <Input id="leads" name="leads" type="number" className="h-9 bg-input/60" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sales" className="text-xs">Vendas</Label>
        <Input id="sales" name="sales" type="number" className="h-9 bg-input/60" />
      </div>

      <div className="sm:col-span-2 lg:col-span-5">
        <Button type="submit" size="sm" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar canal'}
        </Button>
        <span className="ml-3 text-xs text-muted-foreground">
          CPL e CAC são calculados a partir destes números.
        </span>
      </div>
    </form>
  )
}
