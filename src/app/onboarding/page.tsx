'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card">
        {step === 1 && (
          <>
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-4xl font-bold tracking-tight text-primary">BEM-VINDO AO V.A.M.O.</CardTitle>
              <CardDescription className="text-lg text-foreground">
                Antes de tentar crescer, precisamos entender como sua empresa cresce hoje.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pt-8">
              <Button onClick={() => setStep(2)} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg">
                Iniciar Onboarding
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Dados da Empresa</CardTitle>
              <CardDescription>Confirme ou preencha as informações básicas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome</Label><Input className="bg-input" /></div>
                <div className="space-y-2"><Label>Segmento</Label><Input className="bg-input" /></div>
                <div className="space-y-2"><Label>Cidade</Label><Input className="bg-input" /></div>
                <div className="space-y-2"><Label>Estado</Label><Input className="bg-input" /></div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setStep(3)}>Próxima Etapa</Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Operação Atual</CardTitle>
              <CardDescription>Revise os números do seu funil (coletados no diagnóstico).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Leads/mês</Label><Input type="number" className="bg-input" /></div>
                <div className="space-y-2"><Label>Oportunidades</Label><Input type="number" className="bg-input" /></div>
                <div className="space-y-2"><Label>Vendas</Label><Input type="number" className="bg-input" /></div>
              </div>
              <div className="pt-4 flex items-center justify-between text-sm text-muted-foreground bg-muted p-4 rounded-md border border-border">
                <span>Não tem algum número exato?</span>
                <Button variant="outline" size="sm">Marcar &ldquo;NÃO SEI&rdquo;</Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Voltar</Button>
              <Button onClick={() => window.location.href = '/dashboard'}>Acessar meu Dashboard</Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
