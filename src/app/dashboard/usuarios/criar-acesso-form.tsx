'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { criarAcesso, type ActionState } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Copy, RefreshCw } from 'lucide-react'

const estadoInicial: ActionState = { ok: false, message: '' }

/** Senha legivel para ditar por telefone: sem O/0, l/1, etc. */
function gerarSenha() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const valores = crypto.getRandomValues(new Uint32Array(12))
  return Array.from(valores, (v) => alfabeto[v % alfabeto.length]).join('')
}

function BotaoSalvar() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    >
      {pending ? 'Criando...' : 'Criar acesso'}
    </Button>
  )
}

export function CriarAcessoForm() {
  const [estado, formAction] = useActionState(criarAcesso, estadoInicial)
  const [senha, setSenha] = useState('')
  const [copiado, setCopiado] = useState(false)

  const credenciais = estado.credentials

  async function copiar() {
    if (!credenciais) return
    const texto =
      `Seu acesso à plataforma V.A.M.O.\n\n` +
      `E-mail: ${credenciais.email}\n` +
      `Senha: ${credenciais.password}\n\n` +
      `Acesse: ${window.location.origin}/login`
    await navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Liberar acesso</CardTitle>
        <CardDescription>
          Defina o e-mail e a senha que você vai enviar ao comprador. A conta já
          nasce liberada, sem e-mail de confirmação.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">E-mail do comprador</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="comprador@empresa.com.br"
                className="bg-input text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-foreground">Nome completo</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Maria Silva"
                className="bg-input text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Senha</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                name="password"
                type="text"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="mínimo 8 caracteres"
                className="bg-input font-mono text-foreground"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setSenha(gerarSenha())}
                title="Gerar senha"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Fica visível de propósito: é a senha que você vai enviar ao comprador.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-foreground">Perfil</Label>
            <select
              id="role"
              name="role"
              defaultValue="student"
              className="h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm text-foreground"
            >
              <option value="student">Aluno</option>
              <option value="mentor">Mentor</option>
              <option value="sales">Comercial</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Administrador consegue criar e revogar acessos. Use com parcimônia.
            </p>
          </div>

          <BotaoSalvar />
        </form>

        {estado.message && !estado.ok && (
          <p className="mt-4 text-sm text-destructive">{estado.message}</p>
        )}

        {estado.ok && credenciais && (
          <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <Check className="h-4 w-4" />
              {estado.message}
            </p>
            <div className="mt-3 space-y-1 font-mono text-sm text-foreground">
              <div>E-mail: {credenciais.email}</div>
              <div>Senha: {credenciais.password}</div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copiar}
              className="mt-3"
            >
              {copiado ? (
                <><Check className="mr-2 h-3 w-3" /> Copiado</>
              ) : (
                <><Copy className="mr-2 h-3 w-3" /> Copiar mensagem pronta</>
              )}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Guarde ou envie agora: a senha não fica recuperável depois que você
              sair desta tela.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
