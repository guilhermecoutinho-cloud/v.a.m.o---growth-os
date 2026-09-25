import 'server-only'
import {
  carregarPainel,
  buscarBiblioteca,
} from '@/lib/vamo/dados'
import { detectarPontos } from '@/lib/vamo/investigacao'
import { taxasDe, receitaDe } from '@/lib/vamo/calculos'

/**
 * Contexto do Mentor IA — ainda SEM chamada a LLM.
 *
 * Diretriz para quando o agente for implementado: ele atua como mentor
 * socrático. Faz perguntas, apoia-se na biblioteca de causas e nos
 * dados registrados, NUNCA afirma a causa de um número e sempre devolve
 * a resposta em formato de hipótese (SE / ENTÃO / PORQUE), deixando a
 * decisão com o aluno.
 *
 * Esta função existe agora para garantir que tudo que o agente vai
 * precisar já esteja sendo registrado de forma estruturada.
 */

export type ContextoMentor = {
  organizacaoId: string
  maquinaAtual: {
    periodo: string | null
    receita: number | null
    taxas: ReturnType<typeof taxasDe>
    dadosAusentes: string[]
  }
  meta: { receitaAlvo: number | null }
  historico: Array<{ periodo: string; receita: number | null }>
  investigacoesAbertas: Array<{
    no: string
    taxaAtual: number | null
    taxaAlvo: number | null
    impactoPotencial: number | null
    motivo: string
  }>
  hipoteses: Array<{
    no: string
    alavanca: string
    se: string
    entao: string
    porque: string
    status: string
  }>
  causasDisponiveis: Array<{ no: string; titulo: string; comoVerificar: string }>
}

export async function getMentorContext(organizationId: string): Promise<ContextoMentor> {
  const { snapshots, atual, meta, cenarios, pisos, hipoteses } =
    await carregarPainel(organizationId)

  const cenarioMeta = cenarios.find((c) => c.name === 'meta') ?? null
  const pontos = detectarPontos(atual, cenarioMeta, pisos)
  const biblioteca = await buscarBiblioteca()

  return {
    organizacaoId: organizationId,
    maquinaAtual: {
      periodo: atual?.period ?? null,
      receita: receitaDe(atual),
      taxas: taxasDe(atual),
      dadosAusentes: atual?.unknown_fields ?? [],
    },
    meta: { receitaAlvo: meta?.target_revenue ?? null },
    historico: snapshots.map((s) => ({ periodo: s.period, receita: receitaDe(s) })),
    investigacoesAbertas: pontos.map((p) => ({
      no: p.no,
      taxaAtual: p.taxaAtual,
      taxaAlvo: p.taxaAlvo,
      impactoPotencial: p.impacto,
      motivo: p.motivo,
    })),
    hipoteses: hipoteses.map((h) => ({
      no: h.node,
      alavanca: h.lever,
      se: h.if_action,
      entao: h.then_result,
      porque: h.because_evidence,
      status: h.status,
    })),
    causasDisponiveis: biblioteca.map((i) => ({
      no: i.node,
      titulo: i.cause_title,
      comoVerificar: i.how_to_check,
    })),
  }
}
