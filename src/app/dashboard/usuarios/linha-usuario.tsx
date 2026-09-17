'use client'

import { useActionState, useState } from 'react'
import { redefinirSenha, revogarAcesso, type ActionState } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TableCell, TableRow } from '@/components/ui/table'
import { Check, Copy } from 'lucide-react'

const estadoInicial: ActionState = { ok: false, message: '' }

const ROTULO_PERFIL: Record<string, string> = {
  admin: 'Administrador',
  mentor: 'Mentor',
  sales: 'Comercial',
  student: 'Aluno',
}

type Usuario = {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

function gerarSenha() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const valores = crypto.getRandomValues(new Uint32Array(12))
  return Array.from(valores, (v) => alfabeto[v % alfabeto.length]).join('')
}

export function LinhaUsuario({
  usuario,
  ehVoce,
}: {
  usuario: Usuario
  ehVoce: boolean
}) {
  const [trocando, setTrocando] = useState(false)
  const [senha, setSenha] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [estadoSenha, acaoSenha] = useActionState(redefinirSenha, estadoInicial)
  const [estadoRevogar, acaoRevogar] = useActionState(revogarAcesso, estadoInicial)

  const nova = estadoSenha.credentials

  async function copiar() {
    if (!nova) return
    await navigator.clipboard.writeText(
      `Seu acesso à plataforma V.A.M.O.\n\n` +
      `E-mail: ${nova.email}\nSenha: ${nova.password}\n\n` +
      `Acesse: ${window.location.origin}/login`
    )
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <>
      <TableRow>
        <TableCell className="font-medium text-foreground">
          {usuario.email}
          {ehVoce && (
            <span className="ml-2 text-xs text-muted-foreground">(você)</span>
          )}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {usuario.full_name ?? '—'}
        </TableCell>
        <TableCell>
          <span
            className={
              usuario.role === 'admin'
                ? 'rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary'
                : 'text-sm text-muted-foreground'
            }
          >
            {ROTULO_PERFIL[usuario.role] ?? usuario.role}
          </span>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSenha(gerarSenha())
                setTrocando((v) => !v)
              }}
            >
              Nova senha
            </Button>

            {!ehVoce && (
              <form action={acaoRevogar}>
                <input type="hidden" name="user_id" value={usuario.id} />
                <input type="hidden" name="email" value={usuario.email} />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                >
                  Revogar
                </Button>
              </form>
            )}
          </div>
        </TableCell>
      </TableRow>

      {trocando && (
        <TableRow>
          <TableCell colSpan={5} className="bg-muted/20">
            <form action={acaoSenha} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="user_id" value={usuario.id} />
              <input type="hidden" name="email" value={usuario.email} />
              <Input
                name="password"
                type="text"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-64 bg-input font-mono text-foreground"
              />
              <Button type="submit" size="sm">Salvar senha</Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTrocando(false)}
              >
                Cancelar
              </Button>
            </form>

            {estadoSenha.message && !estadoSenha.ok && (
              <p className="mt-2 text-sm text-destructive">{estadoSenha.message}</p>
            )}

            {estadoSenha.ok && nova && (
              <div className="mt-2 flex items-center gap-3">
                <p className="font-mono text-sm text-primary">
                  {nova.email} · {nova.password}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={copiar}>
                  {copiado ? (
                    <><Check className="mr-2 h-3 w-3" /> Copiado</>
                  ) : (
                    <><Copy className="mr-2 h-3 w-3" /> Copiar</>
                  )}
                </Button>
              </div>
            )}
          </TableCell>
        </TableRow>
      )}

      {estadoRevogar.message && !estadoRevogar.ok && (
        <TableRow>
          <TableCell colSpan={5} className="text-sm text-destructive">
            {estadoRevogar.message}
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
