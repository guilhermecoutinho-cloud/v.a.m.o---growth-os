import type { No } from './modelo'
import type { Snapshot } from './tipos'

/**
 * Matemática da máquina, sem React e sem banco: entra número, sai
 * número. Fica isolada aqui para que Dashboard, Funil e Arquitetura
 * cheguem sempre ao mesmo resultado.
 */

/** Divisão que devolve null em vez de NaN ou Infinity. */
export function taxa(numerador: number | null, denominador: number | null): number | null {
  if (numerador == null || denominador == null) return null
  if (denominador === 0) return null
  const r = (numerador / denominador) * 100
  return Number.isFinite(r) ? r : null
}

export function formatarTaxa(valor: number | null, casas = 1): string {
  if (valor == null) return '—'
  return `${valor.toFixed(casas).replace('.', ',')}%`
}

export function formatarMoeda(valor: number | null): string {
  if (valor == null) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor)
}

export function formatarNumero(valor: number | null): string {
  if (valor == null) return '—'
  return valor.toLocaleString('pt-BR')
}

/** Receita do snapshot; se não houver, deriva de vendas × ticket. */
export function receitaDe(s: Snapshot | null): number | null {
  if (!s) return null
  if (s.revenue != null) return s.revenue
  if (s.sales != null && s.avg_ticket != null) return s.sales * s.avg_ticket
  return null
}

export type TaxasAtuais = {
  lead_mql: number | null
  mql_opp: number | null
  opp_sale: number | null
  cpl: number | null
  ticket: number | null
}

export function taxasDe(s: Snapshot | null): TaxasAtuais {
  if (!s) return { lead_mql: null, mql_opp: null, opp_sale: null, cpl: null, ticket: null }
  return {
    lead_mql: taxa(s.mqls, s.leads),
    mql_opp: taxa(s.opportunities, s.mqls),
    opp_sale: taxa(s.sales, s.opportunities),
    cpl: s.investment != null && s.leads != null && s.leads > 0 ? s.investment / s.leads : null,
    ticket: s.avg_ticket ?? (s.revenue != null && s.sales ? s.revenue / s.sales : null),
  }
}

/**
 * Funil reverso: da meta de receita até o investimento.
 *
 * Arredonda para CIMA em toda quantidade necessária. Arredondar para
 * baixo entrega um plano que não bate a meta: 500.000 ÷ 8.750 = 57,14,
 * e 57 vendas rendem R$ 498.750 — abaixo do alvo.
 */
export type EntradaFunilReverso = {
  metaReceita: number
  ticket: number
  taxaOppVenda: number // em %
  taxaMqlOpp: number
  taxaLeadMql: number
  cpl: number
}

export type SaidaFunilReverso = {
  vendas: number
  oportunidades: number
  mqls: number
  leads: number
  investimento: number
}

export function funilReverso(e: EntradaFunilReverso): SaidaFunilReverso {
  const pct = (v: number) => (v > 0 ? v / 100 : 1)

  const vendas = Math.ceil(e.metaReceita / (e.ticket || 1))
  const oportunidades = Math.ceil(vendas / pct(e.taxaOppVenda))
  const mqls = Math.ceil(oportunidades / pct(e.taxaMqlOpp))
  const leads = Math.ceil(mqls / pct(e.taxaLeadMql))
  // O investimento usa o número de leads já arredondado, para que o
  // custo mostrado corresponda ao volume mostrado.
  const investimento = Math.ceil(leads * (e.cpl || 0))

  return { vendas, oportunidades, mqls, leads, investimento }
}

/** Receita projetada mantendo tudo igual e movendo um único nó. */
export function receitaSimulada(
  s: Snapshot,
  noAlterado: No,
  novaTaxaPercent: number
): number | null {
  const t = taxasDe(s)
  const leads = s.leads
  const ticket = t.ticket
  if (leads == null || ticket == null) return null

  const pct = (v: number | null) => (v == null ? null : v / 100)

  let rLeadMql = pct(t.lead_mql)
  let rMqlOpp = pct(t.mql_opp)
  let rOppSale = pct(t.opp_sale)
  let ticketUsado = ticket

  if (noAlterado === 'lead_mql') rLeadMql = novaTaxaPercent / 100
  if (noAlterado === 'mql_opp') rMqlOpp = novaTaxaPercent / 100
  if (noAlterado === 'opp_sale') rOppSale = novaTaxaPercent / 100
  if (noAlterado === 'ticket') ticketUsado = novaTaxaPercent

  if (rLeadMql == null || rMqlOpp == null || rOppSale == null) return null

  const vendas = leads * rLeadMql * rMqlOpp * rOppSale
  const r = vendas * ticketUsado
  return Number.isFinite(r) ? r : null
}

/** Quanto a receita cresceria se este nó chegasse à taxa-alvo. */
export function impactoPotencial(
  s: Snapshot,
  no: No,
  taxaAlvo: number
): number | null {
  const atual = receitaDe(s)
  const simulada = receitaSimulada(s, no, taxaAlvo)
  if (atual == null || simulada == null) return null
  const delta = simulada - atual
  return delta > 0 ? delta : 0
}

/** Período no formato do banco: primeiro dia do mês. */
export function periodoDe(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  return `${ano}-${mes}-01`
}

export function rotuloPeriodo(periodo: string): string {
  const [ano, mes] = periodo.split('-')
  const nomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return `${nomes[Number(mes) - 1]} de ${ano}`
}

export function rotuloPeriodoCurto(periodo: string): string {
  const [, mes] = periodo.split('-')
  const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return nomes[Number(mes) - 1] ?? periodo
}
