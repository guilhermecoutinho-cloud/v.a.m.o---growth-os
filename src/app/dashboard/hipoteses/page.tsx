import { redirect } from 'next/navigation'
import Link from 'next/link'
import { carregarSessao, listarHipoteses, buscarBiblioteca } from '@/lib/vamo/dados'
import { ListaHipoteses } from './lista-hipoteses'
import { SemEmpresa } from '@/components/vamo/sem-empresa'
import { Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function HipotesesPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>
}) {
  const params = await searchParams
  const sessao = await carregarSessao(params.org)
  if (!sessao) redirect('/login')

  const org = sessao.organizacaoAtual
  if (!org) return <SemEmpresa papel={sessao.role} />

  const [hipoteses, biblioteca] = await Promise.all([
    listarHipoteses(org.id),
    buscarBiblioteca(),
  ])

  const comOrg = (r: string) => (params.org ? `${r}?org=${params.org}` : r)
  const experimentoPorItem = Object.fromEntries(
    biblioteca.map((i) => [i.id, i.possible_experiment])
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Hipóteses
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          O que você decidiu testar, e o que já aprendeu com cada teste.
        </p>
      </header>

      {hipoteses.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Lightbulb className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white">Nenhuma hipótese ainda</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            As hipóteses nascem no Funil Atual: registre os números, abra um ponto para investigar
            e escolha uma possível causa.
          </p>
          <Button
            className="mt-5 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            render={<Link href={comOrg('/dashboard/funil')} />}
          >
            Ir para o Funil Atual
          </Button>
        </div>
      ) : (
        <ListaHipoteses hipoteses={hipoteses} experimentos={experimentoPorItem} />
      )}
    </div>
  )
}
