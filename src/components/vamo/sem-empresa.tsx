import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Estado vazio de quando a conta ainda não está ligada a nenhuma
 * empresa. O texto muda conforme o papel: o admin resolve sozinho,
 * o aluno precisa de alguém.
 */
export function SemEmpresa({ papel }: { papel: string }) {
  const ehAdmin = papel === 'admin'

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
        <Building2 className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold text-white">Nenhuma empresa vinculada</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        {ehAdmin
          ? 'Cadastre uma empresa e vincule o aluno a ela para começar a registrar a operação.'
          : 'Sua conta ainda não está ligada a uma empresa. Fale com o suporte para liberar o acesso.'}
      </p>
      {ehAdmin && (
        <Button className="mt-5" render={<Link href="/dashboard/acessos" />}>
          Ir para Acessos
        </Button>
      )}
    </div>
  )
}
