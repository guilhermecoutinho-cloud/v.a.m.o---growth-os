'use client'

import dynamic from 'next/dynamic'
import type { PontoReceita } from './grafico-receita'

/**
 * Carrega o Recharts (~366 KB, o maior pedaco do bundle) so no browser
 * e so quando esta tela e aberta. Com ssr: false ele sai por completo do
 * carregamento inicial do dashboard: os numeros aparecem de imediato e o
 * grafico entra logo depois.
 *
 * Precisa viver num Client Component — `ssr: false` nao e permitido em
 * dynamic() dentro de um Server Component.
 */
const Grafico = dynamic(() => import('./grafico-receita'), {
  ssr: false,
  loading: () => (
    <div className="mt-4 h-[300px] w-full animate-pulse rounded-lg bg-white/5" />
  ),
})

export function GraficoReceitaLazy({ data }: { data: PontoReceita[] }) {
  return <Grafico data={data} />
}
