import { redirect } from 'next/navigation'
import {
  carregarSessao,
  buscarSnapshot,
  buscarMeta,
  buscarCenario,
} from '@/lib/vamo/dados'
import { ArquiteturaEditor } from './arquitetura-editor'
import { MaquinaVamo } from '@/components/vamo/maquina-vamo'
import { SemEmpresa } from '@/components/vamo/sem-empresa'

export default async function ArquiteturaPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>
}) {
  const params = await searchParams
  const sessao = await carregarSessao(params.org)
  if (!sessao) redirect('/login')

  const org = sessao.organizacaoAtual
  if (!org) return <SemEmpresa papel={sessao.role} />

  const [snapshot, meta, otimizado] = await Promise.all([
    buscarSnapshot(org.id),
    buscarMeta(org.id),
    buscarCenario(org.id, 'otimizado'),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Arquitetura de Receita
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          O funil reverso: da meta de receita até o investimento necessário.
        </p>
      </header>

      <ArquiteturaEditor
        organizationId={org.id}
        snapshot={snapshot}
        metaAtual={meta}
        cenarioOtimizado={otimizado}
      />

      <MaquinaVamo />
    </div>
  )
}
