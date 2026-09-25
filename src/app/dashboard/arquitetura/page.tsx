import { redirect } from 'next/navigation'
import {
  carregarSessao,
  buscarSnapshot,
  buscarMeta,
  buscarCenario,
  buscarJornadaEmpresa,
} from '@/lib/vamo/dados'
import { ArquiteturaEditor } from './arquitetura-editor'
import { JornadaEmpresa } from './jornada-empresa'
import { JornadaVamo } from '@/components/vamo/jornada-vamo'
import { SemEmpresa } from '@/components/vamo/sem-empresa'
import { SemProduto } from '@/components/vamo/sem-produto'
import { rotaLiberada } from '@/lib/vamo/menu'

export default async function ArquiteturaPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>
}) {
  const params = await searchParams
  const sessao = await carregarSessao(params.org)
  if (!sessao) redirect('/login')

  // O cadeado da barra lateral so esconde o item; a rota tambem
  // precisa recusar quem chega por URL digitada.
  if (!rotaLiberada('/dashboard/arquitetura', sessao.role)) return <SemProduto tela="Arquitetura de Receita" />

  const org = sessao.organizacaoAtual
  if (!org) return <SemEmpresa papel={sessao.role} />

  const [snapshot, meta, otimizado, jornada] = await Promise.all([
    buscarSnapshot(org.id),
    buscarMeta(org.id),
    buscarCenario(org.id, 'otimizado'),
    buscarJornadaEmpresa(org.id),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Arquitetura de Receita
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          O funil reverso e a jornada real da sua empresa, lado a lado.
        </p>
      </header>

      <ArquiteturaEditor
        organizationId={org.id}
        snapshot={snapshot}
        metaAtual={meta}
        cenarioOtimizado={otimizado}
      />

      <JornadaVamo />

      <JornadaEmpresa
        organizationId={org.id}
        registros={jornada}
        snapshot={snapshot}
      />
    </div>
  )
}
