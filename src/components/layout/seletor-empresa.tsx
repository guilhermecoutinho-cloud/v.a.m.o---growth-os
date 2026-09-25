'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Building2, ChevronDown } from 'lucide-react'
import type { Organizacao } from '@/lib/vamo/tipos'

/**
 * Admin e mentor alternam entre as empresas que acompanham. A escolha
 * vai para a URL (?org=), então vale em todas as telas e sobrevive a
 * um recarregamento ou a um link compartilhado.
 */
export function SeletorEmpresa({
  organizacoes,
  atual,
}: {
  organizacoes: Organizacao[]
  atual: Organizacao | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  if (organizacoes.length <= 1) {
    return atual ? (
      <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-white/[0.03] px-3 py-2">
        <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm text-white">{atual.name}</span>
      </div>
    ) : null
  }

  function trocar(id: string) {
    const novos = new URLSearchParams(params.toString())
    novos.set('org', id)
    router.push(`${pathname}?${novos.toString()}`)
  }

  return (
    <div className="relative">
      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <select
        value={atual?.id ?? ''}
        onChange={(e) => trocar(e.target.value)}
        aria-label="Empresa selecionada"
        className="w-full appearance-none rounded-lg border border-border/50 bg-white/[0.03] py-2 pl-9 pr-8 text-sm text-white transition-colors hover:border-border focus-visible:border-primary focus-visible:outline-none"
      >
        {organizacoes.map((o) => (
          <option key={o.id} value={o.id} className="bg-card text-white">
            {o.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
