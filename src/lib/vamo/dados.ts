import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type {
  Snapshot,
  MetaReceita,
  Cenario,
  Organizacao,
  ItemBiblioteca,
  Hipotese,
  EtapaPrograma,
  ProgressoEtapa,
} from './tipos'
import { periodoDe } from './calculos'
import { PISOS_PADRAO } from './investigacao'

/**
 * Camada única de leitura. Toda tela busca os números daqui — nenhum
 * componente inventa valor de negócio.
 *
 * As consultas passam pelo cliente normal, sujeitas ao RLS: quem não
 * pode ver a empresa recebe lista vazia, não erro.
 */

export type Sessao = {
  userId: string
  email: string | undefined
  role: string
  organizacoes: Organizacao[]
  organizacaoAtual: Organizacao | null
}

/** Quem está logado, seu papel e as empresas que alcança. */
export async function carregarSessao(orgPreferida?: string): Promise<Sessao | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  let role = (user.app_metadata?.role as string) ?? ''
  if (!role) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = data?.role ?? 'student'
  }

  // O RLS já limita o que cada papel enxerga.
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, segment, business_model')
    .order('name')

  const organizacoes = (orgs ?? []) as Organizacao[]
  const organizacaoAtual =
    organizacoes.find((o) => o.id === orgPreferida) ?? organizacoes[0] ?? null

  return { userId: user.id, email: user.email, role, organizacoes, organizacaoAtual }
}

export async function buscarSnapshot(
  organizationId: string,
  periodo?: string
): Promise<Snapshot | null> {
  const supabase = await createClient()
  let q = supabase.from('metric_snapshots').select('*').eq('organization_id', organizationId)

  if (periodo) q = q.eq('period', periodo)
  else q = q.order('period', { ascending: false }).limit(1)

  const { data } = await q
  return ((data?.[0] as Snapshot) ?? null)
}

export async function listarSnapshots(
  organizationId: string,
  limite = 12
): Promise<Snapshot[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('metric_snapshots')
    .select('*')
    .eq('organization_id', organizationId)
    .order('period', { ascending: false })
    .limit(limite)
  return ((data ?? []) as Snapshot[]).reverse() // ordem cronológica
}

export async function buscarMeta(organizationId: string): Promise<MetaReceita | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('revenue_goals')
    .select('*')
    .eq('organization_id', organizationId)
    .order('valid_from', { ascending: false })
    .limit(1)
  return ((data?.[0] as MetaReceita) ?? null)
}

export async function buscarCenarios(organizationId: string): Promise<Cenario[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('revenue_scenarios')
    .select('*')
    .eq('organization_id', organizationId)
  return (data ?? []) as Cenario[]
}

export async function buscarCenario(
  organizationId: string,
  nome: 'atual' | 'meta' | 'otimizado'
): Promise<Cenario | null> {
  const cenarios = await buscarCenarios(organizationId)
  return cenarios.find((c) => c.name === nome) ?? null
}

export async function buscarBiblioteca(no?: string): Promise<ItemBiblioteca[]> {
  const supabase = await createClient()
  let q = supabase.from('hypothesis_library').select('*').eq('active', true)
  if (no) q = q.eq('node', no)
  const { data } = await q.order('sort_order')
  return (data ?? []) as ItemBiblioteca[]
}

export async function listarHipoteses(organizationId: string): Promise<Hipotese[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hypotheses')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Hipotese[]
}

export async function buscarPisos(): Promise<typeof PISOS_PADRAO> {
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('value').eq('key', 'benchmarks').single()
  const v = data?.value as Partial<typeof PISOS_PADRAO> | undefined
  return { ...PISOS_PADRAO, ...(v ?? {}) }
}

/** Como cada etapa da jornada acontece hoje, indexado por stage_id. */
export async function buscarJornadaEmpresa(
  organizationId: string
): Promise<Record<string, { como_acontece: string; canal: string; responsavel: string; indicador: string }>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('journey_stages')
    .select('stage_id, como_acontece, canal, responsavel, indicador')
    .eq('organization_id', organizationId)

  const mapa: Record<string, { como_acontece: string; canal: string; responsavel: string; indicador: string }> = {}
  for (const l of data ?? []) {
    mapa[l.stage_id] = {
      como_acontece: l.como_acontece ?? '',
      canal: l.canal ?? '',
      responsavel: l.responsavel ?? '',
      indicador: l.indicador ?? '',
    }
  }
  return mapa
}

export async function listarEtapasPrograma(): Promise<EtapaPrograma[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('program_steps').select('*').order('step_order')
  return (data ?? []) as EtapaPrograma[]
}

export async function buscarProgresso(organizationId: string): Promise<ProgressoEtapa[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('program_progress')
    .select('*')
    .eq('organization_id', organizationId)
  return (data ?? []) as ProgressoEtapa[]
}

/** Tudo que o Dashboard precisa, numa ida só. */
export async function carregarPainel(organizationId: string) {
  const [snapshots, meta, cenarios, pisos, hipoteses] = await Promise.all([
    listarSnapshots(organizationId),
    buscarMeta(organizationId),
    buscarCenarios(organizationId),
    buscarPisos(),
    listarHipoteses(organizationId),
  ])
  const atual = snapshots.at(-1) ?? null
  const anterior = snapshots.length > 1 ? snapshots.at(-2)! : null
  return { snapshots, atual, anterior, meta, cenarios, pisos, hipoteses }
}

export const periodoAtual = () => periodoDe(new Date())
