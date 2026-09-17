'use client'

import { useEffect, useState } from 'react'
import { ETAPAS, ROTULO_LADO, type Etapa } from '@/lib/jornada'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Check, ChevronRight, MapPin } from 'lucide-react'

const CHAVE = 'vamo:jornada:v1'

type Progresso = {
  concluidas: string[]
  atual: string
}

const INICIAL: Progresso = { concluidas: [], atual: 'consciencia' }

export default function JornadaPage() {
  const [progresso, setProgresso] = useState<Progresso>(INICIAL)
  const [carregado, setCarregado] = useState(false)

  // Prévia: o progresso mora no navegador. Ao ligar no banco, troque
  // este efeito por uma leitura da tabela de progresso do usuário.
  // A tela renderiza o estado inicial no servidor e o efeito apenas
  // sobrepõe o que estiver salvo — nada de esqueleto em branco.
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE)
      if (salvo) setProgresso({ ...INICIAL, ...JSON.parse(salvo) })
    } catch {
      // localStorage pode estar bloqueado; seguimos com o estado inicial.
    }
    setCarregado(true)
  }, [])

  useEffect(() => {
    if (!carregado) return
    try {
      localStorage.setItem(CHAVE, JSON.stringify(progresso))
    } catch {
      // Sem persistência: a tela continua utilizável nesta sessão.
    }
  }, [progresso, carregado])

  const indiceAtual = ETAPAS.findIndex((e) => e.id === progresso.atual)
  const etapaAtual = ETAPAS[indiceAtual] ?? ETAPAS[0]
  const concluidas = new Set(progresso.concluidas)
  const percentual = Math.round((concluidas.size / ETAPAS.length) * 100)

  function estado(etapa: Etapa, indice: number) {
    if (concluidas.has(etapa.id)) return 'concluida' as const
    if (indice === indiceAtual) return 'atual' as const
    return 'pendente' as const
  }

  function alternar(id: string) {
    setProgresso((p) => {
      const feitas = new Set(p.concluidas)
      feitas.has(id) ? feitas.delete(id) : feitas.add(id)
      return { ...p, concluidas: [...feitas] }
    })
  }

  function concluirEAvancar() {
    const proxima = ETAPAS[indiceAtual + 1]
    setProgresso((p) => ({
      concluidas: [...new Set([...p.concluidas, etapaAtual.id])],
      atual: proxima ? proxima.id : etapaAtual.id,
    }))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Minha Jornada
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Onde sua máquina está agora e qual é o próximo passo.
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{percentual}%</div>
          <div className="text-sm text-muted-foreground">
            {concluidas.size} de {ETAPAS.length} etapas
          </div>
        </div>
      </div>

      {/* Trilha */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-6">
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          Funil completo
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4">
          {ETAPAS.map((etapa, i) => {
            const st = estado(etapa, i)
            const Icone = etapa.icone
            const mudouDeLado = i > 0 && ETAPAS[i - 1].lado !== etapa.lado

            return (
              <div key={etapa.id} className="flex items-center gap-2">
                {mudouDeLado && (
                  <div className="h-16 w-px shrink-0 bg-border" aria-hidden />
                )}
                <button
                  type="button"
                  onClick={() => setProgresso((p) => ({ ...p, atual: etapa.id }))}
                  className={cn(
                    'group relative flex w-32 shrink-0 flex-col items-center gap-2 rounded-lg border p-3 transition-all',
                    st === 'atual' &&
                      'border-primary bg-primary/10 shadow-[0_0_20px_rgba(72,209,122,0.15)]',
                    st === 'concluida' && 'border-border/50 bg-white/5',
                    st === 'pendente' &&
                      'border-border/30 opacity-50 hover:opacity-80'
                  )}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      backgroundColor:
                        st === 'pendente' ? 'rgba(255,255,255,0.06)' : etapa.cor,
                    }}
                  >
                    {st === 'concluida' ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <Icone
                        className={cn(
                          'h-5 w-5',
                          st === 'pendente' ? 'text-muted-foreground' : 'text-white'
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-center text-xs font-medium leading-tight',
                      st === 'atual' ? 'text-white' : 'text-muted-foreground'
                    )}
                  >
                    {etapa.label}
                  </span>
                  {st === 'atual' && (
                    <span className="absolute -top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      VOCÊ ESTÁ AQUI
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${percentual}%` }}
          />
        </div>
      </div>

      {/* Etapa atual em destaque */}
      <div className="rounded-xl border border-primary/30 bg-card p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: etapaAtual.cor }}
            >
              <etapaAtual.icone className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {ROTULO_LADO[etapaAtual.lado]} · Etapa {indiceAtual + 1}
              </div>
              <h2 className="mt-1 text-2xl font-bold text-white">
                {etapaAtual.label}
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                {etapaAtual.objetivo}
              </p>
              <p className="mt-3 max-w-xl border-l-2 border-border pl-3 text-sm italic text-muted-foreground">
                O cliente se pergunta: &ldquo;{etapaAtual.pergunta}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            <Button
              type="button"
              onClick={concluirEAvancar}
              disabled={indiceAtual === ETAPAS.length - 1 && concluidas.has(etapaAtual.id)}
              className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {concluidas.has(etapaAtual.id) ? 'Avançar' : 'Concluir etapa'}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => alternar(etapaAtual.id)}
            >
              {concluidas.has(etapaAtual.id) ? 'Reabrir' : 'Marcar como feita'}
            </Button>
          </div>
        </div>
      </div>

      {/* Lista por bloco */}
      <div className="grid gap-4 md:grid-cols-3">
        {(['aquisicao', 'venda', 'experiencia'] as const).map((lado) => (
          <div
            key={lado}
            className="rounded-xl border border-border/50 bg-card/30 p-5"
          >
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {ROTULO_LADO[lado]}
            </h3>
            <div className="space-y-2">
              {ETAPAS.filter((e) => e.lado === lado).map((etapa) => {
                const feita = concluidas.has(etapa.id)
                return (
                  <button
                    key={etapa.id}
                    type="button"
                    onClick={() => alternar(etapa.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
                  >
                    <div
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                        feita
                          ? 'border-primary bg-primary'
                          : 'border-border bg-transparent'
                      )}
                    >
                      {feita && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        feita
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      )}
                    >
                      {etapa.label}
                    </span>
                    {etapa.id === progresso.atual && (
                      <span className="ml-auto text-[10px] font-bold text-primary">
                        ATUAL
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Prévia: seu progresso fica salvo neste navegador. Ao publicar,
        passamos a guardá-lo na sua conta.
      </p>
    </div>
  )
}
