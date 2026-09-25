'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { pedirNovaSenha, type EstadoRecuperacao } from './recuperar-actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const INICIAL: EstadoRecuperacao = { ok: false, mensagem: '' }

function Enviar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? 'Enviando…' : 'Enviar link'}
    </Button>
  )
}

export function EsqueciSenha() {
  const [aberto, setAberto] = useState(false)
  const [estado, acao] = useActionState(pedirNovaSenha, INICIAL)

  if (estado.ok) {
    return (
      <p className="mt-6 text-center text-xs text-primary">{estado.mensagem}</p>
    )
  }

  if (!aberto) {
    return (
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Esqueceu a senha?{' '}
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="font-medium text-primary hover:underline"
        >
          Receber um link por e-mail
        </button>
      </p>
    )
  }

  return (
    <form action={acao} className="mt-6 space-y-2 border-t border-border/50 pt-5">
      <label htmlFor="recuperar-email" className="text-xs text-muted-foreground">
        Digite seu e-mail e enviaremos um link para definir uma nova senha.
      </label>
      <div className="flex gap-2">
        <Input
          id="recuperar-email"
          name="email"
          type="email"
          required
          placeholder="seunome@empresa.com.br"
          className="h-9 bg-input/60 text-sm text-foreground"
        />
        <Enviar />
      </div>
      {estado.mensagem && !estado.ok && (
        <p className="text-xs text-destructive">{estado.mensagem}</p>
      )}
    </form>
  )
}
