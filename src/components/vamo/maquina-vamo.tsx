import { ALAVANCAS, MAQUINA } from '@/lib/vamo/modelo'
import type { Alavanca } from '@/lib/vamo/modelo'
import { cn } from '@/lib/utils'

/**
 * A Máquina V.A.M.O. — modelo único da plataforma, no lugar da Gravata
 * Borboleta. Cada etapa carrega a tag da alavanca correspondente.
 *
 * Em HTML, não SVG: os rótulos nunca se sobrepõem nem transbordam,
 * problema que a gravata tinha com texto rotacionado em -90°.
 */

const ALAVANCA_DA_ETAPA: Partial<Record<(typeof MAQUINA)[number], Alavanca>> = {
  Atenção: 'demanda',
  Demanda: 'demanda',
  Lead: 'qualificacao',
  Oportunidade: 'conversao',
  Venda: 'ticket',
  Recompra: 'frequencia',
  Cliente: 'retencao',
  Indicação: 'indicacao',
}

const COR_ALAVANCA: Record<Alavanca, string> = {
  demanda: '#4f46e5',
  qualificacao: '#7c3aed',
  conversao: '#db2777',
  ticket: '#00D68F',
  frequencia: '#0ea5e9',
  retencao: '#f59e0b',
  indicacao: '#10b981',
}

export function MaquinaVamo({ destaque }: { destaque?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Máquina V.A.M.O.
      </h3>
      <p className="mb-5 text-sm text-muted-foreground">
        Do mercado à indicação. Cada etapa responde a uma alavanca.
      </p>

      <div className="flex flex-wrap gap-2">
        {MAQUINA.map((etapa, i) => {
          const alavanca = ALAVANCA_DA_ETAPA[etapa]
          const cor = alavanca ? COR_ALAVANCA[alavanca] : '#64748b'
          const ativo = destaque === etapa

          return (
            <div
              key={etapa}
              className={cn(
                'flex min-w-[8.5rem] flex-1 flex-col gap-1.5 rounded-xl border p-3 transition-colors',
                ativo ? 'border-primary/50 bg-primary/[0.07]' : 'border-border/50 bg-white/[0.02]'
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: cor }}
                  aria-hidden
                />
                <span className="text-sm font-semibold text-white">{etapa}</span>
              </div>
              {alavanca ? (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {ALAVANCAS[alavanca].numero} {ALAVANCAS[alavanca].nome}
                </span>
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  Contexto
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border/50 pt-4">
        {Object.entries(ALAVANCAS).map(([chave, a]) => (
          <span key={chave} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: COR_ALAVANCA[chave as Alavanca] }}
              aria-hidden
            />
            {a.numero} {a.nome}
          </span>
        ))}
      </div>
    </div>
  )
}
