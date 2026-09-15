import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            V.A.M.O.
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Growth Operating System
          </CardDescription>
        </CardHeader>
        <form action={login}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="seunome@empresa.com.br ou admin"
                required
                className="bg-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Esqueci minha senha
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-input text-foreground"
              />
            </div>
            {params?.error && (
              <p className="text-sm text-destructive">{params.error}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Entrar na Máquina
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
