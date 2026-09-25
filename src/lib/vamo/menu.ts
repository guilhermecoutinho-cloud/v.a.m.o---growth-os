import {
  LayoutDashboard,
  Map,
  Filter,
  KanbanSquare,
  Repeat,
  FileText,
  ShieldQuestion,
  BookOpen,
  Wrench,
  Megaphone,
  Network,
  Crosshair,
  SearchCheck,
  BookMarked,
  Lightbulb,
  FlaskConical,
  Layers,
  Building2,
  TestTube,
  CalendarRange,
  BarChart3,
  History,
  Briefcase,
  Users,
  type LucideIcon,
} from 'lucide-react'

/**
 * Estrutura da barra lateral, na ordem da sigla:
 * Vendas → Alcance → Mentalidade → Otimização.
 *
 * O acesso é controlado POR ITEM, não por seção: Mentalidade mistura
 * os dois produtos no desenho original. Modelado aqui como dado, e não
 * como enum de seção, para que virar tabela no banco depois seja só
 * trocar a origem desta lista.
 */

export type Produto = 'vamo' | 'estruturacao'

export type ItemMenu = {
  rotulo: string
  icone: LucideIcon
  /** Sem rota: a tela ainda não existe; aparece como "Breve". */
  href?: string
  /** Qual produto libera o item. Ausente = todo aluno vê. */
  exige?: Produto
}

export type GrupoMenu = {
  titulo: string
  /** Selo ao lado do título da seção. */
  selo?: Produto | 'interno'
  itens: ItemMenu[]
  /** Só aparece para estes papéis. */
  papeis?: string[]
}

export const SELO: Record<Produto | 'interno', string> = {
  vamo: 'V.A.M.O.',
  estruturacao: 'Estruturação',
  interno: 'Interno CAUP',
}

export const MENU: GrupoMenu[] = [
  {
    titulo: 'Visão Geral',
    itens: [
      { rotulo: 'Dashboard', icone: LayoutDashboard, href: '/dashboard' },
      { rotulo: 'Minha Jornada', icone: Map, href: '/dashboard/jornada' },
    ],
  },

  {
    titulo: 'Vendas',
    selo: 'vamo',
    itens: [
      { rotulo: 'Funil de Vendas', icone: Filter, exige: 'vamo' },
      { rotulo: 'Jornada Kanban', icone: KanbanSquare, exige: 'vamo' },
      { rotulo: 'Modelos de Cadência', icone: Repeat, exige: 'vamo' },
      { rotulo: 'Scripts por Etapa', icone: FileText, exige: 'vamo' },
      { rotulo: 'Objeções Mapeadas', icone: ShieldQuestion, exige: 'vamo' },
      { rotulo: 'Glossário de Vendas', icone: BookOpen, exige: 'vamo' },
      { rotulo: 'Ferramentas', icone: Wrench, exige: 'vamo' },
    ],
  },

  {
    titulo: 'Alcance',
    selo: 'vamo',
    itens: [
      {
        rotulo: 'Canais de Aquisição',
        icone: Megaphone,
        href: '/dashboard/aquisicao',
        exige: 'vamo',
      },
      { rotulo: 'Tipos de Funil de Marketing', icone: Network, exige: 'vamo' },
      { rotulo: 'ICP', icone: Crosshair, exige: 'vamo' },
      { rotulo: 'Auditoria de Tráfego', icone: SearchCheck, exige: 'vamo' },
      { rotulo: 'Glossário de Marketing', icone: BookMarked, exige: 'vamo' },
    ],
  },

  {
    titulo: 'Mentalidade',
    selo: 'estruturacao',
    itens: [
      // O mockup traz os cinco com cadeado. O texto da especificação diz
      // que Funil Atual e Hipóteses já vêm no V.A.M.O. — para inverter,
      // basta trocar 'estruturacao' por 'vamo' nestes dois.
      { rotulo: 'Funil Atual', icone: Filter, href: '/dashboard/funil', exige: 'estruturacao' },
      { rotulo: 'Hipóteses', icone: Lightbulb, href: '/dashboard/hipoteses', exige: 'estruturacao' },
      { rotulo: 'Ciclo Científico', icone: FlaskConical, exige: 'estruturacao' },
      { rotulo: 'Biblioteca de Alavancas', icone: Layers, exige: 'estruturacao' },
      {
        rotulo: 'Arquitetura de Receita',
        icone: Building2,
        href: '/dashboard/arquitetura',
        exige: 'estruturacao',
      },
    ],
  },

  {
    titulo: 'Otimização',
    selo: 'estruturacao',
    itens: [
      {
        rotulo: 'Experimentos',
        icone: TestTube,
        href: '/dashboard/experimentos',
        exige: 'estruturacao',
      },
      { rotulo: 'Plano de 90 dias', icone: CalendarRange, exige: 'estruturacao' },
      { rotulo: 'Dashboard de Resultados', icone: BarChart3, exige: 'estruturacao' },
      { rotulo: 'Histórico de Aprendizados', icone: History, exige: 'estruturacao' },
    ],
  },

  {
    // CRM da própria CAUP: não é dado do aluno. O acesso vem do papel,
    // não do produto comprado.
    titulo: 'Comercial',
    selo: 'interno',
    papeis: ['sales', 'admin'],
    itens: [{ rotulo: 'Leads', icone: Briefcase, href: '/dashboard/leads' }],
  },

  {
    titulo: 'Administração',
    papeis: ['admin'],
    itens: [{ rotulo: 'Acessos', icone: Users, href: '/dashboard/acessos' }],
  },
]

const TODOS_OS_PRODUTOS: Produto[] = ['vamo', 'estruturacao']

/**
 * Quais produtos a pessoa tem.
 *
 * Admin e mentor recebem todos, sempre: quem administra a plataforma
 * precisa alcançar qualquer tela funcional, e o mentor acompanha
 * empresas que podem ter os dois produtos. Isso não passa por
 * configuração — é regra do sistema.
 *
 * Quando a permissão do aluno virar dado no banco, só o último return
 * muda; nada mais na barra precisa saber disso.
 */
export function produtosDoUsuario(papel?: string): Produto[] {
  if (papel === 'admin' || papel === 'mentor') return TODOS_OS_PRODUTOS
  return ['vamo']
}

/** Atalho legível para checar acesso irrestrito. */
export function temAcessoTotal(papel?: string): boolean {
  return papel === 'admin' || papel === 'mentor'
}

export type EstadoItem = 'ativo' | 'breve' | 'bloqueado'

export function estadoDoItem(item: ItemMenu, produtos: Produto[]): EstadoItem {
  if (item.exige && !produtos.includes(item.exige)) return 'bloqueado'
  if (!item.href) return 'breve'
  return 'ativo'
}

/**
 * A rota está liberada para este papel?
 *
 * Usada nas páginas, no servidor: o cadeado da barra lateral só esconde
 * o item — quem digitar a URL passaria direto sem esta checagem.
 */
export function rotaLiberada(rota: string, papel?: string): boolean {
  // O admin alcança qualquer tela funcional. Sai na frente para que
  // uma restrição de papel adicionada depois não o barre sem querer.
  if (papel === 'admin') return true

  const produtos = produtosDoUsuario(papel)
  for (const grupo of MENU) {
    for (const item of grupo.itens) {
      if (item.href !== rota) continue
      if (grupo.papeis && !grupo.papeis.includes(papel ?? '')) return false
      return !item.exige || produtos.includes(item.exige)
    }
  }
  return true // rota fora do menu: sem restrição por produto
}
