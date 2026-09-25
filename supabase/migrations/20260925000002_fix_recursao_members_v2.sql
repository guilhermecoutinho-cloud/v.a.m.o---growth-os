-- ============================================================
-- Recursao em organization_members — correcao definitiva
-- ------------------------------------------------------------
-- A tentativa anterior (20260925000001) nao bastou. O ciclo real e:
--
--   consulta organizations
--     -> policy org_view chama is_member(id)
--        -> is_member le organization_members
--           -> as policies de organization_members sao avaliadas
--              -> members_view consultava organization_members de novo
--
-- Ter a funcao como SECURITY DEFINER nao resolve sozinho: o
-- "in (select ...)" DENTRO da policy ainda reavalia a tabela.
--
-- A saida e nenhuma policy de organization_members consultar
-- organization_members. Todas passam a comparar apenas colunas da
-- propria linha (user_id) ou chamar is_admin(), que le profiles —
-- outra tabela, sem ciclo.
-- ============================================================

-- Limpa tudo que existe hoje na tabela.
drop policy if exists "members_view"          on organization_members;
drop policy if exists "members_admin_write"   on organization_members;
drop policy if exists "Members view org members" on organization_members;

-- SELECT: a pessoa ve as proprias linhas; o admin ve todas.
-- Sem subconsulta na tabela, o ciclo desaparece.
create policy "members_select" on organization_members for select
  using (user_id = auth.uid() or public.is_admin());

-- Escrita continua restrita ao admin.
create policy "members_insert" on organization_members for insert
  with check (public.is_admin());
create policy "members_update" on organization_members for update
  using (public.is_admin());
create policy "members_delete" on organization_members for delete
  using (public.is_admin());


-- mentor_assignments: mesmo cuidado.
drop policy if exists "mentors_view"        on mentor_assignments;
drop policy if exists "mentors_admin_write" on mentor_assignments;

create policy "mentors_select" on mentor_assignments for select
  using (mentor_id = auth.uid() or public.is_admin());

create policy "mentors_insert" on mentor_assignments for insert
  with check (public.is_admin());
create policy "mentors_update" on mentor_assignments for update
  using (public.is_admin());
create policy "mentors_delete" on mentor_assignments for delete
  using (public.is_admin());


-- is_member() e can_write() seguem intactas e continuam corretas para
-- as demais tabelas: la a leitura de organization_members parte de
-- OUTRA tabela, e agora as policies dela nao reentram em si mesmas.
--
-- Efeito colateral aceito: um membro deixa de enxergar os colegas de
-- empresa na listagem de organization_members. Nenhuma tela depende
-- disso — a de Acessos usa a service_role, que ignora o RLS.

drop function if exists public.minhas_organizacoes();
