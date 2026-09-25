import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FormularioSenha } from './formulario-senha'
import { RecebeToken } from './recebe-token'
import { TrendingUp } from 'lucide-react'

export default async function DefinirSenhaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="aurora absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-primary/20 blur-[100px]" />
        <div
          className="aurora absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-secondary/20 blur-[100px]"
          style={{ animationDelay: '-9s' }}
        />
      </div>

      <div className="surgir relative w-full max-w-md rounded-2xl border border-border/60 bg-card/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/40">
            <TrendingUp className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {user ? 'Defina sua senha' : 'Link expirado'}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {user
              ? `Bem-vindo ao V.A.M.O., ${user.email}. Escolha a senha que você vai usar para entrar.`
              : 'Este link já foi usado ou passou da validade.'}
          </p>
        </div>

        {user ? (
          <FormularioSenha />
        ) : (
          <div className="space-y-4 text-center">
            {/* O token pode estar no fragmento da URL, invisível para o
                servidor. Este componente tenta resgatá-lo antes de
                declarar o link vencido. */}
            <RecebeToken />
            <p className="text-sm text-muted-foreground">
              Se esta mensagem continuar, peça ao suporte um novo link de acesso.
            </p>
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Voltar para o login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
