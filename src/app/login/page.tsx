import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-border/50 bg-card p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/50 shadow-[0_0_20px_rgba(72,209,122,0.4)]">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              V.A.M.O.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Growth Operating System
            </p>
          </div>
        </div>

        <form action={login} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seunome@empresa.com.br"
              required
              className="h-11 bg-input text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className="h-11 bg-input text-foreground"
            />
          </div>

          {params?.error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {params.error}
            </p>
          )}

          <Button
            type="submit"
            className="h-11 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Entrar na Máquina
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Esqueceu a senha? Fale com o suporte para receber uma nova.
        </p>
      </div>
    </div>
  )
}
