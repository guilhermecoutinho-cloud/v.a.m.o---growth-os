'use client'

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)

export type PontoReceita = { name: string; receita: number }

/**
 * Isolado num arquivo proprio porque o Recharts pesa ~366 KB — o maior
 * pedaco do bundle. Assim ele carrega sob demanda (ver dynamic() no
 * dashboard) em vez de bloquear a primeira renderizacao da pagina.
 */
export default function GraficoReceita({ data }: { data: PontoReceita[] }) {
  return (
    <div className="mt-4 h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D68F" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00D68F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke="#8C9690"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#8C9690"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#101513',
              borderColor: '#232c27',
              borderRadius: '8px',
              color: '#fff',
            }}
            itemStyle={{ color: '#00D68F' }}
            formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Receita']}
          />
          <Area
            type="monotone"
            dataKey="receita"
            stroke="#00D68F"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorReceita)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
