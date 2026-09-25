-- ============================================================
-- Recursao em organization_members — v3, removendo por varredura
-- ------------------------------------------------------------
-- As duas tentativas anteriores davam "drop policy if exists" por
-- nome. O teste mostrou que mentor_assignments ficou saudavel e
-- organization_members continuou recursando: sobrou naquela tabela
-- alguma policy com nome que eu nao previ.
--
-- Em vez de adivinhar nomes, esta migration apaga TODAS as policies
-- da tabela por varredura do catalogo e recria as quatro corretas.
-- ============================================================

do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'organization_members'
  loop
    execute format('drop policy %I on public.organization_members', p.policyname);
  end loop;
end $$;

-- Nenhuma destas consulta organization_members: comparam colunas da
-- propria linha ou chamam is_admin(), que le profiles.
create policy "members_select" on organization_members for select
  using (user_id = auth.uid() or public.is_admin());

create policy "members_insert" on organization_members for insert
  with check (public.is_admin());

create policy "members_update" on organization_members for update
  using (public.is_admin());

create policy "members_delete" on organization_members for delete
  using (public.is_admin());


-- Mesma varredura em mentor_assignments, por seguranca.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'mentor_assignments'
  loop
    execute format('drop policy %I on public.mentor_assignments', p.policyname);
  end loop;
end $$;

create policy "mentors_select" on mentor_assignments for select
  using (mentor_id = auth.uid() or public.is_admin());

create policy "mentors_insert" on mentor_assignments for insert
  with check (public.is_admin());

create policy "mentors_update" on mentor_assignments for update
  using (public.is_admin());

create policy "mentors_delete" on mentor_assignments for delete
  using (public.is_admin());


-- ------------------------------------------------------------
-- Confere o resultado: nenhuma condicao pode citar a propria tabela.
-- ------------------------------------------------------------
select
  tablename as tabela,
  policyname as policy,
  cmd as comando,
  case
    when coalesce(qual::text, '') || coalesce(with_check::text, '')
         like '%organization_members%'
      then 'CICLO — revisar'
    else 'ok'
  end as situacao
from pg_policies
where schemaname = 'public'
  and tablename in ('organization_members', 'mentor_assignments')
order by tablename, policyname;
