'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Target,
  Lightbulb,
  TestTube,
  Map,
  Users,
  Filter,
  Briefcase,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/login/actions'
import { SeletorEmpresa } from './seletor-empresa'
import type { Organizacao } from '@/lib/vamo/tipos'

type ItemMenu = {
  href?: string
  rotulo: string
  icone: typeof LayoutDashboard
  /** Sem href: aparece esmaecido com o aviso de indisponível. */
  breve?: boolean
}

const ROTULO_PAPEL: Record<string, string> = {
  admin: 'Administrador',
  mentor: 'Mentor',
  sales: 'Comercial',
  student: 'Aluno',
}

export function Sidebar({
  email,
  role,
  organizacoes = [],
  organizacaoAtual = null,
}: {
  email?: string
  role?: string
  organizacoes?: Organizacao[]
  organizacaoAtual?: Organizacao | null
}) {
  const pathname = usePathname()
  const params = useSearchParams()
  const org = params.get('org')

  // Mantém a empresa escolhida ao navegar entre as telas.
  const comOrg = (href: string) => (org ? `${href}?org=${org}` : href)
  const ativo = (href: string) => pathname === href

  const grupos: Array<{ titulo: string; itens: ItemMenu[] }> = [
    {
      titulo: 'Visão Geral',
      itens: [
        { href: '/dashboard', rotulo: 'Dashboard', icone: LayoutDashboard },
        { href: '/dashboard/jornada', rotulo: 'Minha Jornada', icone: Map },
      ],
    },
    {
      titulo: 'Minha Máquina',
      itens: [
        { href: '/dashboard/funil', rotulo: 'Funil Atual', icone: Filter },
        { href: '/dashboard/arquitetura', rotulo: 'Arquitetura de Receita', icone: Building2 },
        { rotulo: 'Alcance', icone: TrendingUp, breve: true },
        { rotulo: 'Vendas', icone: Target, breve: true },
      ],
    },
    {
      titulo: 'Growth',
      itens: [
        { href: '/dashboard/hipoteses', rotulo: 'Hipóteses', icone: Lightbulb },
        { rotulo: 'Experimentos', icone: TestTube, breve: true },
        { rotulo: 'Plano de 90 dias', icone: Target, breve: true },
      ],
    },
  ]

  if (role === 'sales' || role === 'admin') {
    grupos.push({
      titulo: 'Comercial',
      itens: [{ href: '/dashboard/leads', rotulo: 'Leads', icone: Briefcase }],
    })
  }

  if (role === 'admin') {
    grupos.push({
      titulo: 'Administração',
      itens: [{ href: '/dashboard/usuarios', rotulo: 'Acessos', icone: Users }],
    })
  }

  return (
    // sticky + h-screen: a barra acompanha a rolagem em vez de sumir.
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border/50 bg-card/30 text-foreground shadow-2xl backdrop-blur-xl">
      <div className="pointer-events-none absolute left-0 top-0 h-32 w-full bg-primary/5 blur-3xl" />

      {/* MARCA */}
      <div className="relative z-10 flex h-16 items-center border-b border-border/50 px-6">
        <Link href={comOrg('/dashboard')} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/50 shadow-[0_0_15px_rgba(0,214,143,0.4)]">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">V.A.M.O.</span>
        </Link>
      </div>

      {/* EMPRESA */}
      {organizacoes.length > 0 && (
        <div className="relative z-10 border-b border-border/50 px-4 py-3">
          <SeletorEmpresa organizacoes={organizacoes} atual={organizacaoAtual} />
        </div>
      )}

      {/* NAVEGAÇÃO */}
      <nav className="custom-scrollbar relative z-10 flex-1 space-y-7 overflow-y-auto px-4 py-6">
        {grupos.map((grupo) => (
          <div key={grupo.titulo}>
            <h4 className="mb-3 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              {grupo.titulo}
            </h4>
            <div className="space-y-1">
              {grupo.itens.map((item) => {
                const Icone = item.icone

                if (item.breve || !item.href) {
                  return (
                    <div
                      key={item.rotulo}
                      title="Disponível em breve"
                      aria-disabled="true"
                      className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/40"
                    >
                      <Icone className="h-4 w-4" />
                      {item.rotulo}
                      <span className="ml-auto text-[10px] uppercase tracking-wider">Breve</span>
                    </div>
                  )
                }

                const estaAtivo = ativo(item.href)
                return (
                  <Link
                    key={item.rotulo}
                    href={comOrg(item.href)}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      estaAtivo
                        ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(0,214,143,0.2)]'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {estaAtivo && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_10px_rgba(0,214,143,0.8)]" />
                    )}
                    <Icone
                      className={cn(
                        'h-4 w-4 transition-colors',
                        estaAtivo ? 'text-primary' : 'group-hover:text-white'
                      )}
                    />
                    {item.rotulo}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* USUÁRIO */}
      <div className="relative z-10 border-t border-border/50 bg-background/50 p-4">
        <form
          action={logout}
          className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-white">{email ?? 'Usuário'}</span>
            <span className="text-xs text-muted-foreground">
              {ROTULO_PAPEL[role ?? ''] ?? 'Aluno'}
            </span>
          </div>
          <button type="submit" title="Sair" className="shrink-0">
            <LogOut className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-destructive" />
          </button>
        </form>
      </div>
    </aside>
  )
}
