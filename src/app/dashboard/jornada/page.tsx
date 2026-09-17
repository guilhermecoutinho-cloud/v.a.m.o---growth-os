'use client'

import { useEffect, useState } from 'react'
import { ETAPAS, ROTULO_LADO, type Etapa, type Lado } from '@/lib/jornada'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Check, ChevronRight, RotateCcw } from 'lucide-react'

const CHAVE = 'vamo:jornada:v1'

type Progresso = {
  concluidas: string[]
  atual: string
}

const INICIAL: Progresso = { concluidas: [], atual: 'consciencia' }

const LADOS: Lado[] = ['aquisicao', 'venda', 'experiencia']

export default function JornadaPage() {
  const [progresso, setProgresso] = useState<Progresso>(INICIAL)
  const [carregado, setCarregado] = useState(false)

  // Prévia: o progresso mora no navegador. Ao ligar no banco, troque
  // este efeito por uma leitura da tabela de progresso do usuário.
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

  const concluidas = new Set(progresso.concluidas)
  const indiceAtual = ETAPAS.findIndex((e) => e.id === progresso.atual)
  const etapaAtual = ETAPAS[indiceAtual] ?? ETAPAS[0]
  const percentual = Math.round((concluidas.size / ETAPAS.length) * 100)

  function estado(etapa: Etapa, indice: number) {
    if (concluidas.has(etapa.id)) return 'concluida' as const
    if (indice === indiceAtual) return 'atual' as const
    return 'pendente' as const
  }

  function alternar(id: string) {
    setProgresso((p) => {
      const feitas = new Set(p.concluidas)
      if (feitas.has(id)) feitas.delete(id)
      else feitas.add(id)
      return { ...p, concluidas: [...feitas] }
    })
  }

  function concluirEAvancar() {
    const proxima = ETAPAS.slice(indiceAtual + 1).find(
      (e) => !concluidas.has(e.id)
    )
    setProgresso((p) => ({
      concluidas: [...new Set([...p.concluidas, etapaAtual.id])],
      atual: proxima ? proxima.id : etapaAtual.id,
    }))
  }

  const feita = concluidas.has(etapaAtual.id)
  const tudoFeito = concluidas.size === ETAPAS.length

  return (
    <div className="space-y-6">
      {/* ---- CABEÇALHO ---------------------------------------------- */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Minha Jornada
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Onde sua máquina está agora e qual é o próximo passo.
          </p>
        </div>

        {/* Anel de progresso: mais legível que um número solto */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-white/8"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(percentual / 100) * 97.4} 97.4`}
                className="transition-[stroke-dasharray] duration-700 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
              {percentual}%
            </span>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-white">
              {concluidas.size} de {ETAPAS.length}
            </div>
            <div className="text-muted-foreground">etapas concluídas</div>
          </div>
        </div>
      </header>

      {/* ---- BARRA DE PROGRESSO ------------------------------------- */}
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-[width] duration-700 ease-out',
            percentual > 0 && percentual < 100 && 'barra-progresso'
          )}
          style={{ width: `${percentual}%` }}
        />
      </div>

      {/* ---- ETAPA EM FOCO ------------------------------------------ */}
      <section
        key={etapaAtual.id}
        className="surgir relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 sm:p-7"
      >
        {/* Brilho na cor da etapa, trocado a cada seleção */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-20 blur-3xl transition-colors duration-500"
          style={{ backgroundColor: etapaAtual.cor }}
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-500"
              style={{ backgroundColor: etapaAtual.cor }}
            >
              <etapaAtual.icone className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <span>{ROTULO_LADO[etapaAtual.lado]}</span>
                <span className="text-border">•</span>
                <span>Etapa {indiceAtual + 1} de {ETAPAS.length}</span>
                {feita && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-primary">
                    Concluída
                  </span>
                )}
              </div>

              <h2 className="mt-1 text-2xl font-bold text-white">
                {etapaAtual.label}
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                {etapaAtual.objetivo}
              </p>
              <p className="mt-4 max-w-xl border-l-2 border-border pl-3 text-sm italic text-muted-foreground">
                O cliente se pergunta: &ldquo;{etapaAtual.pergunta}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2 lg:flex-col">
            <Button
              type="button"
              onClick={concluirEAvancar}
              disabled={tudoFeito}
              className="flex-1 bg-primary font-semibold text-primary-foreground transition-transform hover:bg-primary/90 active:scale-[0.98] lg:flex-none"
            >
              {feita ? 'Próxima etapa' : 'Concluir etapa'}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            {feita && (
              <Button
                type="button"
                variant="outline"
                onClick={() => alternar(etapaAtual.id)}
                className="flex-1 lg:flex-none"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reabrir
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ---- TRILHA COMPLETA ---------------------------------------- */}
      <section className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6">
        <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Funil completo
        </h3>

        <div className="space-y-6">
          {LADOS.map((lado) => {
            const doLado = ETAPAS.filter((e) => e.lado === lado)
            const feitasNoLado = doLado.filter((e) => concluidas.has(e.id)).length

            return (
              <div key={lado}>
                <div className="mb-2.5 flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-white/80">
                    {ROTULO_LADO[lado]}
                  </span>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {feitasNoLado}/{doLado.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {doLado.map((etapa) => {
                    const indice = ETAPAS.indexOf(etapa)
                    const st = estado(etapa, indice)
                    const Icone = etapa.icone

                    return (
                      <div
                        key={etapa.id}
                        className={cn(
                          'group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200',
                          st === 'atual'
                            ? 'border-primary/50 bg-primary/[0.07]'
                            : 'border-transparent hover:border-border/60 hover:bg-white/[0.03]'
                        )}
                      >
                        {/* Caixa de marcar — ação independente de navegar */}
                        <button
                          type="button"
                          onClick={() => alternar(etapa.id)}
                          aria-label={
                            st === 'concluida'
                              ? `Reabrir ${etapa.label}`
                              : `Marcar ${etapa.label} como concluída`
                          }
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                            st === 'concluida'
                              ? 'border-primary bg-primary'
                              : 'border-border hover:border-primary/60'
                          )}
                        >
                          {st === 'concluida' && (
                            <Check className="selo-ok h-3 w-3 text-primary-foreground" />
                          )}
                        </button>

                        {/* Selecionar a etapa para ver em foco */}
                        <button
                          type="button"
                          onClick={() =>
                            setProgresso((p) => ({ ...p, atual: etapa.id }))
                          }
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <span
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105',
                              st === 'atual' && 'pulso-atual'
                            )}
                            style={{
                              backgroundColor:
                                st === 'pendente'
                                  ? 'rgb(255 255 255 / 0.06)'
                                  : etapa.cor,
                            }}
                          >
                            <Icone
                              className={cn(
                                'h-3.5 w-3.5',
                                st === 'pendente'
                                  ? 'text-muted-foreground'
                                  : 'text-white'
                              )}
                            />
                          </span>

                          <span
                            className={cn(
                              'truncate text-sm transition-colors',
                              st === 'concluida' && 'text-muted-foreground',
                              st === 'atual' && 'font-semibold text-white',
                              st === 'pendente' &&
                                'text-muted-foreground group-hover:text-white/90'
                            )}
                          >
                            {etapa.label}
                          </span>

                          {st === 'atual' && (
                            <span className="ml-auto shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                              VOCÊ ESTÁ AQUI
                            </span>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Prévia: seu progresso fica salvo neste navegador. Ao publicar,
        passamos a guardá-lo na sua conta.
      </p>
    </div>
  )
}
