import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp, ArrowRight } from 'lucide-react'
import { EsqueciSenha } from './esqueci-senha'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4">
      {/* ---- FUNDO ---------------------------------------------------
          Duas auroras que respiram e uma grade sutil. Tudo decorativo,
          fora do fluxo e sem captar clique. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="aurora absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-primary/20 blur-[100px]"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="aurora absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-secondary/20 blur-[100px]"
          style={{ animationDelay: '-9s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 72%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, #000 20%, transparent 72%)',
          }}
        />
      </div>

      {/* ---- CARTÃO --------------------------------------------------
          Parado de proposito: o movimento fica no fundo da pagina, para
          nao competir com os campos que a pessoa precisa preencher. */}
      <div className="surgir relative w-full max-w-md rounded-2xl border border-border/60 bg-card/80 shadow-2xl backdrop-blur-xl">
        <div className="relative p-8 sm:p-10">
          {/* Marca */}
          <div className="mb-9 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div
                className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl"
                aria-hidden
              />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/40">
                <TrendingUp className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>

            <h1
              className="surgir bg-gradient-to-r from-white via-white to-primary bg-clip-text text-4xl font-extrabold tracking-tight text-transparent"
              style={{ animationDelay: '90ms' }}
            >
              V.A.M.O.
            </h1>
            <p
              className="surgir mt-1.5 text-sm tracking-wide text-muted-foreground"
              style={{ animationDelay: '150ms' }}
            >
              Growth Operating System
            </p>
          </div>

          <form action={login} className="space-y-5">
            <div
              className="surgir space-y-2"
              style={{ animationDelay: '210ms' }}
            >
              <Label htmlFor="email" className="text-sm text-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="seunome@empresa.com.br"
                required
                className="h-12 border-border/60 bg-input/60 text-foreground transition-colors duration-200 focus-visible:border-primary"
              />
            </div>

            <div
              className="surgir space-y-2"
              style={{ animationDelay: '270ms' }}
            >
              <Label htmlFor="password" className="text-sm text-foreground">
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className="h-12 border-border/60 bg-input/60 text-foreground transition-colors duration-200 focus-visible:border-primary"
              />
            </div>

            {params?.error && (
              <p
                role="alert"
                className="surgir rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                {params.error}
              </p>
            )}

            <div className="surgir pt-1" style={{ animationDelay: '330ms' }}>
              <Button
                type="submit"
                className="group h-12 w-full bg-primary text-base font-semibold text-primary-foreground shadow-[0_0_24px_-6px_var(--primary)] transition-transform duration-200 hover:bg-primary/90 hover:shadow-[0_0_34px_-4px_var(--primary)] active:scale-[0.99]"
              >
                Entrar na Máquina
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </div>
          </form>

          <div className="surgir" style={{ animationDelay: '390ms' }}>
            <EsqueciSenha />
          </div>
        </div>
      </div>
    </div>
  )
}
