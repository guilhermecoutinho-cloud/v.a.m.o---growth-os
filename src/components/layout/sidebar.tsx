'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Target,
  BarChart2,
  Lightbulb,
  TestTube,
  KanbanSquare,
  Calendar,
  GraduationCap,
  Video,
  Flame,
  User,
  Settings,
  Filter,
  Users,
  Map,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/login/actions'

export function Sidebar({
  email,
  role,
}: {
  email?: string
  role?: string
}) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border/50 bg-card/30 backdrop-blur-xl text-foreground relative shadow-2xl">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 blur-3xl pointer-events-none"></div>

      {/* BRAND */}
      <div className="flex h-16 items-center px-6 border-b border-border/50 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-[0_0_15px_rgba(72,209,122,0.4)]">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">V.A.M.O.</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-6 relative z-10 custom-scrollbar">
        <nav className="space-y-8 px-4">
          
          {/* VISÃO GERAL */}
          <div>
            <h4 className="mb-3 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Visão Geral
            </h4>
            <div className="space-y-1">
              <Link 
                href="/dashboard" 
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                  isActive('/dashboard') 
                    ? "text-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgba(72,209,122,0.2)]" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {isActive('/dashboard') && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(72,209,122,0.8)]"></div>
                )}
                <LayoutDashboard className={cn("h-4 w-4 transition-colors", isActive('/dashboard') ? "text-primary" : "group-hover:text-white")} />
                Dashboard
              </Link>

              <Link
                href="/dashboard/jornada"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                  isActive('/dashboard/jornada')
                    ? "text-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgba(72,209,122,0.2)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {isActive('/dashboard/jornada') && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(72,209,122,0.8)]"></div>
                )}
                <Map className={cn("h-4 w-4 transition-colors", isActive('/dashboard/jornada') ? "text-primary" : "group-hover:text-white")} />
                Minha Jornada
              </Link>
            </div>
          </div>

          {/* MINHA MÁQUINA */}
          <div>
            <h4 className="mb-3 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Minha Máquina
            </h4>
            <div className="space-y-1">
              <Link 
                href="/dashboard/arquitetura" 
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                  isActive('/dashboard/arquitetura') 
                    ? "text-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgba(72,209,122,0.2)]" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {isActive('/dashboard/arquitetura') && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(72,209,122,0.8)]"></div>
                )}
                <Building2 className={cn("h-4 w-4 transition-colors", isActive('/dashboard/arquitetura') ? "text-primary" : "group-hover:text-white")} />
                Arquitetura de Receita
              </Link>
              
              <Link 
                href="/dashboard/funil" 
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                  isActive('/dashboard/funil') 
                    ? "text-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgba(72,209,122,0.2)]" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {isActive('/dashboard/funil') && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(72,209,122,0.8)]"></div>
                )}
                <Filter className={cn("h-4 w-4 transition-colors", isActive('/dashboard/funil') ? "text-primary" : "group-hover:text-white")} />
                Funil Atual
              </Link>

              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/40 cursor-not-allowed">
                <TrendingUp className="h-4 w-4" />
                Alcance (Breve)
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/40 cursor-not-allowed">
                <Target className="h-4 w-4" />
                Vendas (Breve)
              </div>
            </div>
          </div>

          {/* GROWTH */}
          <div>
            <h4 className="mb-3 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Growth
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/40 cursor-not-allowed">
                <BarChart2 className="h-4 w-4" />
                Diagnóstico
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/40 cursor-not-allowed">
                <Lightbulb className="h-4 w-4" />
                Hipóteses
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/40 cursor-not-allowed">
                <TestTube className="h-4 w-4" />
                Experimentos
              </div>
            </div>
          </div>

          {/* ADMINISTRAÇÃO — só para admin */}
          {role === 'admin' && (
            <div>
              <h4 className="mb-3 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                Administração
              </h4>
              <div className="space-y-1">
                <Link
                  href="/dashboard/usuarios"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                    isActive('/dashboard/usuarios')
                      ? "text-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgba(72,209,122,0.2)]"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive('/dashboard/usuarios') && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(72,209,122,0.8)]"></div>
                  )}
                  <Users className={cn("h-4 w-4 transition-colors", isActive('/dashboard/usuarios') ? "text-primary" : "group-hover:text-white")} />
                  Acessos
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* FOOTER DO SIDEBAR */}
      <div className="border-t border-border/50 p-4 bg-background/50 relative z-10">
        <form action={logout} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5 transition-colors group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="truncate text-sm font-semibold text-white">
              {email ?? 'Usuário'}
            </span>
            <span className="text-xs text-muted-foreground">
              {role === 'admin' ? 'Administrador'
                : role === 'mentor' ? 'Mentor'
                : role === 'sales' ? 'Comercial'
                : 'Aluno'}
            </span>
          </div>
          <button type="submit" title="Sair" className="shrink-0">
            <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
          </button>
        </form>
      </div>
    </div>
  )
}
