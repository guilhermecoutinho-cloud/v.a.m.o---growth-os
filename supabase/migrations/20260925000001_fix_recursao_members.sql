-- ============================================================
-- Corrige recursao infinita em organization_members
-- ------------------------------------------------------------
-- A policy de select chamava is_member(), que por sua vez consulta
-- organization_members — a tabela que a propria policy protege. O
-- Postgres devolvia 42P17 (infinite recursion) e a consulta de
-- organizations falhava com 500 para qualquer aluno.
--
-- E o mesmo defeito que "Admins can view all profiles" tinha em
-- profiles: uma policy que pergunta a tabela protegida sobre ela
-- mesma. A saida e a mesma: uma funcao SECURITY DEFINER, que roda
-- fora do RLS e por isso nao reentra na policy.
-- ============================================================

-- Responde "de quais organizacoes este usuario e membro?" sem passar
-- pelo RLS, quebrando o ciclo.
create or replace function public.minhas_organizacoes()
returns setof uuid as $$
  select om.organization_id
  from public.organization_members om
  where om.user_id = auth.uid()
  union
  select ma.organization_id
  from public.mentor_assignments ma
  where ma.mentor_id = auth.uid();
$$ language sql security definer stable set search_path = public;

revoke execute on function public.minhas_organizacoes() from public;
grant execute on function public.minhas_organizacoes() to authenticated;


-- A policy passa a comparar com o resultado da funcao, em vez de
-- consultar a tabela de dentro da propria policy.
drop policy if exists "members_view" on organization_members;
create policy "members_view" on organization_members for select
  using (
    public.is_admin()
    or user_id = auth.uid()
    or organization_id in (select public.minhas_organizacoes())
  );


-- mentor_assignments tem o mesmo risco: a policy antiga chamava
-- is_member(), que consulta mentor_assignments.
drop policy if exists "mentors_view" on mentor_assignments;
create policy "mentors_view" on mentor_assignments for select
  using (
    public.is_admin()
    or mentor_id = auth.uid()
    or organization_id in (select public.minhas_organizacoes())
  );


-- is_member() e can_write() continuam validas para as demais tabelas:
-- elas consultam organization_members a partir de OUTRA tabela, sem
-- ciclo. So as policies da propria organization_members precisavam
-- da funcao nova.
