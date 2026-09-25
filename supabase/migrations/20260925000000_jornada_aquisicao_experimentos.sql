-- ============================================================
-- Jornada qualitativa, Aquisição por canal e Experimentos
-- ============================================================

do $$ begin
  create type canal_aquisicao as enum (
    'meta_ads', 'google_ads', 'organico', 'indicacao', 'outbound', 'outro'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_experimento as enum (
    'planejado', 'em_andamento', 'concluido', 'cancelado'
  );
exception when duplicate_object then null; end $$;


-- ---------- 1. Jornada da empresa (qualitativo) --------------
-- Complementa os números do Funil Atual: aqui fica COMO cada etapa
-- acontece hoje na operação real, não quanto ela produz.

create table if not exists journey_stages (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  stage_id text not null,              -- mercado, atencao, demanda, lead...
  como_acontece text,
  canal text,
  responsavel text,
  indicador text,
  updated_at timestamptz default now() not null,
  unique (organization_id, stage_id)
);

create index if not exists idx_journey_org on journey_stages(organization_id);


-- ---------- 2. Aquisição por canal ---------------------------
-- O Funil Atual sabe quantos leads entraram, mas não de onde vieram
-- nem quanto custaram. Sem isso não dá para decidir onde investir.

create table if not exists acquisition_channels (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  period date not null,                -- 1º dia do mês, como o snapshot
  channel canal_aquisicao not null,
  channel_other text,                  -- preenchido quando channel = 'outro'
  investment numeric,
  reach int,                           -- alcance ou impressões
  leads int,
  sales int,                           -- vendas atribuídas ao canal
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (organization_id, period, channel, channel_other)
);

create index if not exists idx_acquisition_org
  on acquisition_channels(organization_id, period desc);

-- CPL e CAC são derivados, não gravados: assim nunca divergem da
-- verba e do volume que os originaram.


-- ---------- 3. Experimentos ----------------------------------
-- Fecham o ciclo: Testar -> Medir -> Aprender.

create table if not exists experiments (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  hypothesis_id uuid references hypotheses(id) on delete set null,
  title text not null,
  kpi text not null,                   -- o número que decide o resultado
  baseline numeric,
  target numeric,
  result numeric,
  starts_on date,
  ends_on date,
  owner_name text,
  status status_experimento default 'planejado' not null,
  learning text,                       -- o que ficou aprendido
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_experiments_org
  on experiments(organization_id, status);


-- ---------- 4. RLS -------------------------------------------

alter table journey_stages       enable row level security;
alter table acquisition_channels enable row level security;
alter table experiments          enable row level security;

do $$
declare t text;
begin
  foreach t in array array['journey_stages', 'acquisition_channels', 'experiments'] loop
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


-- ---------- 5. updated_at automatico -------------------------

drop trigger if exists trg_journey_touch on journey_stages;
create trigger trg_journey_touch before update on journey_stages
  for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_acquisition_touch on acquisition_channels;
create trigger trg_acquisition_touch before update on acquisition_channels
  for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_experiments_touch on experiments;
create trigger trg_experiments_touch before update on experiments
  for each row execute procedure public.touch_updated_at();
