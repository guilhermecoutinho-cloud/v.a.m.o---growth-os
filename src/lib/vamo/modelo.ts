/**
 * Jornada V.A.M.O. — modelo único da plataforma.
 *
 * Substitui a Gravata Borboleta: todas as telas passam a falar dos
 * mesmos nós e das mesmas alavancas. Nenhum número de negócio vive
 * em componente — ele vem sempre de um snapshot.
 */

export type Alavanca =
  | 'demanda'
  | 'qualificacao'
  | 'conversao'
  | 'ticket'
  | 'frequencia'
  | 'retencao'
  | 'indicacao'

export type No =
  | 'aquisicao'
  | 'lead_mql'
  | 'mql_opp'
  | 'opp_sale'
  | 'ticket'
  | 'retencao'

export const ALAVANCAS: Record<Alavanca, { numero: string; nome: string; definicao: string }> = {
  demanda:      { numero: '01', nome: 'Demanda',      definicao: 'Gerar mais oportunidades qualificadas' },
  qualificacao: { numero: '02', nome: 'Qualificação', definicao: 'Melhorar quem entra na operação' },
  conversao:    { numero: '03', nome: 'Conversão',    definicao: 'Transformar mais oportunidades existentes em clientes' },
  ticket:       { numero: '04', nome: 'Ticket',       definicao: 'Capturar mais valor por venda' },
  frequencia:   { numero: '05', nome: 'Frequência',   definicao: 'Fazer bons clientes comprarem mais vezes' },
  retencao:     { numero: '06', nome: 'Retenção',     definicao: 'Manter clientes e receita por mais tempo' },
  indicacao:    { numero: '07', nome: 'Indicação',    definicao: 'Transformar clientes em fonte de aquisição' },
}

/** Etapas da jornada completa (visão macro, sem números). */
export const ETAPAS_MACRO = [
  'Mercado',
  'Atenção',
  'Demanda',
  'Lead',
  'Oportunidade',
  'Venda',
  'Cliente',
  'Recompra',
  'Indicação',
] as const

export type DefinicaoNo = {
  id: No
  rotulo: string
  /** Como a taxa é lida em voz alta. */
  descricaoTaxa: string
  alavanca: Alavanca
}

export const NOS: DefinicaoNo[] = [
  { id: 'aquisicao', rotulo: 'Volume de leads / CPL', descricaoTaxa: 'leads gerados no período',        alavanca: 'demanda' },
  { id: 'lead_mql',  rotulo: 'Lead → MQL',            descricaoTaxa: 'MQLs ÷ leads',                    alavanca: 'qualificacao' },
  { id: 'mql_opp',   rotulo: 'MQL → Oportunidade',    descricaoTaxa: 'oportunidades ÷ MQLs',            alavanca: 'conversao' },
  { id: 'opp_sale',  rotulo: 'Oportunidade → Venda',  descricaoTaxa: 'vendas ÷ oportunidades',          alavanca: 'conversao' },
  { id: 'ticket',    rotulo: 'Ticket médio',          descricaoTaxa: 'receita ÷ vendas',                alavanca: 'ticket' },
  { id: 'retencao',  rotulo: 'Recompra e retenção',   descricaoTaxa: 'recompra, churn e indicação',     alavanca: 'retencao' },
]

export const NO_POR_ID = Object.fromEntries(NOS.map((n) => [n.id, n])) as Record<No, DefinicaoNo>

/** Campos do snapshot, na ordem em que aparecem no Funil Atual. */
export const CAMPOS_SNAPSHOT = [
  { id: 'investment',       rotulo: 'Investimento',        tipo: 'moeda'    as const },
  { id: 'leads',            rotulo: 'Leads',               tipo: 'inteiro'  as const },
  { id: 'mqls',             rotulo: 'MQLs',                tipo: 'inteiro'  as const },
  { id: 'opportunities',    rotulo: 'Oportunidades',       tipo: 'inteiro'  as const },
  { id: 'sales',            rotulo: 'Vendas',              tipo: 'inteiro'  as const },
  { id: 'avg_ticket',       rotulo: 'Ticket médio',        tipo: 'moeda'    as const },
  { id: 'revenue',          rotulo: 'Receita',             tipo: 'moeda'    as const },
  { id: 'active_customers', rotulo: 'Clientes ativos',     tipo: 'inteiro'  as const },
  { id: 'repurchase_rate',  rotulo: 'Taxa de recompra',    tipo: 'percent'  as const },
  { id: 'churn_rate',       rotulo: 'Churn',               tipo: 'percent'  as const },
  { id: 'referral_rate',    rotulo: 'Taxa de indicação',   tipo: 'percent'  as const },
] as const

export type CampoSnapshot = (typeof CAMPOS_SNAPSHOT)[number]['id']

export const ROTULO_CAMPO = Object.fromEntries(
  CAMPOS_SNAPSHOT.map((c) => [c.id, c.rotulo])
) as Record<CampoSnapshot, string>
