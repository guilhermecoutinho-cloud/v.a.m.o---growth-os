'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Captura falhas de qualquer tela do dashboard. Sem isto, um erro numa
 * consulta derruba a página inteira e a pessoa fica sem saber o que
 * houve nem como voltar.
 */
export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // O digest é o que permite achar este erro nos logs do servidor.
    console.error('[dashboard]', error.digest ?? '', error.message)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-xl font-bold text-white">Algo não carregou</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        A tela não conseguiu buscar os dados. Tente de novo — se continuar, avise o suporte.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground/60">
          código: {error.digest}
        </p>
      )}
      <Button onClick={reset} className="mt-5">
        <RotateCcw className="mr-2 h-4 w-4" />
        Tentar de novo
      </Button>
    </div>
  )
}
