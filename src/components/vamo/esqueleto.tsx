/**
 * Esqueletos de carregamento.
 *
 * Servem para a navegação responder na hora: o Next troca a tela assim
 * que o clique acontece e preenche quando os dados chegam, em vez de
 * deixar a página anterior congelada.
 */

export function Linha({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/[0.06] ${className}`} />
}

export function EsqueletoCabecalho() {
  return (
    <div className="space-y-2">
      <Linha className="h-9 w-72" />
      <Linha className="h-4 w-96" />
    </div>
  )
}

export function EsqueletoCartoes({ quantos = 4 }: { quantos?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: quantos }, (_, i) => (
        <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
          <Linha className="h-3 w-24" />
          <Linha className="mt-4 h-8 w-32" />
          <Linha className="mt-2 h-3 w-40" />
        </div>
      ))}
    </div>
  )
}

export function EsqueletoBloco({ altura = 'h-72' }: { altura?: string }) {
  return (
    <div className={`rounded-2xl border border-border/60 bg-card ${altura}`}>
      <div className="space-y-3 p-5">
        <Linha className="h-4 w-40" />
        <Linha className="h-3 w-64" />
      </div>
    </div>
  )
}

export function EsqueletoLista({ linhas = 5 }: { linhas?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="rounded-xl border border-border/60 bg-card p-4">
          <Linha className="h-4 w-1/3" />
          <Linha className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

/** Layout padrão de carregamento: cabeçalho + conteúdo. */
export function EsqueletoPagina({ children }: { children?: React.ReactNode }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      <EsqueletoCabecalho />
      {children}
    </div>
  )
}
