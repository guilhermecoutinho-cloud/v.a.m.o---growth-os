'use client'

import { useMemo, useState, useTransition } from 'react'
import { salvarDiagnostico, converterEmAluno } from '../actions'
import { BLOCOS_REUNIAO, PRODUTOS, type Produto } from '@/lib/vamo/comercial'
import { CAMPOS_SNAPSHOT, ROTULO_CAMPO, type CampoSnapshot } from '@/lib/vamo/modelo'
import { detectarPontos, tituloPonto } from '@/lib/vamo/investigacao'
import { formatarMoeda, formatarTaxa, taxasDe } from '@/lib/vamo/calculos'
import type { Snapshot } from '@/lib/vamo/tipos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, Copy, Search, UserPlus } from 'lucide-react'

type Lead = {
  id: string
  company_name: string
  contact_name: string | null
  email: string | null
  organization_id: string | null
}

const CAMPOS_REUNIAO: CampoSnapshot[] = [
  'investment',
  'leads',
  'mqls',
  'opportunities',
  'sales',
  'avg_ticket',
]

export function ReuniaoDiagnostica({
  lead,
  diagnosticoAnterior,
  pisos,
}: {
  lead: Lead
  diagnosticoAnterior: {
    current_revenue: number | null
    target_revenue: number | null
    snapshot_json: unknown
    lead_opinion_opportunity: string | null
    evidence_answer: string | null
    recommended_product: Produto | null
  } | null
  pisos: { lead_mql: number; mql_opp: number; opp_sale: number }
}) {
  const anterior = diagnosticoAnterior?.snapshot_json as
    | { valores?: Partial<Record<CampoSnapshot, number | null>>; desconhecidos?: CampoSnapshot[] }
    | null

  const [receitaAtual, setReceitaAtual] = useState<number | null>(
    diagnosticoAnterior?.current_revenue ?? null
  )
  const [meta, setMeta] = useState<number | null>(diagnosticoAnterior?.target_revenue ?? null)
  const [valores, setValores] = useState<Partial<Record<CampoSnapshot, number | null>>>(
    anterior?.valores ?? {}
  )
  const [desconhecidos, setDesconhecidos] = useState<Set<CampoSnapshot>>(
    new Set(anterior?.desconhecidos ?? [])
  )
  const [opiniao, setOpiniao] = useState(diagnosticoAnterior?.lead_opinion_opportunity ?? '')
  const [evidencia, setEvidencia] = useState(diagnosticoAnterior?.evidence_answer ?? '')
  const [produto, setProduto] = useState<Produto | null>(
    diagnosticoAnterior?.recommended_product ?? null
  )
  const [aberto, setAberto] = useState<string | null>('contexto')
  const [copiado, setCopiado] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, iniciar] = useTransition()

  const gap = meta != null && receitaAtual != null ? Math.max(0, meta - receitaAtual) : null

  // Mesma lógica do Funil Atual, com o snapshot montado na reunião.
  const snapshotReuniao = useMemo(
    () =>
      ({
        ...valores,
        revenue: receitaAtual,
        unknown_fields: [...desconhecidos],
        period: '',
        organization_id: '',
      }) as Snapshot,
    [valores, receitaAtual, desconhecidos]
  )

  const pontos = detectarPontos(snapshotReuniao, null, pisos)
  const principal = pontos.find((p) => p.maiorImpacto) ?? pontos[0] ?? null
  const ausentes = [...desconhecidos].map((c) => ROTULO_CAMPO[c])
  const taxas = taxasDe(snapshotReuniao)

  const resumo = useMemo(() => {
    const linhas = [
      `Diagnóstico — ${lead.company_name}`,
      '',
      `Receita atual: ${formatarMoeda(receitaAtual)}`,
      `Meta: ${formatarMoeda(meta)}`,
      gap != null ? `Gap: ${formatarMoeda(gap)}` : '',
      '',
      principal
        ? `Ponto de maior impacto potencial: ${tituloPonto(principal)}${
            principal.taxaAtual != null ? ` (sua taxa: ${formatarTaxa(principal.taxaAtual, 2)})` : ''
          }`
        : '',
      ausentes.length ? `Dados que ainda não são medidos: ${ausentes.join(', ')}.` : '',
      '',
      produto ? `Recomendação: ${PRODUTOS[produto].nome} — ${PRODUTOS[produto].preco}` : '',
    ]
    return linhas.filter(Boolean).join('\n')
  }, [lead.company_name, receitaAtual, meta, gap, principal, ausentes, produto])

  function alternarBloco(id: string) {
    setAberto((a) => (a === id ? null : id))
  }

  function definir(campo: CampoSnapshot, bruto: string) {
    const n = bruto === '' ? null : Number(bruto.replace(',', '.'))
    setValores((v) => ({ ...v, [campo]: n != null && Number.isFinite(n) ? n : null }))
  }

  return (
    <div className="space-y-3">
      {BLOCOS_REUNIAO.map((bloco) => {
        const estaAberto = aberto === bloco.id
        return (
          <section
            key={bloco.id}
            className={cn(
              'overflow-hidden rounded-2xl border transition-colors',
              estaAberto ? 'border-primary/40 bg-card' : 'border-border/60 bg-card/60'
            )}
          >
            <button
              type="button"
              onClick={() => alternarBloco(bloco.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <div>
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {bloco.minutos}
                </span>
                <h2 className="text-lg font-bold text-white">{bloco.titulo}</h2>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                  estaAberto && 'rotate-180'
                )}
              />
            </button>

            {estaAberto && (
              <div className="space-y-4 border-t border-border/50 px-5 py-4">
                <p className="rounded-lg bg-white/[0.03] p-3 text-sm italic text-muted-foreground">
                  {bloco.apoio}
                </p>

                {bloco.id === 'objetivo' && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Campo
                      rotulo="Receita atual (R$)"
                      valor={receitaAtual}
                      onChange={(v) => setReceitaAtual(v)}
                    />
                    <Campo rotulo="Meta (R$)" valor={meta} onChange={(v) => setMeta(v)} />
                    <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-3">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        Gap
                      </div>
                      <div className="mt-1 text-2xl font-bold text-white">
                        {formatarMoeda(gap)}
                      </div>
                    </div>
                  </div>
                )}

                {bloco.id === 'maquina' && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {CAMPOS_REUNIAO.map((campo) => (
                        <div key={campo} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm">{ROTULO_CAMPO[campo]}</Label>
                            <label className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground">
                              <input
                                type="checkbox"
                                checked={desconhecidos.has(campo)}
                                onChange={() =>
                                  setDesconhecidos((s) => {
                                    const n = new Set(s)
                                    if (n.has(campo)) n.delete(campo)
                                    else {
                                      n.add(campo)
                                      setValores((v) => ({ ...v, [campo]: null }))
                                    }
                                    return n
                                  })
                                }
                                className="h-3 w-3 accent-primary"
                              />
                              Não sei
                            </label>
                          </div>
                          <Input
                            type="number"
                            disabled={desconhecidos.has(campo)}
                            value={desconhecidos.has(campo) ? '' : (valores[campo] ?? '')}
                            onChange={(e) => definir(campo, e.target.value)}
                            placeholder={desconhecidos.has(campo) ? 'Não medido' : '0'}
                            className={cn(
                              'h-10 bg-input/60',
                              desconhecidos.has(campo) && 'border-dashed'
                            )}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-lg bg-white/[0.03] p-3 text-sm">
                      <span className="text-muted-foreground">
                        Lead → MQL: <strong className="text-white">{formatarTaxa(taxas.lead_mql)}</strong>
                      </span>
                      <span className="text-muted-foreground">
                        MQL → Opp: <strong className="text-white">{formatarTaxa(taxas.mql_opp)}</strong>
                      </span>
                      <span className="text-muted-foreground">
                        Opp → Venda: <strong className="text-white">{formatarTaxa(taxas.opp_sale)}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {bloco.id === 'diagnostico' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm">
                        Onde você acredita que está a maior oportunidade?
                      </Label>
                      <Textarea
                        rows={2}
                        value={opiniao}
                        onChange={(e) => setOpiniao(e.target.value)}
                        className="bg-input/60"
                        placeholder="Resposta do lead, nas palavras dele."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">E qual dado prova isso?</Label>
                      <Textarea
                        rows={2}
                        value={evidencia}
                        onChange={(e) => setEvidencia(e.target.value)}
                        className="bg-input/60"
                      />
                    </div>

                    {principal && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-4">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-amber-400">
                          <Search className="h-3 w-3" />
                          Ponto de maior impacto potencial
                        </div>
                        <p className="mt-1 text-lg font-bold text-white">
                          {tituloPonto(principal)}
                        </p>
                        {principal.taxaAtual != null && (
                          <p className="text-sm text-muted-foreground">
                            Sua taxa: {formatarTaxa(principal.taxaAtual, 2)}
                          </p>
                        )}
                      </div>
                    )}

                    {ausentes.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-white/80">Ainda não medido:</strong>{' '}
                        {ausentes.join(', ')}. Não saber também é um dado.
                      </p>
                    )}
                  </div>
                )}

                {bloco.id === 'prescricao' && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(Object.keys(PRODUTOS) as Produto[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setProduto(p)}
                        className={cn(
                          'rounded-xl border p-4 text-left transition-colors',
                          produto === p
                            ? 'border-primary bg-primary/[0.08]'
                            : 'border-border/60 hover:border-border'
                        )}
                      >
                        <div className="text-sm font-bold text-white">{PRODUTOS[p].nome}</div>
                        <div className="mt-0.5 text-lg font-bold text-primary">
                          {PRODUTOS[p].preco}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{PRODUTOS[p].quando}</p>
                      </button>
                    ))}
                  </div>
                )}

                {bloco.id === 'investimento' && (
                  <div className="space-y-4">
                    <p className="text-sm text-white">
                      Considerando o problema que identificamos, faz sentido construir isso dentro
                      da sua empresa agora?
                    </p>

                    <div className="rounded-xl border border-border/60 bg-white/[0.02] p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Resumo D0
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await navigator.clipboard.writeText(resumo)
                            setCopiado(true)
                            setTimeout(() => setCopiado(false), 2000)
                          }}
                        >
                          {copiado ? (
                            <>
                              <Check className="mr-1.5 h-3 w-3" /> Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1.5 h-3 w-3" /> Copiar
                            </>
                          )}
                        </Button>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {resumo}
                      </pre>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        disabled={salvando}
                        onClick={() =>
                          iniciar(async () => {
                            const r = await salvarDiagnostico({
                              leadId: lead.id,
                              receitaAtual,
                              meta,
                              snapshot: valores,
                              camposDesconhecidos: [...desconhecidos],
                              opiniaoLead: opiniao,
                              evidencia,
                              produto,
                              resumo,
                            })
                            setMensagem(r.ok ? 'Diagnóstico salvo.' : (r.mensagem ?? 'Falhou.'))
                          })
                        }
                      >
                        Salvar diagnóstico
                      </Button>

                      {!lead.organization_id && (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={salvando || !lead.email}
                          title={!lead.email ? 'O lead precisa de e-mail' : undefined}
                          onClick={() =>
                            iniciar(async () => {
                              const r = await converterEmAluno(lead.id)
                              setMensagem(r.mensagem ?? (r.ok ? 'Convertido.' : 'Falhou.'))
                            })
                          }
                        >
                          <UserPlus className="mr-1.5 h-4 w-4" />
                          Converter em aluno
                        </Button>
                      )}
                    </div>

                    {mensagem && <p className="text-sm text-primary">{mensagem}</p>}
                  </div>
                )}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function Campo({
  rotulo,
  valor,
  onChange,
}: {
  rotulo: string
  valor: number | null
  onChange: (v: number | null) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{rotulo}</Label>
      <Input
        type="number"
        value={valor ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="h-10 bg-input/60"
      />
    </div>
  )
}
