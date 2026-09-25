'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { definirSenha, type EstadoSenha } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight } from 'lucide-react'

const INICIAL: EstadoSenha = { ok: false, mensagem: '' }

function Botao() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
    >
      {pending ? 'Salvando…' : 'Salvar e entrar'}
      {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
    </Button>
  )
}

export function FormularioSenha() {
  const [estado, acao] = useActionState(definirSenha, INICIAL)

  return (
    <form action={acao} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm text-foreground">
          Nova senha
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="mínimo 8 caracteres"
          className="h-11 border-border/60 bg-input/60 text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm" className="text-sm text-foreground">
          Repita a senha
        </Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="••••••••"
          className="h-11 border-border/60 bg-input/60 text-foreground"
        />
      </div>

      {estado.mensagem && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {estado.mensagem}
        </p>
      )}

      <Botao />
    </form>
  )
}
