-- ============================================================
-- V.A.M.O. Growth OS — modelo central
-- ------------------------------------------------------------
-- As tabelas funnels, leads e revenue_scenarios do commit inicial
-- estavam vazias e conflitavam com este modelo (funnels cumpria o
-- papel de metric_snapshots; leads e revenue_scenarios tinham outras
-- colunas). Sao recriadas aqui.
-- ============================================================

-- ---------- 1. Papeis e tipos --------------------------------

do $$ begin
  create type business_model as enum ('recorrente', 'transacional');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lever as enum (
    'demanda', 'qualificacao', 'conversao', 'ticket',
    'frequencia', 'retencao', 'indicacao'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type funnel_node as enum (
    'aquisicao', 'lead_mql', 'mql_opp', 'opp_sale', 'ticket', 'retencao'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type investigation_status as enum ('aberta', 'em_hipotese', 'descartada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hypothesis_status as enum (
    'rascunho', 'a_testar', 'em_teste', 'validada', 'refutada', 'inconclusiva'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type step_status as enum ('bloqueada', 'disponivel', 'concluida');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_stage as enum (
    'novo', 'contatado', 'qualificado', 'reuniao_agendada', 'reuniao_realizada',
    'oferta_vamo', 'follow_up', 'vendido', 'perdido', 'outro_produto'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type lost_reason as enum (
    'preco', 'timing', 'sem_prioridade', 'sem_fit', 'sem_decisao',
    'socio', 'concorrencia', 'sem_caixa', 'nao_respondeu', 'outro_produto'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type recommended_product as enum ('vamo', 'estruturacao', 'gaas');
exception when duplicate_object then null; end $$;


-- ---------- 2. Descarta o que foi substituido ----------------
-- Todas estavam vazias (verificado antes da migration).

drop table if exists funnels cascade;
drop table if exists revenue_scenarios cascade;
drop table if exists leads cascade;


-- ---------- 3. Empresas e pessoas ----------------------------

alter table organizations
  add column if not exists business_model business_model default 'transacional';

create table if not exists mentor_assignments (
  organization_id uuid references organizations(id) on delete cascade not null,
  mentor_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (organization_id, mentor_id)
);

-- organization_members ja existe; garante a coluna de papel na empresa
alter table organization_members
  add column if not exists member_role text default 'member';


-- ---------- 4. Meta de receita -------------------------------

create table if not exists revenue_goals (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  period_type text default 'mensal' not null,
  target_revenue numeric not null,
  valid_from date default current_date not null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

create index if not exists idx_revenue_goals_org on revenue_goals(organization_id, valid_from desc);


-- ---------- 5. Fotografia mensal (fonte unica de verdade) ----

create table if not exists metric_snapshots (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  period date not null,                    -- sempre o 1o dia do mes
  investment numeric,
  leads int,
  mqls int,
  opportunities int,
  sales int,
  avg_ticket numeric,
  revenue numeric,
  active_customers int,
  repurchase_rate numeric,
  churn_rate numeric,
  referral_rate numeric,
  unknown_fields text[] default '{}' not null,   -- campos marcados "Nao sei"
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (organization_id, period)
);

create index if not exists idx_snapshots_org_period
  on metric_snapshots(organization_id, period desc);


-- ---------- 6. Cenarios da Arquitetura de Receita ------------

create table if not exists revenue_scenarios (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  name text not null,                      -- 'atual' | 'meta' | 'otimizado'
  target_revenue numeric,
  avg_ticket numeric,
  cpl numeric,
  rate_lead_mql numeric,
  rate_mql_opp numeric,
  rate_opp_sale numeric,
  updated_at timestamptz default now() not null,
  unique (organization_id, name)
);


-- ---------- 7. Biblioteca de possiveis causas ----------------

create table if not exists hypothesis_library (
  id uuid primary key default uuid_generate_v4(),
  node funnel_node not null,
  lever lever not null,
  cause_title text not null,
  how_to_check text not null,
  confirming_data text not null,
  hypothesis_template text not null,       -- SE/ENTAO/PORQUE com {placeholders}
  possible_experiment text not null,
  sort_order int default 0 not null,
  active boolean default true not null
);

create index if not exists idx_library_node on hypothesis_library(node, sort_order);


-- ---------- 8. Investigacoes e hipoteses ---------------------

create table if not exists investigations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  snapshot_id uuid references metric_snapshots(id) on delete cascade,
  node funnel_node not null,
  current_rate numeric,
  target_rate numeric,
  potential_revenue_impact numeric,
  status investigation_status default 'aberta' not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_investigations_org
  on investigations(organization_id, status, potential_revenue_impact desc);

create table if not exists hypotheses (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade not null,
  investigation_id uuid references investigations(id) on delete set null,
  library_item_id uuid references hypothesis_library(id) on delete set null,
  node funnel_node not null,
  lever lever not null,
  if_action text not null,
  then_result text not null,
  because_evidence text not null,
  status hypothesis_status default 'rascunho' not null,
  priority int default 0 not null,
  snapshot_context jsonb,                  -- foto dos numeros na criacao
  discard_reason text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_hypotheses_org on hypotheses(organization_id, status);


-- ---------- 9. Jornada do aluno no programa ------------------

create table if not exists program_steps (
  id int primary key,
  step_order int not null,
  title text not null,
  format text not null,                    -- gravada | ao_vivo | presencial
  theme text not null,
  outcome text,
  deliverable text,
  tool_route text
);

create table if not exists program_progress (
  organization_id uuid references organizations(id) on delete cascade not null,
  step_id int references program_steps(id) on delete cascade not null,
  status step_status default 'disponivel' not null,
  completed_at timestamptz,
  primary key (organization_id, step_id)
);


-- ---------- 10. Modo Comercial -------------------------------

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) on delete set null,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  segment text,
  stage lead_stage default 'novo' not null,
  lost_reason lost_reason,
  organization_id uuid references organizations(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_leads_owner on leads(owner_id, stage);

create table if not exists sales_diagnostics (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) on delete cascade not null,
  current_revenue numeric,
  target_revenue numeric,
  snapshot_json jsonb,
  lead_opinion_opportunity text,
  evidence_answer text,
  recommended_product recommended_product,
  summary_text text,
  created_at timestamptz default now() not null
);


-- ---------- 11. Configuracoes (pisos de referencia) ----------

create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now() not null
);

insert into settings (key, value) values
  ('benchmarks', '{"lead_mql": 20, "mql_opp": 20, "opp_sale": 15}'::jsonb)
on conflict (key) do nothing;


-- ---------- 12. updated_at automatico ------------------------

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_snapshots_touch on metric_snapshots;
create trigger trg_snapshots_touch before update on metric_snapshots
  for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_hypotheses_touch on hypotheses;
create trigger trg_hypotheses_touch before update on hypotheses
  for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_leads_touch on leads;
create trigger trg_leads_touch before update on leads
  for each row execute procedure public.touch_updated_at();
