'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { convidarAcesso, type ActionState } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, MailCheck } from 'lucide-react'
import type { Organizacao } from '@/lib/vamo/tipos'

const INICIAL: ActionState = { ok: false, message: '' }

function BotaoEnviar() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    >
      {pending ? 'Enviando convite…' : 'Enviar convite'}
    </Button>
  )
}

export function CriarAcessoForm({
  empresas,
  mentores,
}: {
  empresas: Organizacao[]
  mentores: Array<{ id: string; full_name: string | null; email: string }>
}) {
  const [estado, acao] = useActionState(convidarAcesso, INICIAL)
  const [papel, setPapel] = useState('student')
  const [criandoEmpresa, setCriandoEmpresa] = useState(empresas.length === 0)

  const precisaEmpresa = papel === 'student'

  return (
    <Card className="border-border/60 bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Convidar para a plataforma</CardTitle>
        <CardDescription>
          A pessoa recebe um e-mail e define a própria senha. Você não precisa criar nem
          transportar senha.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={acao} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="comprador@empresa.com.br"
                className="h-10 bg-input/60 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-foreground">
                Nome completo
              </Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="Maria Silva"
                className="h-10 bg-input/60 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-foreground">
              Perfil
            </Label>
            <select
              id="role"
              name="role"
              value={papel}
              onChange={(e) => setPapel(e.target.value)}
              className="h-10 w-full rounded-lg border border-border/60 bg-input/60 px-3 text-sm text-foreground"
            >
              <option value="student" className="bg-card">Aluno</option>
              <option value="mentor" className="bg-card">Mentor</option>
              <option value="sales" className="bg-card">Comercial</option>
              <option value="admin" className="bg-card">Administrador</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Administrador consegue convidar e revogar acessos. Use com parcimônia.
            </p>
          </div>

          {precisaEmpresa && (
            <div className="space-y-3 rounded-xl border border-border/50 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Empresa</Label>
                {empresas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCriandoEmpresa((v) => !v)}
                    className="text-xs text-primary hover:underline"
                  >
                    {criandoEmpresa ? 'Escolher existente' : 'Criar nova'}
                  </button>
                )}
              </div>

              {criandoEmpresa ? (
                <Input
                  name="new_organization"
                  required
                  placeholder="Nome da empresa"
                  className="h-10 bg-input/60 text-foreground"
                />
              ) : (
                <select
                  name="organization_id"
                  required
                  className="h-10 w-full rounded-lg border border-border/60 bg-input/60 px-3 text-sm text-foreground"
                >
                  <option value="" className="bg-card">Selecione…</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id} className="bg-card">
                      {e.name}
                    </option>
                  ))}
                </select>
              )}

              {mentores.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="mentor_id" className="text-sm text-muted-foreground">
                    Mentor responsável (opcional)
                  </Label>
                  <select
                    id="mentor_id"
                    name="mentor_id"
                    className="h-10 w-full rounded-lg border border-border/60 bg-input/60 px-3 text-sm text-foreground"
                  >
                    <option value="" className="bg-card">Sem mentor</option>
                    {mentores.map((m) => (
                      <option key={m.id} value={m.id} className="bg-card">
                        {m.full_name ?? m.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <BotaoEnviar />
        </form>

        {estado.message && (
          <p
            className={`mt-4 flex items-center gap-2 text-sm ${
              estado.ok ? 'text-primary' : 'text-destructive'
            }`}
          >
            {estado.ok ? <MailCheck className="h-4 w-4" /> : null}
            {estado.message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
