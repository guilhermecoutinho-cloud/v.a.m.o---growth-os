import type { No, Alavanca, CampoSnapshot } from './modelo'

export type Snapshot = {
  id: string
  organization_id: string
  period: string // 'YYYY-MM-DD', sempre dia 1
  investment: number | null
  leads: number | null
  mqls: number | null
  opportunities: number | null
  sales: number | null
  avg_ticket: number | null
  revenue: number | null
  active_customers: number | null
  repurchase_rate: number | null
  churn_rate: number | null
  referral_rate: number | null
  unknown_fields: CampoSnapshot[]
  notes: string | null
  created_at: string
  updated_at: string
}

export type MetaReceita = {
  id: string
  organization_id: string
  period_type: string
  target_revenue: number
  valid_from: string
}

export type Cenario = {
  id: string
  organization_id: string
  name: 'atual' | 'meta' | 'otimizado'
  target_revenue: number | null
  avg_ticket: number | null
  cpl: number | null
  rate_lead_mql: number | null
  rate_mql_opp: number | null
  rate_opp_sale: number | null
}

export type ItemBiblioteca = {
  id: string
  node: No
  lever: Alavanca
  cause_title: string
  how_to_check: string
  confirming_data: string
  hypothesis_template: string
  possible_experiment: string
  sort_order: number
}

export type Investigacao = {
  id: string
  organization_id: string
  snapshot_id: string | null
  node: No
  current_rate: number | null
  target_rate: number | null
  potential_revenue_impact: number | null
  status: 'aberta' | 'em_hipotese' | 'descartada'
  created_at: string
}

export type Hipotese = {
  id: string
  organization_id: string
  investigation_id: string | null
  library_item_id: string | null
  node: No
  lever: Alavanca
  if_action: string
  then_result: string
  because_evidence: string
  status: 'rascunho' | 'a_testar' | 'em_teste' | 'validada' | 'refutada' | 'inconclusiva'
  priority: number
  snapshot_context: Record<string, unknown> | null
  discard_reason: string | null
  created_at: string
  updated_at: string
}

export type EtapaPrograma = {
  id: number
  step_order: number
  title: string
  format: 'gravada' | 'ao_vivo' | 'presencial'
  theme: string
  outcome: string | null
  deliverable: string | null
  tool_route: string | null
}

export type ProgressoEtapa = {
  organization_id: string
  step_id: number
  status: 'bloqueada' | 'disponivel' | 'concluida'
  completed_at: string | null
}

export type Organizacao = {
  id: string
  name: string
  segment: string | null
  business_model: 'recorrente' | 'transacional' | null
}
