import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Mostrada quando a pessoa alcança uma rota que o produto dela não
 * libera — por link antigo ou URL digitada. O cadeado na barra lateral
 * esconde o item, mas não protege a rota sozinho.
 */
export function SemProduto({ tela }: { tela: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
        <Lock className="h-7 w-7 text-amber-400" />
      </div>
      <h2 className="text-xl font-bold text-white">{tela} faz parte da Estruturação</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Esta tela está disponível para quem contratou a Estruturação de Growth. Fale com o time
        para saber como destravar.
      </p>
      <Button variant="outline" className="mt-5" render={<Link href="/dashboard" />}>
        Voltar ao Dashboard
      </Button>
    </div>
  )
}
