# Instalação do banco

Dois arquivos, nesta ordem, no **SQL Editor** do Supabase.

## 1. `00_aplicar_tudo.sql`

Cole o arquivo inteiro e clique em **Run**. São as 5 migrations de
`supabase/migrations/` concatenadas na ordem correta.

Rodar duas vezes não causa dano: tudo usa `if not exists`, `on conflict`
ou `or replace`.

> **Antes de rodar:** a primeira parte executa
> `drop table if exists funnels, revenue_scenarios, leads cascade`.
> São as três tabelas do commit inicial, que estavam vazias e conflitavam
> com o modelo novo. Se você gravou algo nelas desde então, faça backup.

## 2. `01_verificar.sql`

Cole e rode. Cada linha do resultado deve dizer **OK**:

| item | esperado |
|---|---|
| tabelas | 15 de 15 |
| RLS ligado | 0 tabelas sem RLS |
| funções de RLS | 4 de 4 |
| etapas do programa | 9 de 9 |
| biblioteca de causas | 25 de 25 |
| pisos de referência | 1 registro |
| tabela funnels removida | sim |

Ao final ele também lista quem já tem acesso e quantas causas existem por
nó do funil.

## Depois

Com o banco pronto, o app ainda precisa das variáveis de ambiente na
Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
`SUPABASE_SERVICE_ROLE_KEY`) e de um **Redeploy** — variável nova não
entra em deploy já construído.

Em **Authentication → URL Configuration**, vale apontar o *Site URL* para
o domínio real e incluir `SEU-DOMINIO/auth/callback` em *Redirect URLs*:
sem isso o Supabase manda os links de convite para o Site URL antigo, com
a sessão no fragmento da URL.

## Estes arquivos são gerados

A fonte continua sendo `supabase/migrations/`. Ao criar uma migration
nova, regenere o arquivo único concatenando-as na ordem dos nomes.
