import type { No, CampoSnapshot } from './modelo'
import { NO_POR_ID, ROTULO_CAMPO } from './modelo'
import type { Snapshot, Cenario } from './tipos'
import { taxasDe, impactoPotencial, taxa } from './calculos'

/**
 * Motor de investigação.
 *
 * REGRA METODOLÓGICA: uma taxa baixa mostra ONDE olhar, nunca POR QUÊ.
 * Nada aqui afirma causa. O vocabulário é "ponto para investigar",
 * "possíveis causas", "maior impacto potencial" — nunca "gargalo",
 * "erro" ou "problema identificado".
 */

/** Pisos de referência. Editáveis pelo admin na tabela settings. */
export const PISOS_PADRAO: Record<'lead_mql' | 'mql_opp' | 'opp_sale', number> = {
  lead_mql: 20,
  mql_opp: 20,
  opp_sale: 15,
}

export type MotivoInvestigacao = 'abaixo_da_meta' | 'abaixo_do_piso' | 'dado_ausente'

export type PontoParaInvestigar = {
  no: No
  motivo: MotivoInvestigacao
  taxaAtual: number | null
  taxaAlvo: number | null
  impacto: number | null
  /** Só para dado ausente. */
  campoAusente?: CampoSnapshot
  maiorImpacto: boolean
}

type Pisos = typeof PISOS_PADRAO

/** Qual campo do snapshot pertence a qual nó. */
const CAMPO_DO_NO: Partial<Record<CampoSnapshot, No>> = {
  leads: 'aquisicao',
  investment: 'aquisicao',
  mqls: 'lead_mql',
  opportunities: 'mql_opp',
  sales: 'opp_sale',
  avg_ticket: 'ticket',
  revenue: 'ticket',
  repurchase_rate: 'retencao',
  churn_rate: 'retencao',
  referral_rate: 'retencao',
}

/**
 * Detecta os pontos que merecem investigação e os ordena por impacto
 * potencial em receita. "Não otimize tudo. Otimize o que limita o
 * sistema."
 */
export function detectarPontos(
  snapshot: Snapshot | null,
  cenarioMeta: Cenario | null,
  pisos: Pisos = PISOS_PADRAO
): PontoParaInvestigar[] {
  if (!snapshot) return []

  const pontos: PontoParaInvestigar[] = []
  const t = taxasDe(snapshot)

  const nosDeTaxa: Array<{
    no: Extract<No, 'lead_mql' | 'mql_opp' | 'opp_sale'>
    atual: number | null
    alvoCenario: number | null
  }> = [
    { no: 'lead_mql', atual: t.lead_mql, alvoCenario: cenarioMeta?.rate_lead_mql ?? null },
    { no: 'mql_opp', atual: t.mql_opp, alvoCenario: cenarioMeta?.rate_mql_opp ?? null },
    { no: 'opp_sale', atual: t.opp_sale, alvoCenario: cenarioMeta?.rate_opp_sale ?? null },
  ]

  for (const { no, atual, alvoCenario } of nosDeTaxa) {
    if (atual == null) continue

    const piso = pisos[no]
    const abaixoDaMeta = alvoCenario != null && atual < alvoCenario
    const abaixoDoPiso = atual < piso

    if (!abaixoDaMeta && !abaixoDoPiso) continue

    // O alvo é o mais exigente entre a meta do cenário e o piso.
    const alvo = abaixoDaMeta ? alvoCenario! : piso
    pontos.push({
      no,
      motivo: abaixoDaMeta ? 'abaixo_da_meta' : 'abaixo_do_piso',
      taxaAtual: atual,
      taxaAlvo: alvo,
      impacto: impactoPotencial(snapshot, no, alvo),
      maiorImpacto: false,
    })
  }

  // Dados ausentes viram investigação própria: não saber também é dado.
  for (const campo of snapshot.unknown_fields ?? []) {
    const no = CAMPO_DO_NO[campo]
    if (!no) continue
    if (pontos.some((p) => p.no === no && p.motivo === 'dado_ausente')) continue
    pontos.push({
      no,
      motivo: 'dado_ausente',
      taxaAtual: null,
      taxaAlvo: null,
      impacto: null,
      campoAusente: campo,
      maiorImpacto: false,
    })
  }

  // Ordena por impacto; dados ausentes ficam ao final (impacto nulo).
  pontos.sort((a, b) => (b.impacto ?? -1) - (a.impacto ?? -1))

  const primeiroComImpacto = pontos.find((p) => (p.impacto ?? 0) > 0)
  if (primeiroComImpacto) primeiroComImpacto.maiorImpacto = true

  return pontos
}

/** Texto do selo, sempre no vocabulário de investigação. */
export function rotuloMotivo(p: PontoParaInvestigar): string {
  if (p.motivo === 'dado_ausente') {
    return `Você ainda não mede ${ROTULO_CAMPO[p.campoAusente!] ?? p.campoAusente}`
  }
  if (p.motivo === 'abaixo_da_meta') return 'Abaixo do necessário para a meta'
  return 'Abaixo do piso de referência'
}

export function tituloPonto(p: PontoParaInvestigar): string {
  return NO_POR_ID[p.no]?.rotulo ?? p.no
}

/**
 * Troca os {placeholders} do template pelos números reais.
 * O que não tiver valor vira "—", nunca "undefined".
 */
export function preencherTemplate(
  template: string,
  dados: Record<string, string | number | null | undefined>
): string {
  return template.replace(/\{(\w+)\}/g, (_, chave) => {
    const v = dados[chave]
    return v == null || v === '' ? '—' : String(v)
  })
}

/** Quebra "SE ... ENTÃO ... PORQUE ..." nas três partes do formulário. */
export function separarSeEntaoPorque(texto: string): {
  se: string
  entao: string
  porque: string
} {
  // [\s\S] no lugar do flag /s, que exigiria target ES2018.
  const m = texto.match(/SE\s+([\s\S]*?),?\s*ENT[ÃA]O\s+([\s\S]*?),?\s*PORQUE\s+([\s\S]*)$/i)
  if (!m) return { se: texto, entao: '', porque: '' }
  return {
    se: m[1].trim().replace(/[.,]$/, ''),
    entao: m[2].trim().replace(/[.,]$/, ''),
    porque: m[3].trim().replace(/[.]$/, ''),
  }
}

/** Dados disponíveis para preencher templates a partir do snapshot. */
export function dadosDoTemplate(
  s: Snapshot,
  ponto: PontoParaInvestigar,
  necessario?: { leads?: number; investimento?: number }
): Record<string, string | number | null> {
  const t = taxasDe(s)
  const fmt = (v: number | null) => (v == null ? null : `${v.toFixed(2).replace('.', ',')}%`)
  return {
    taxa_atual: fmt(ponto.taxaAtual),
    taxa_meta: fmt(ponto.taxaAlvo),
    leads: s.leads,
    mqls: s.mqls,
    oportunidades: s.opportunities,
    vendas: s.sales,
    cpl: t.cpl != null ? t.cpl.toFixed(2).replace('.', ',') : null,
    ticket: s.avg_ticket,
    leads_necessarios: necessario?.leads ?? null,
    investimento_necessario: necessario?.investimento ?? null,
  }
}
