import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CriarAcessoForm } from './criar-acesso-form'
import { LinhaUsuario } from './linha-usuario'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (perfil?.role !== 'admin') redirect('/dashboard')

  // Lista pelo cliente admin: o RLS esconderia os demais perfis.
  const admin = createAdminClient()
  const { data: usuarios } = await admin
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Acessos
        </h1>
        <p className="text-muted-foreground">
          Crie o acesso do comprador e envie o e-mail e a senha para ele.
        </p>
      </div>

      <CriarAcessoForm />

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">
            Pessoas com acesso ({usuarios?.length ?? 0})
          </CardTitle>
          <CardDescription>
            Para trocar uma senha esquecida, use &ldquo;Nova senha&rdquo; e envie a
            nova ao comprador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!usuarios?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum acesso criado ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((u) => (
                  <LinhaUsuario
                    key={u.id}
                    usuario={u}
                    ehVoce={u.id === user.id}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
