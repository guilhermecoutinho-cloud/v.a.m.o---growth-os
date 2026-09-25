'use client'

import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { rotuloPeriodo, periodoDe } from '@/lib/vamo/calculos'

/** Últimos 18 meses, do mais recente para o mais antigo. */
function ultimosMeses(qtd = 18): string[] {
  const hoje = new Date()
  return Array.from({ length: qtd }, (_, i) =>
    periodoDe(new Date(hoje.getFullYear(), hoje.getMonth() - i, 1))
  )
}

export function SeletorPeriodo({ periodo, org }: { periodo: string; org?: string }) {
  const router = useRouter()
  const meses = ultimosMeses()

  // Um período antigo escolhido à mão continua na lista.
  const opcoes = meses.includes(periodo) ? meses : [periodo, ...meses]

  return (
    <div className="relative">
      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <select
        value={periodo}
        aria-label="Período"
        onChange={(e) => {
          const p = new URLSearchParams()
          if (org) p.set('org', org)
          p.set('periodo', e.target.value)
          router.push(`/dashboard/funil?${p.toString()}`)
        }}
        className="h-10 appearance-none rounded-lg border border-border/60 bg-input/60 pl-9 pr-4 text-sm text-white focus-visible:border-primary focus-visible:outline-none"
      >
        {opcoes.map((m) => (
          <option key={m} value={m} className="bg-card text-white">
            {rotuloPeriodo(m)}
          </option>
        ))}
      </select>
    </div>
  )
}
