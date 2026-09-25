import Link from 'next/link'
import { LineChart } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** A empresa existe, mas nenhum mês foi registrado ainda. */
export function SemDados({ href }: { href: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <LineChart className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-white">
        Você ainda não registrou os números deste mês
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Antes de tentar crescer, precisamos entender como sua empresa cresce hoje. Comece pela
        fotografia da sua operação.
      </p>
      <Button
        className="mt-5 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
        render={<Link href={href} />}
      >
        Registrar agora
      </Button>
    </div>
  )
}
