/** Vocabulário do Modo Comercial. */

export type EtapaLead =
  | 'novo'
  | 'contatado'
  | 'qualificado'
  | 'reuniao_agendada'
  | 'reuniao_realizada'
  | 'oferta_vamo'
  | 'follow_up'
  | 'vendido'
  | 'perdido'
  | 'outro_produto'

export const ETAPAS_LEAD: Array<{ id: EtapaLead; rotulo: string; cor: string }> = [
  { id: 'novo',              rotulo: 'Novo Lead',        cor: '#64748b' },
  { id: 'contatado',         rotulo: 'Contatado',        cor: '#4f46e5' },
  { id: 'qualificado',       rotulo: 'Qualificado',      cor: '#7c3aed' },
  { id: 'reuniao_agendada',  rotulo: 'Reunião Agendada', cor: '#db2777' },
  { id: 'reuniao_realizada', rotulo: 'Reunião Realizada',cor: '#e11d48' },
  { id: 'oferta_vamo',       rotulo: 'Oferta V.A.M.O.',  cor: '#f59e0b' },
  { id: 'follow_up',         rotulo: 'Follow-up',        cor: '#0ea5e9' },
  { id: 'vendido',           rotulo: 'V.A.M.O. Vendido', cor: '#00D68F' },
  { id: 'perdido',           rotulo: 'Perdido',          cor: '#ef4444' },
  { id: 'outro_produto',     rotulo: 'Outro Produto',    cor: '#8b5cf6' },
]

export type MotivoPerda =
  | 'preco' | 'timing' | 'sem_prioridade' | 'sem_fit' | 'sem_decisao'
  | 'socio' | 'concorrencia' | 'sem_caixa' | 'nao_respondeu' | 'outro_produto'

export const MOTIVOS_PERDA: Array<{ id: MotivoPerda; rotulo: string }> = [
  { id: 'preco',          rotulo: 'Preço' },
  { id: 'timing',         rotulo: 'Timing' },
  { id: 'sem_prioridade', rotulo: 'Sem prioridade' },
  { id: 'sem_fit',        rotulo: 'Sem fit' },
  { id: 'sem_decisao',    rotulo: 'Sem decisão' },
  { id: 'socio',          rotulo: 'Sócio' },
  { id: 'concorrencia',   rotulo: 'Concorrência' },
  { id: 'sem_caixa',      rotulo: 'Sem caixa' },
  { id: 'nao_respondeu',  rotulo: 'Não respondeu' },
  { id: 'outro_produto',  rotulo: 'Outro produto' },
]

export type Produto = 'vamo' | 'estruturacao' | 'gaas'

export const PRODUTOS: Record<Produto, {
  nome: string
  preco: string
  quando: string
}> = {
  vamo: {
    nome: 'V.A.M.O.',
    preco: 'R$ 4.997',
    quando: 'Precisa aprender e ganhar clareza',
  },
  estruturacao: {
    nome: 'Estruturação de Growth',
    preco: 'R$ 14.000',
    quando: 'Sabe o problema, falta estrutura',
  },
  gaas: {
    nome: 'Growth as a Service',
    preco: 'R$ 48.000/ano',
    quando: 'Tem estrutura e time, falta direção',
  },
}

/** Os 6 blocos da reunião de 45 minutos. */
export const BLOCOS_REUNIAO = [
  {
    id: 'contexto',
    titulo: 'Contexto',
    minutos: '0–5 min',
    apoio:
      'Antes de te apresentar o V.A.M.O., quero entender sua operação. Dependendo do momento, pode ser que ele nem seja o produto mais adequado.',
  },
  {
    id: 'objetivo',
    titulo: 'Objetivo',
    minutos: '5–12 min',
    apoio: 'Receita hoje, meta e prazo. O gap aparece sozinho.',
  },
  {
    id: 'maquina',
    titulo: 'Máquina atual',
    minutos: '12–25 min',
    apoio: 'Os mesmos campos do Funil Atual. "Não sei" é resposta válida.',
  },
  {
    id: 'diagnostico',
    titulo: 'Diagnóstico',
    minutos: '25–30 min',
    apoio: 'Deixe a pessoa falar primeiro. Depois mostre o que os números indicam.',
  },
  {
    id: 'prescricao',
    titulo: 'Prescrição',
    minutos: '30–40 min',
    apoio: 'Recomende o produto que resolve o problema que apareceu.',
  },
  {
    id: 'investimento',
    titulo: 'Investimento e decisão',
    minutos: '40–45 min',
    apoio: 'Diga o preço e faça pausa.',
  },
] as const
