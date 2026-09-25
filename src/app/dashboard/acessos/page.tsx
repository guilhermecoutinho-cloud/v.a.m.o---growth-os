import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CriarAcessoForm } from './criar-acesso-form'
import { LinhaUsuario, type UsuarioLinha } from './linha-usuario'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Organizacao } from '@/lib/vamo/tipos'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const papel =
    (user.app_metadata?.role as string) ??
    (await supabase.from('profiles').select('role').eq('id', user.id).single()).data?.role
  if (papel !== 'admin') redirect('/dashboard')

  // Lista pelo cliente admin: o RLS esconderia os demais perfis.
  const admin = createAdminClient()
  const [
    { data: perfis },
    { data: empresas },
    { data: vinculos },
    { data: mentorias },
    { data: authUsers },
  ] = await Promise.all([
    admin.from('profiles').select('id, email, full_name, role, created_at').order('created_at', { ascending: false }),
    admin.from('organizations').select('id, name, segment, business_model').order('name'),
    admin.from('organization_members').select('user_id, organization_id'),
    admin.from('mentor_assignments').select('organization_id, mentor_id'),
    admin.auth.admin.listUsers(),
  ])

  const nomeEmpresa = new Map((empresas ?? []).map((e) => [e.id, e.name]))
  const empresaDoUsuario = new Map((vinculos ?? []).map((v) => [v.user_id, v.organization_id]))
  const nomePerfil = new Map((perfis ?? []).map((p) => [p.id, p.full_name ?? p.email]))
  const mentorDaEmpresa = new Map(
    (mentorias ?? []).map((m) => [m.organization_id, nomePerfil.get(m.mentor_id) ?? null])
  )
  // Quem nunca confirmou o convite ainda não tem last_sign_in_at.
  const jaEntrou = new Map(
    (authUsers?.users ?? []).map((u) => [u.id, Boolean(u.last_sign_in_at)])
  )

  const usuarios: UsuarioLinha[] = (perfis ?? []).map((p) => {
    const orgId = empresaDoUsuario.get(p.id)
    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      role: p.role,
      created_at: p.created_at,
      empresa: orgId ? (nomeEmpresa.get(orgId) ?? null) : null,
      mentor: orgId ? (mentorDaEmpresa.get(orgId) ?? null) : null,
      ativo: jaEntrou.get(p.id) ?? false,
    }
  })

  const mentores = (perfis ?? [])
    .filter((p) => p.role === 'mentor' || p.role === 'admin')
    .map((p) => ({ id: p.id, full_name: p.full_name, email: p.email }))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Acessos</h1>
        <p className="mt-1.5 text-muted-foreground">
          Convide o comprador por e-mail. Ele define a própria senha no primeiro acesso.
        </p>
      </header>

      <CriarAcessoForm empresas={(empresas ?? []) as Organizacao[]} mentores={mentores} />

      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">
            Pessoas com acesso ({usuarios.length})
          </CardTitle>
          <CardDescription>
            Quem ainda não entrou aparece como convite pendente. Use “Reenviar link” se o e-mail
            se perdeu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum acesso criado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pessoa</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((u) => (
                    <LinhaUsuario key={u.id} usuario={u} ehVoce={u.id === user.id} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
