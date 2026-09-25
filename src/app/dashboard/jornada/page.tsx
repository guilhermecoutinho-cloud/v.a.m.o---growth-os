import { redirect } from 'next/navigation'
import {
  carregarSessao,
  listarEtapasPrograma,
  buscarProgresso,
  buscarSnapshot,
  listarHipoteses,
} from '@/lib/vamo/dados'
import { TrilhaPrograma } from './trilha-programa'
import { SemEmpresa } from '@/components/vamo/sem-empresa'

export default async function JornadaPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>
}) {
  const params = await searchParams
  const sessao = await carregarSessao(params.org)
  if (!sessao) redirect('/login')

  const org = sessao.organizacaoAtual
  if (!org) return <SemEmpresa papel={sessao.role} />

  const [etapas, progresso, snapshot, hipoteses] = await Promise.all([
    listarEtapasPrograma(),
    buscarProgresso(org.id),
    buscarSnapshot(org.id),
    listarHipoteses(org.id),
  ])

  /**
   * Etapas com entregável ganham um check automático quando o dado
   * existe de verdade. A etapa 2 só está pronta com snapshot E ao menos
   * uma hipótese — é o que o entregável "Mapa Atual da Máquina" pede.
   */
  const entregaveisProntos = new Set<number>()
  if (snapshot) entregaveisProntos.add(1)
  if (snapshot && hipoteses.length > 0) entregaveisProntos.add(2)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Minha Jornada
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          Seu caminho dentro do programa V.A.M.O., do diagnóstico ao plano de 90 dias.
        </p>
      </header>

      <TrilhaPrograma
        organizationId={org.id}
        etapas={etapas}
        progresso={progresso}
        entregaveisProntos={[...entregaveisProntos]}
        org={params.org}
      />
    </div>
  )
}
