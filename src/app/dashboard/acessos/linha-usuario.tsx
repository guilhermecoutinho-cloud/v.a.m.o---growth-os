'use client'

import { useActionState } from 'react'
import { reenviarAcesso, revogarAcesso, type ActionState } from './actions'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'

const INICIAL: ActionState = { ok: false, message: '' }

const ROTULO_PAPEL: Record<string, string> = {
  admin: 'Administrador',
  mentor: 'Mentor',
  sales: 'Comercial',
  student: 'Aluno',
}

export type UsuarioLinha = {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  empresa: string | null
  mentor: string | null
  ativo: boolean
}

export function LinhaUsuario({
  usuario,
  ehVoce,
}: {
  usuario: UsuarioLinha
  ehVoce: boolean
}) {
  const [estadoReenvio, acaoReenvio] = useActionState(reenviarAcesso, INICIAL)
  const [estadoRevogar, acaoRevogar] = useActionState(revogarAcesso, INICIAL)

  const mensagem = estadoReenvio.message || estadoRevogar.message
  const mensagemOk = estadoReenvio.ok || estadoRevogar.ok

  return (
    <>
      <TableRow>
        <TableCell className="font-medium text-foreground">
          {usuario.email}
          {ehVoce && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
          <div className="text-xs text-muted-foreground">{usuario.full_name ?? '—'}</div>
        </TableCell>

        <TableCell className="text-muted-foreground">{usuario.empresa ?? '—'}</TableCell>
        <TableCell className="text-muted-foreground">{usuario.mentor ?? '—'}</TableCell>

        <TableCell>
          <span
            className={
              usuario.role === 'admin'
                ? 'rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary'
                : 'text-sm text-muted-foreground'
            }
          >
            {ROTULO_PAPEL[usuario.role] ?? usuario.role}
          </span>
        </TableCell>

        <TableCell>
          <span
            className={
              usuario.ativo
                ? 'rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary'
                : 'rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400'
            }
          >
            {usuario.ativo ? 'Ativo' : 'Convite pendente'}
          </span>
        </TableCell>

        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <form action={acaoReenvio}>
              <input type="hidden" name="email" value={usuario.email} />
              <Button type="submit" variant="outline" size="sm">
                Reenviar link
              </Button>
            </form>

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

      {mensagem && (
        <TableRow>
          <TableCell
            colSpan={6}
            className={`text-sm ${mensagemOk ? 'text-primary' : 'text-destructive'}`}
          >
            {mensagem}
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
