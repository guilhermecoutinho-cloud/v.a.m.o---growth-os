import type { Alavanca } from './modelo'

/**
 * Referência de cada etapa da jornada: o que ela deveria ter.
 *
 * São princípios, não números nem benchmarks de mercado. A ideia é dar
 * um norte sem que o sistema diagnostique nada: quem compara o que tem
 * com o que deveria ter é o próprio aluno, etapa por etapa.
 *
 * Texto de partida do documento de especificação; será refinado com o
 * conteúdo das aulas.
 */

export type EtapaJornada = {
  id: string
  nome: string
  alavanca: Alavanca | null
  /** O que essa etapa deveria ter. Texto fixo, não editável. */
  referencia: string
}

export const ETAPAS_JORNADA: EtapaJornada[] = [
  {
    id: 'mercado',
    nome: 'Mercado',
    alavanca: null,
    referencia:
      'ICP e mercado-alvo definidos, com tamanho estimado (TAM/SAM/SOM).',
  },
  {
    id: 'atencao',
    nome: 'Atenção',
    alavanca: 'demanda',
    referencia:
      'Presença ativa nos canais onde o ICP está, gerando alcance mensurável.',
  },
  {
    id: 'demanda',
    nome: 'Demanda',
    alavanca: 'demanda',
    referencia:
      'Oferta clara e gatilho de interesse (conteúdo, evento, lead magnet) que gera ação.',
  },
  {
    id: 'lead',
    nome: 'Lead',
    alavanca: 'qualificacao',
    referencia:
      'Captura estruturada em CRM — não depende de planilha solta ou memória.',
  },
  {
    id: 'oportunidade',
    nome: 'Oportunidade',
    alavanca: 'conversao',
    referencia:
      'Critério de qualificação definido (o que separa MQL de oportunidade real), não depende de achismo de quem qualifica.',
  },
  {
    id: 'venda',
    nome: 'Venda',
    alavanca: 'ticket',
    referencia:
      'Processo comercial com etapas, SLA de resposta e script/playbook de objeções.',
  },
  {
    id: 'cliente',
    nome: 'Cliente',
    alavanca: 'retencao',
    referencia: 'Onboarding estruturado que entrega o valor prometido.',
  },
  {
    id: 'recompra',
    nome: 'Recompra',
    alavanca: 'frequencia',
    referencia:
      'Gatilho de upsell/cross-sell definido — não depende do cliente pedir.',
  },
  {
    id: 'indicacao',
    nome: 'Indicação',
    alavanca: 'indicacao',
    referencia:
      'Programa ou momento claro de pedir indicação — não deixado ao acaso.',
  },
]

/** O que o aluno descreve em cada etapa. */
export type RegistroEtapa = {
  como_acontece: string
  canal: string
  responsavel: string
  indicador: string
}

export const REGISTRO_VAZIO: RegistroEtapa = {
  como_acontece: '',
  canal: '',
  responsavel: '',
  indicador: '',
}

/**
 * Sugestão de preenchimento a partir do que já existe no Funil Atual,
 * para não pedir o mesmo dado duas vezes. Só o indicador é derivável:
 * canal e responsável são informação que o snapshot não carrega.
 */
export function indicadorSugerido(
  etapaId: string,
  s: {
    leads?: number | null
    mqls?: number | null
    opportunities?: number | null
    sales?: number | null
    avg_ticket?: number | null
    repurchase_rate?: number | null
    referral_rate?: number | null
  } | null
): string | null {
  if (!s) return null
  const n = (v: number | null | undefined) =>
    v == null ? null : v.toLocaleString('pt-BR')

  switch (etapaId) {
    case 'lead':
      return n(s.leads) && `${n(s.leads)} leads no período`
    case 'oportunidade':
      return n(s.opportunities) && `${n(s.opportunities)} oportunidades no período`
    case 'venda':
      return n(s.sales) && `${n(s.sales)} vendas no período`
    case 'recompra':
      return s.repurchase_rate != null ? `Recompra em ${s.repurchase_rate}%` : null
    case 'indicacao':
      return s.referral_rate != null ? `Indicação em ${s.referral_rate}%` : null
    default:
      return null
  }
}
