'use client'

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { criarHipotese, descartarCausa } from '@/app/dashboard/hipoteses/actions'
import {
  type PontoParaInvestigar,
  tituloPonto,
  rotuloMotivo,
  preencherTemplate,
  separarSeEntaoPorque,
  dadosDoTemplate,
} from '@/lib/vamo/investigacao'
import { ALAVANCAS, NO_POR_ID, ROTULO_CAMPO } from '@/lib/vamo/modelo'
import { formatarTaxa, formatarMoeda } from '@/lib/vamo/calculos'
import type { Snapshot, ItemBiblioteca } from '@/lib/vamo/tipos'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Bot, Check, ChevronDown, Plus, Search, X } from 'lucide-react'

/**
 * REGRA METODOLÓGICA: este painel mostra ONDE olhar, nunca POR QUÊ.
 * Nenhum texto aqui afirma causa. O "experimento possível" só aparece
 * depois que a pessoa escolhe uma causa e a transforma em hipótese.
 */
export function PainelInvestigacao({
  organizationId,
  snapshot,
  pontos,
}: {
  organizationId: string
  snapshot: Snapshot
  pontos: PontoParaInvestigar[]
}) {
  const [selecionado, setSelecionado] = useState(0)
  const ponto = pontos[selecionado]
  const [biblioteca, setBiblioteca] = useState<ItemBiblioteca[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let vivo = true
    setCarregando(true)
    const supabase = createClient()
    supabase
      .from('hypothesis_library')
      .select('*')
      .eq('node', ponto?.no ?? '')
      .eq('active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (!vivo) return
        setBiblioteca((data ?? []) as ItemBiblioteca[])
        setCarregando(false)
      })
    return () => {
      vivo = false
    }
  }, [ponto?.no])

  if (!ponto) return null

  const alavanca = ALAVANCAS[NO_POR_ID[ponto.no].alavanca]
  const ehDadoAusente = ponto.motivo === 'dado_ausente'

  return (
    <section className="rounded-2xl border border-amber-500/25 bg-card p-5 sm:p-6">
      <header className="flex items-center gap-2">
        <Search className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-400">
          Pontos para investigar
        </h3>
      </header>

      {/* Abas dos pontos, ordenados por impacto */}
      {pontos.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {pontos.map((p, i) => (
            <button
              key={`${p.no}-${p.motivo}`}
              type="button"
              onClick={() => setSelecionado(i)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs transition-colors',
                i === selecionado
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                  : 'border-border/60 text-muted-foreground hover:text-white'
              )}
            >
              {tituloPonto(p)}
              {p.maiorImpacto && <span className="ml-1.5 text-[10px]">★</span>}
            </button>
          ))}
        </div>
      )}

      {/* Cabeçalho do ponto */}
      <div className="mt-5 space-y-3 rounded-xl bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h4 className="text-lg font-bold text-white">{tituloPonto(ponto)}</h4>
          {ponto.maiorImpacto && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Maior impacto potencial
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {!ehDadoAusente && (
            <>
              <span className="text-muted-foreground">
                Sua taxa: <strong className="text-white">{formatarTaxa(ponto.taxaAtual, 2)}</strong>
              </span>
              <span className="text-muted-foreground">
                Necessária: <strong className="text-white">{formatarTaxa(ponto.taxaAlvo)}</strong>
              </span>
              {ponto.impacto != null && ponto.impacto > 0 && (
                <span className="text-muted-foreground">
                  Impacto potencial:{' '}
                  <strong className="text-primary">+{formatarMoeda(ponto.impacto)}/mês</strong>
                </span>
              )}
            </>
          )}
          <span className="text-muted-foreground">
            Alavanca:{' '}
            <strong className="text-white">
              {alavanca.numero} {alavanca.nome}
            </strong>
          </span>
        </div>

        <p className="border-l-2 border-amber-500/40 pl-3 text-sm italic text-muted-foreground">
          {ehDadoAusente
            ? 'Sem esse dado, não dá para saber se este ponto limita sua máquina. Não saber já é uma descoberta importante.'
            : 'Uma taxa baixa mostra ONDE olhar, não POR QUÊ. Abaixo estão possíveis causas. Verifique antes de agir.'}
        </p>
        <p className="text-xs text-muted-foreground">{rotuloMotivo(ponto)}</p>
      </div>

      {/* Causas ou ações de medição */}
      {ehDadoAusente ? (
        <MedirDado
          organizationId={organizationId}
          ponto={ponto}
          snapshot={snapshot}
        />
      ) : (
        <div className="mt-5">
          <h5 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Possíveis causas para investigar
          </h5>

          {carregando ? (
            <div className="h-24 animate-pulse rounded-xl bg-white/5" />
          ) : (
            <div className="divide-y divide-border/50 overflow-hidden rounded-xl border border-border/60">
              {biblioteca.map((item) => (
                <LinhaCausa
                  key={item.id}
                  item={item}
                  ponto={ponto}
                  snapshot={snapshot}
                  organizationId={organizationId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <HipoteseLivre organizationId={organizationId} ponto={ponto} snapshot={snapshot} />
        <Button
          type="button"
          variant="outline"
          disabled
          title="Disponível em breve"
          className="text-muted-foreground"
        >
          <Bot className="mr-2 h-4 w-4" />
          Perguntar ao Mentor IA — em breve
        </Button>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- */

function LinhaCausa({
  item,
  ponto,
  snapshot,
  organizationId,
}: {
  item: ItemBiblioteca
  ponto: PontoParaInvestigar
  snapshot: Snapshot
  organizationId: string
}) {
  const [aberto, setAberto] = useState(false)
  const [modo, setModo] = useState<'nenhum' | 'hipotese' | 'descarte'>('nenhum')
  const [feito, setFeito] = useState<string | null>(null)

  if (feito) {
    return (
      <div className="flex items-center gap-2 bg-primary/[0.05] px-4 py-3 text-sm text-primary">
        <Check className="h-4 w-4" />
        {feito}
      </div>
    )
  }

  return (
    <div className="bg-card">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
      >
        <ChevronDown
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            aberto && 'rotate-180'
          )}
        />
        <span className="text-sm text-white">{item.cause_title}</span>
      </button>

      {aberto && (
        <div className="space-y-3 px-4 pb-4 pl-11 text-sm">
          <p className="text-muted-foreground">
            <strong className="text-white/80">Como verificar:</strong> {item.how_to_check}
          </p>
          <p className="text-muted-foreground">
            <strong className="text-white/80">Dado que confirma ou descarta:</strong>{' '}
            {item.confirming_data}
          </p>

          {modo === 'nenhum' && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="button" size="sm" onClick={() => setModo('hipotese')}>
                Transformar em hipótese
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setModo('descarte')}
              >
                Descartar
              </Button>
            </div>
          )}

          {modo === 'hipotese' && (
            <FormularioHipotese
              organizationId={organizationId}
              ponto={ponto}
              snapshot={snapshot}
              item={item}
              onCancelar={() => setModo('nenhum')}
              onPronto={() => setFeito('Hipótese criada. Veja em Hipóteses.')}
            />
          )}

          {modo === 'descarte' && (
            <FormularioDescarte
              organizationId={organizationId}
              ponto={ponto}
              item={item}
              onCancelar={() => setModo('nenhum')}
              onPronto={() => setFeito('Causa descartada. O registro fica no histórico.')}
            />
          )}
        </div>
      )}
    </div>
  )
}

function FormularioHipotese({
  organizationId,
  ponto,
  snapshot,
  item,
  onCancelar,
  onPronto,
}: {
  organizationId: string
  ponto: PontoParaInvestigar
  snapshot: Snapshot
  item?: ItemBiblioteca
  onCancelar: () => void
  onPronto: () => void
}) {
  const dados = dadosDoTemplate(snapshot, ponto)
  const partes = item
    ? separarSeEntaoPorque(preencherTemplate(item.hypothesis_template, dados))
    : { se: '', entao: '', porque: '' }

  const [se, setSe] = useState(partes.se)
  const [entao, setEntao] = useState(partes.entao)
  const [porque, setPorque] = useState(partes.porque)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, iniciar] = useTransition()

  function salvar() {
    iniciar(async () => {
      const r = await criarHipotese({
        organizationId,
        no: ponto.no,
        alavanca: NO_POR_ID[ponto.no].alavanca,
        se,
        entao,
        porque,
        itemBibliotecaId: item?.id ?? null,
        contexto: {
          periodo: snapshot.period,
          taxa_atual: ponto.taxaAtual,
          taxa_alvo: ponto.taxaAlvo,
          impacto: ponto.impacto,
        },
        status: 'a_testar',
      })
      if (r.ok) onPronto()
      else setErro(r.mensagem ?? 'Não foi possível salvar.')
    })
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-white/[0.02] p-4">
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">SE</Label>
        <Textarea
          value={se}
          onChange={(e) => setSe(e.target.value)}
          rows={2}
          className="bg-input/60 text-sm text-foreground"
          placeholder="a ação que você vai tomar"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">ENTÃO</Label>
        <Textarea
          value={entao}
          onChange={(e) => setEntao(e.target.value)}
          rows={2}
          className="bg-input/60 text-sm text-foreground"
          placeholder="o resultado que você espera"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">PORQUE</Label>
        <Textarea
          value={porque}
          onChange={(e) => setPorque(e.target.value)}
          rows={2}
          className="bg-input/60 text-sm text-foreground"
          placeholder="a evidência ou o racional"
        />
        <p className="text-xs text-muted-foreground">
          Qual dado sustenta isso? Se ainda não existe, escreva o que você vai levantar.
        </p>
      </div>

      {item && (
        <div className="rounded-lg bg-primary/[0.06] p-3 text-xs text-muted-foreground">
          <strong className="text-primary">Experimento possível:</strong> {item.possible_experiment}
        </div>
      )}

      {erro && <p className="text-xs text-destructive">{erro}</p>}

      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar hipótese'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

function FormularioDescarte({
  organizationId,
  ponto,
  item,
  onCancelar,
  onPronto,
}: {
  organizationId: string
  ponto: PontoParaInvestigar
  item: ItemBiblioteca
  onCancelar: () => void
  onPronto: () => void
}) {
  const [motivo, setMotivo] = useState('')
  const [salvando, iniciar] = useTransition()

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-white/[0.02] p-4">
      <Label className="text-xs text-muted-foreground">
        Por que você está descartando? (opcional)
      </Label>
      <Textarea
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        rows={2}
        className="bg-input/60 text-sm text-foreground"
        placeholder="Ex.: já verificamos e o critério está documentado."
      />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={salvando}
          onClick={() =>
            iniciar(async () => {
              await descartarCausa({
                organizationId,
                no: ponto.no,
                alavanca: NO_POR_ID[ponto.no].alavanca,
                tituloCausa: item.cause_title,
                motivo,
                itemBibliotecaId: item.id,
              })
              onPronto()
            })
          }
        >
          {salvando ? 'Registrando…' : 'Confirmar descarte'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

function HipoteseLivre({
  organizationId,
  ponto,
  snapshot,
}: {
  organizationId: string
  ponto: PontoParaInvestigar
  snapshot: Snapshot
}) {
  const [aberto, setAberto] = useState(false)
  const [feito, setFeito] = useState(false)

  if (feito) {
    return (
      <span className="flex items-center gap-2 text-sm text-primary">
        <Check className="h-4 w-4" /> Hipótese criada.
      </span>
    )
  }

  if (!aberto) {
    return (
      <Button type="button" variant="outline" onClick={() => setAberto(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Escrever minha própria hipótese
      </Button>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-white">Nova hipótese</span>
        <button type="button" onClick={() => setAberto(false)} aria-label="Fechar">
          <X className="h-4 w-4 text-muted-foreground hover:text-white" />
        </button>
      </div>
      <FormularioHipotese
        organizationId={organizationId}
        ponto={ponto}
        snapshot={snapshot}
        onCancelar={() => setAberto(false)}
        onPronto={() => {
          setAberto(false)
          setFeito(true)
        }}
      />
    </div>
  )
}

function MedirDado({
  organizationId,
  ponto,
  snapshot,
}: {
  organizationId: string
  ponto: PontoParaInvestigar
  snapshot: Snapshot
}) {
  const campo = ponto.campoAusente ? ROTULO_CAMPO[ponto.campoAusente] : 'este dado'
  const [feito, setFeito] = useState(false)
  const [salvando, iniciar] = useTransition()

  return (
    <div className="mt-5 space-y-3">
      <h5 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Como passar a medir
      </h5>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li>• Definir quem é responsável por registrar {campo}.</li>
        <li>• Definir onde o dado será registrado (CRM, planilha).</li>
        <li>• Registrar o número a partir do próximo mês.</li>
      </ul>

      {feito ? (
        <p className="flex items-center gap-2 text-sm text-primary">
          <Check className="h-4 w-4" /> Tarefa de medição criada em Hipóteses.
        </p>
      ) : (
        <Button
          type="button"
          size="sm"
          disabled={salvando}
          onClick={() =>
            iniciar(async () => {
              await criarHipotese({
                organizationId,
                no: ponto.no,
                alavanca: NO_POR_ID[ponto.no].alavanca,
                se: `passarmos a medir ${campo}`,
                entao: 'poderemos diagnosticar este nó',
                porque: 'hoje a decisão é tomada sem evidência',
                contexto: { periodo: snapshot.period, campo_ausente: ponto.campoAusente },
                status: 'rascunho',
              })
              setFeito(true)
            })
          }
        >
          Criar tarefa de medição
        </Button>
      )}
    </div>
  )
}
