import { redirect } from 'next/navigation'
import {
  carregarSessao,
  buscarSnapshot,
  buscarCenario,
  buscarPisos,
  periodoAtual,
} from '@/lib/vamo/dados'
import { FunilEditor } from './funil-editor'
import { SeletorPeriodo } from './seletor-periodo'
import { SemEmpresa } from '@/components/vamo/sem-empresa'

export default async function FunilPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; periodo?: string }>
}) {
  const params = await searchParams
  const sessao = await carregarSessao(params.org)
  if (!sessao) redirect('/login')

  const org = sessao.organizacaoAtual
  if (!org) return <SemEmpresa papel={sessao.role} />

  const periodo = params.periodo ?? periodoAtual()
  const [snapshot, cenarioMeta, pisos] = await Promise.all([
    buscarSnapshot(org.id, periodo),
    buscarCenario(org.id, 'meta'),
    buscarPisos(),
  ])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Funil Atual
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            A fotografia da sua operação neste mês. Cada número registrado vira base de diagnóstico.
          </p>
        </div>
        <SeletorPeriodo periodo={periodo} org={params.org} />
      </header>

      <FunilEditor
        key={periodo}
        organizationId={org.id}
        periodo={periodo}
        snapshot={snapshot}
        cenarioMeta={cenarioMeta}
        pisos={pisos}
      />
    </div>
  )
}
