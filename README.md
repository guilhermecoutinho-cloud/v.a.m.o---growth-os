# V.A.M.O. — Growth OS

Área de membros com acesso liberado manualmente após a compra.
Next.js 16 + Supabase (Auth e Postgres com RLS).

## Como o acesso funciona

Não existe cadastro aberto para o comprador. O fluxo é:

1. A venda acontece.
2. Um administrador entra em `/dashboard/usuarios`, digita o e-mail e a senha
   e clica em **Criar acesso**.
3. O botão **Copiar mensagem pronta** monta o texto com e-mail, senha e link.
4. O comprador entra direto em `/login` — a conta já nasce confirmada, sem
   e-mail de verificação.

Se o comprador esquecer a senha, o admin gera outra em **Nova senha** e
reenvia. Não há recuperação por e-mail.

## Papéis

| Papel | Acesso |
|---|---|
| `admin` | Tudo, incluindo criar e revogar acessos |
| `mentor` | Dashboard |
| `sales` | Dashboard e diagnósticos |
| `student` | Dashboard (padrão de quem compra) |

Um usuário não consegue mudar o próprio papel: um trigger no banco bloqueia,
e o papel vem de `app_metadata`, que só o servidor escreve.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do seu Supabase
npm run dev
```

O `.env.local` precisa estar em **UTF-8**. No PowerShell, use
`-Encoding utf8` ao criá-lo — um arquivo em UTF-16 faz o Next.js ler os nomes
das variáveis com lixo e a conexão falha sem erro claro.

## Banco de dados

Aplique as migrations de `supabase/migrations/` em ordem, pelo SQL Editor do
Supabase. Elas criam as tabelas, ligam o RLS e definem o trigger que cria o
perfil de cada usuário novo.

Em **Authentication → Providers → Email**, deixe *Confirm email* desligado:
as contas são criadas já confirmadas pelo painel de admin, e o comprador não
recebe e-mail nenhum.

## Deploy na Vercel

Importe o repositório e defina as três variáveis de ambiente em
**Settings → Environment Variables** (os mesmos nomes do `.env.example`).
A `SUPABASE_SERVICE_ROLE_KEY` é secreta: sem ela a tela de acessos não
funciona, e exposta ela dá controle total do banco.

Depois do primeiro deploy, adicione a URL do site em
**Supabase → Authentication → URL Configuration → Site URL**.

## Estrutura

```
src/
  app/
    login/                    entrada (sem cadastro público)
    dashboard/
      usuarios/               painel de acessos — somente admin
  lib/supabase/
    client.ts                 browser
    server.ts                 server components e actions
    admin.ts                  service_role — nunca no browser
  middleware.ts               protege /dashboard, /sales, /onboarding
supabase/migrations/          schema, RLS e triggers
```
