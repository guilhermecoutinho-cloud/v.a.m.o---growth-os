import type { LucideIcon } from 'lucide-react'
import {
  Eye,
  Search,
  Scale,
  Handshake,
  Rocket,
  LifeBuoy,
  Repeat,
  Megaphone,
  Trophy,
} from 'lucide-react'

export type Lado = 'aquisicao' | 'venda' | 'experiencia'

export type Etapa = {
  id: string
  label: string
  /** O que a empresa precisa resolver nesta etapa. */
  objetivo: string
  /** A pergunta que o cliente está se fazendo aqui. */
  pergunta: string
  lado: Lado
  cor: string
  icone: LucideIcon
}

/**
 * As 9 etapas do funil gravata-borboleta do V.A.M.O.
 * Mesmos ids e cores usados em /dashboard/arquitetura, de proposito:
 * as duas telas falam da mesma jornada, entao precisam combinar.
 */
export const ETAPAS: Etapa[] = [
  {
    id: 'consciencia',
    label: 'Consciência',
    objetivo: 'Fazer o mercado descobrir que você existe.',
    pergunta: 'Existe alguém que resolve o meu problema?',
    lado: 'aquisicao',
    cor: '#4f46e5',
    icone: Eye,
  },
  {
    id: 'consideracao',
    label: 'Consideração',
    objetivo: 'Virar uma opção real na cabeça de quem busca.',
    pergunta: 'Essa empresa serve para o meu caso?',
    lado: 'aquisicao',
    cor: '#7c3aed',
    icone: Search,
  },
  {
    id: 'avaliacao',
    label: 'Avaliação',
    objetivo: 'Provar valor diante dos concorrentes.',
    pergunta: 'Por que eles e não os outros?',
    lado: 'aquisicao',
    cor: '#db2777',
    icone: Scale,
  },
  {
    id: 'decisao',
    label: 'Decisão',
    objetivo: 'Remover o atrito final e fechar.',
    pergunta: 'Vale o preço? Posso confiar?',
    lado: 'aquisicao',
    cor: '#e11d48',
    icone: Handshake,
  },
  {
    id: 'venda',
    label: 'Venda',
    objetivo: 'O momento da conversão — o centro da gravata.',
    pergunta: 'Fechado. E agora?',
    lado: 'venda',
    cor: '#00D68F',
    icone: Trophy,
  },
  {
    id: 'integracao',
    label: 'Integração',
    objetivo: 'Entregar o primeiro resultado rápido.',
    pergunta: 'Tomei a decisão certa?',
    lado: 'experiencia',
    cor: '#e11d48',
    icone: Rocket,
  },
  {
    id: 'suporte',
    label: 'Suporte',
    objetivo: 'Resolver problemas antes que virem cancelamento.',
    pergunta: 'Me ajudam quando eu preciso?',
    lado: 'experiencia',
    cor: '#db2777',
    icone: LifeBuoy,
  },
  {
    id: 'retencao',
    label: 'Retenção',
    objetivo: 'Manter o cliente comprando e evitar churn.',
    pergunta: 'Ainda vale a pena continuar?',
    lado: 'experiencia',
    cor: '#7c3aed',
    icone: Repeat,
  },
  {
    id: 'recomendacao',
    label: 'Recomendação',
    objetivo: 'Transformar cliente em canal de aquisição.',
    pergunta: 'Eu indicaria para um amigo?',
    lado: 'experiencia',
    cor: '#4f46e5',
    icone: Megaphone,
  },
]

export const ROTULO_LADO: Record<Lado, string> = {
  aquisicao: 'Marketing & Vendas',
  venda: 'Conversão',
  experiencia: 'Experiência do Cliente',
}
