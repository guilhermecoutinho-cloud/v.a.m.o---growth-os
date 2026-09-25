-- ============================================================
-- RLS do Growth OS
-- ------------------------------------------------------------
-- Todas as funcoes sao SECURITY DEFINER: elas rodam fora do RLS.
-- Sem isso, uma policy que consulta a propria tabela protegida
-- entra em recursao ou e filtrada por si mesma — foi o que
-- aconteceu antes com "Admins can view all profiles".
-- ============================================================

-- ---------- Funcoes auxiliares -------------------------------

-- Papel do usuario logado, lido de profiles.
create or replace function public.current_role_name()
returns text as $$
  select role::text from public.profiles where id = auth.uid();
$$ language sql security definer stable set search_path = public;

create or replace function public.has_role(wanted text)
returns boolean as $$
  select public.current_role_name() = wanted;
$$ language sql security definer stable set search_path = public;

-- O usuario enxerga a organizacao? admin ve tudo; mentor ve as
-- atribuidas; demais veem aquelas de que sao membros.
create or replace function public.is_member(org_id uuid)
returns boolean as $$
  select
    public.is_admin()
    or exists (
      select 1 from public.organization_members om
      where om.organization_id = org_id and om.user_id = auth.uid()
    )
    or exists (
      select 1 from public.mentor_assignments ma
      where ma.organization_id = org_id and ma.mentor_id = auth.uid()
    );
$$ language sql security definer stable set search_path = public;

-- Escrita: admin e membros podem gravar. Mentor acompanha, nao edita.
create or replace function public.can_write(org_id uuid)
returns boolean as $$
  select
    public.is_admin()
    or exists (
      select 1 from public.organization_members om
      where om.organization_id = org_id and om.user_id = auth.uid()
    );
$$ language sql security definer stable set search_path = public;

revoke execute on function public.current_role_name(), public.has_role(text),
  public.is_member(uuid), public.can_write(uuid) from public;
grant execute on function public.current_role_name(), public.has_role(text),
  public.is_member(uuid), public.can_write(uuid) to authenticated;


-- ---------- Liga o RLS ---------------------------------------

alter table mentor_assignments  enable row level security;
alter table revenue_goals       enable row level security;
alter table metric_snapshots    enable row level security;
alter table revenue_scenarios   enable row level security;
alter table hypothesis_library  enable row level security;
alter table investigations      enable row level security;
alter table hypotheses          enable row level security;
alter table program_steps       enable row level security;
alter table program_progress    enable row level security;
alter table leads               enable row level security;
alter table sales_diagnostics   enable row level security;
alter table settings            enable row level security;


-- ---------- Dados por organizacao ----------------------------
-- Mesmo desenho para as cinco tabelas: ler quem enxerga a empresa,
-- escrever quem e membro ou admin.

do $$
declare t text;
begin
  foreach t in array array[
    'revenue_goals', 'metric_snapshots', 'revenue_scenarios',
    'investigations', 'hypotheses', 'program_progress'
  ] loop
    execute format('drop policy if exists "org_select" on %I', t);
    execute format(
      'create policy "org_select" on %I for select using (public.is_member(organization_id))', t);

    execute format('drop policy if exists "org_insert" on %I', t);
    execute format(
      'create policy "org_insert" on %I for insert with check (public.can_write(organization_id))', t);

    execute format('drop policy if exists "org_update" on %I', t);
    execute format(
      'create policy "org_update" on %I for update using (public.can_write(organization_id))', t);

    execute format('drop policy if exists "org_delete" on %I', t);
    execute format(
      'create policy "org_delete" on %I for delete using (public.can_write(organization_id))', t);
  end loop;
end $$;


-- ---------- Organizacoes -------------------------------------

drop policy if exists "Members can view orgs" on organizations;
create policy "org_view" on organizations for select
  using (public.is_member(id));

drop policy if exists "org_admin_write" on organizations;
create policy "org_admin_write" on organizations for all
  using (public.is_admin()) with check (public.is_admin());


-- ---------- Vinculos -----------------------------------------

drop policy if exists "Members view org members" on organization_members;
create policy "members_view" on organization_members for select
  using (public.is_member(organization_id));

drop policy if exists "members_admin_write" on organization_members;
create policy "members_admin_write" on organization_members for all
  using (public.is_admin()) with check (public.is_admin());

create policy "mentors_view" on mentor_assignments for select
  using (public.is_member(organization_id) or mentor_id = auth.uid());

create policy "mentors_admin_write" on mentor_assignments for all
  using (public.is_admin()) with check (public.is_admin());


-- ---------- Conteudo comum a todos ---------------------------
-- Biblioteca de causas e etapas do programa: qualquer autenticado le,
-- so o admin edita.

create policy "library_read" on hypothesis_library for select
  to authenticated using (active);
create policy "library_admin" on hypothesis_library for all
  using (public.is_admin()) with check (public.is_admin());

create policy "steps_read" on program_steps for select
  to authenticated using (true);
create policy "steps_admin" on program_steps for all
  using (public.is_admin()) with check (public.is_admin());

create policy "settings_read" on settings for select
  to authenticated using (true);
create policy "settings_admin" on settings for all
  using (public.is_admin()) with check (public.is_admin());


-- ---------- Modo Comercial -----------------------------------
-- O vendedor so alcanca os proprios leads.

create policy "leads_select" on leads for select
  using (owner_id = auth.uid() or public.is_admin());
create policy "leads_insert" on leads for insert
  with check (owner_id = auth.uid() or public.is_admin());
create policy "leads_update" on leads for update
  using (owner_id = auth.uid() or public.is_admin());
create policy "leads_delete" on leads for delete
  using (owner_id = auth.uid() or public.is_admin());

create policy "diag_select" on sales_diagnostics for select
  using (exists (
    select 1 from leads l
    where l.id = lead_id and (l.owner_id = auth.uid() or public.is_admin())
  ));
create policy "diag_write" on sales_diagnostics for all
  using (exists (
    select 1 from leads l
    where l.id = lead_id and (l.owner_id = auth.uid() or public.is_admin())
  ))
  with check (exists (
    select 1 from leads l
    where l.id = lead_id and (l.owner_id = auth.uid() or public.is_admin())
  ));
