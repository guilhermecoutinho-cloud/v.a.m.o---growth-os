'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity } from 'lucide-react'

/**
 * Separado do dashboard para que a pagina continue sendo um Server
 * Component: so este botao e o dialogo viajam para o browser.
 */
export function NovoDiagnostico() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className="bg-primary font-semibold text-primary-foreground shadow-[0_0_15px_rgba(72,209,122,0.3)] transition-all hover:bg-primary/90" />
        }
      >
        <Activity className="mr-2 h-4 w-4" />
        Novo Diagnóstico
      </DialogTrigger>

      <DialogContent className="border-border/50 bg-card text-white shadow-2xl sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Iniciar Novo Diagnóstico</DialogTitle>
          <DialogDescription className="mt-2 text-muted-foreground">
            Vamos identificar os maiores gargalos da sua máquina. Preencha os
            dados básicos para a IA iniciar a análise.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">Site ou Landing Page da sua empresa</Label>
            <Input
              id="url"
              placeholder="https://suaempresa.com.br"
              className="border-white/10 bg-background/50 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desafio">Qual seu maior gargalo hoje?</Label>
            <select
              id="desafio"
              className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <option value="leads" className="bg-card text-white">
                Gerar mais Leads (Topo de Funil)
              </option>
              <option value="vendas" className="bg-card text-white">
                Converter Leads em Vendas (Fundo de Funil)
              </option>
              <option value="retencao" className="bg-card text-white">
                Reter clientes e evitar Churn (Pós-venda)
              </option>
              <option value="dados" className="bg-card text-white">
                Não tenho clareza dos meus números
              </option>
            </select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose
            render={
              <Button
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10"
              />
            }
          >
            Cancelar
          </DialogClose>
          <Button
            type="submit"
            className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
          >
            Iniciar Análise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
