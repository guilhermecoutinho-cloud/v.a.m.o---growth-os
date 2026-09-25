'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { TrendingUp, LogOut, User, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/login/actions'
import { SeletorEmpresa } from './seletor-empresa'
import {
  MENU,
  SELO,
  produtosDoUsuario,
  estadoDoItem,
  type ItemMenu,
  type EstadoItem,
} from '@/lib/vamo/menu'
import type { Organizacao } from '@/lib/vamo/tipos'

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

  const comOrg = (href: string) => (org ? `${href}?org=${org}` : href)
  const produtos = produtosDoUsuario(role)
  const grupos = MENU.filter((g) => !g.papeis || g.papeis.includes(role ?? ''))

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
      <nav className="custom-scrollbar relative z-10 flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {grupos.map((grupo) => (
          <div key={grupo.titulo}>
            <div className="mb-2.5 flex items-center gap-2 px-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {grupo.titulo}
              </h4>
              {grupo.selo && (
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                    grupo.selo === 'vamo' && 'bg-primary/15 text-primary',
                    grupo.selo === 'estruturacao' && 'bg-amber-500/15 text-amber-400',
                    grupo.selo === 'interno' && 'bg-white/10 text-muted-foreground'
                  )}
                >
                  {SELO[grupo.selo]}
                </span>
              )}
            </div>

            <div className="space-y-0.5">
              {grupo.itens.map((item) => (
                <LinhaMenu
                  key={item.rotulo}
                  item={item}
                  estado={estadoDoItem(item, produtos)}
                  ativo={item.href ? pathname === item.href : false}
                  href={item.href ? comOrg(item.href) : undefined}
                />
              ))}
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

function LinhaMenu({
  item,
  estado,
  ativo,
  href,
}: {
  item: ItemMenu
  estado: EstadoItem
  ativo: boolean
  href?: string
}) {
  const router = useRouter()
  const Icone = item.icone

  // Sem o produto: cadeado à direita, não clicável.
  if (estado === 'bloqueado') {
    return (
      <div
        title="Disponível na Estruturação de Growth"
        aria-disabled="true"
        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50"
      >
        <Icone className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
        <Lock className="h-3 w-3 shrink-0 text-amber-500/70" />
      </div>
    )
  }

  // Tem o produto, mas a tela ainda não existe.
  if (estado === 'breve' || !href) {
    return (
      <div
        title="Disponível em breve"
        aria-disabled="true"
        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/40"
      >
        <Icone className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
        <span className="shrink-0 text-[9px] uppercase tracking-wider">Breve</span>
      </div>
    )
  }

  return (
    <Link
      href={href}
      // Sem prefetch automático: a barra tem ~20 itens, e o padrão do
      // Next pré-carregaria todos os visíveis de uma vez. O onMouseEnter
      // abaixo carrega só aquele que a pessoa está prestes a clicar.
      prefetch={false}
      onMouseEnter={() => router.prefetch(href)}
      onFocus={() => router.prefetch(href)}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        ativo
          ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(0,214,143,0.2)]'
          : 'text-muted-foreground hover:bg-white/5 hover:text-white'
      )}
    >
      {ativo && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_10px_rgba(0,214,143,0.8)]" />
      )}
      <Icone
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          ativo ? 'text-primary' : 'group-hover:text-white'
        )}
      />
      <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
    </Link>
  )
}
