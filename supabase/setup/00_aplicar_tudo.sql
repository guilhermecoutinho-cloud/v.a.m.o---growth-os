-- ============================================================================
-- V.A.M.O. GROWTH OS — INSTALACAO COMPLETA
-- ============================================================================
--
-- COMO USAR
--   1. Abra o SQL Editor do seu projeto no Supabase
--   2. Cole este arquivo inteiro
--   3. Clique em Run
--
-- Sao as 5 migrations na ordem correta, num arquivo so. Rodar duas vezes
-- nao causa dano: tudo usa "if not exists", "on conflict" ou "or replace".
--
-- ATENCAO — a parte 1 executa:
--
--     drop table if exists funnels, revenue_scenarios, leads cascade;
--
--   Sao as tres tabelas do commit inicial, que estavam VAZIAS e conflitavam
--   com o modelo novo (funnels cumpria o papel de metric_snapshots; leads e
--   revenue_scenarios tinham outras colunas). Se voce gravou algo nelas
--   desde entao, faca backup antes de rodar.
--
-- O QUE ISTO CRIA
--   metric_snapshots ...... a fotografia mensal da maquina (fonte de verdade)
--   revenue_goals ......... meta mensal de receita
--   revenue_scenarios ..... cenarios atual / meta / otimizado
--   hypothesis_library .... 22 possiveis causas, prontas para uso
--   investigations ........ pontos sinalizados para investigar
--   hypotheses ............ hipoteses SE/ENTAO/PORQUE do aluno
--   program_steps ......... as 9 etapas do programa
--   program_progress ...... o avanco de cada empresa no programa
--   journey_stages ........ como cada etapa acontece hoje (qualitativo)
--   acquisition_channels .. verba, leads e vendas por canal
--   experiments ........... testes que fecham o ciclo
--   leads / sales_diagnostics ... modo comercial
--   settings .............. pisos de referencia, editaveis
--
--   Mais RLS em todas elas, os seeds e os triggers de updated_at.
--
-- DEPOIS DE RODAR
--   Confira o resultado com:  supabase/setup/01_verificar.sql
--
-- ============================================================================




-- ############################################################################
-- PARTE: growth os core
-- ############################################################################

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


-- ############################################################################
-- PARTE: growth os rls
-- ############################################################################

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


-- ############################################################################
-- PARTE: seed program steps
-- ############################################################################

-- ============================================================
-- Seed: as 9 etapas do programa V.A.M.O.
-- ============================================================

insert into program_steps (id, step_order, title, format, theme, outcome, deliverable, tool_route) values
(1, 1, 'Mentalidade de Crescimento', 'gravada', 'Mentalidade',
 'Aprender a pensar crescimento e diagnosticar antes de agir',
 'Primeira máquina + primeira hipótese', '/dashboard/funil'),

(2, 2, 'Diagnóstico da Máquina', 'ao_vivo', 'Diagnóstico da Máquina',
 'Mapear funil, indicadores, lacunas e primeira hipótese',
 'Mapa Atual da Máquina', '/dashboard/funil'),

(3, 3, 'Alcance', 'gravada', 'Alcance',
 'Aprender a gerar demanda qualificada', null, null),

(4, 4, 'Laboratório de Aquisição', 'ao_vivo', 'Laboratório de Aquisição',
 'ICP, oferta, canais e funil de aquisição',
 'Mapa de Aquisição V.A.M.O.', null),

(5, 5, 'Vendas', 'gravada', 'Vendas',
 'Transformar demanda em receita', null, null),

(6, 6, 'Laboratório Comercial', 'ao_vivo', 'Laboratório Comercial',
 'Funil comercial e funil reverso',
 'Funil Reverso V.A.M.O.', '/dashboard/arquitetura'),

(7, 7, 'Otimização', 'gravada', 'Otimização',
 'Encontrar nós e ativar alavancas', null, '/dashboard/hipoteses'),

(8, 8, 'Plano V.A.M.O. 90 dias', 'ao_vivo', 'Plano de 90 dias',
 'Priorizar hipóteses e construir o plano',
 'Plano de 90 dias', null),

(9, 9, 'Hot Seat', 'presencial', 'Hot Seat',
 'Diagnóstico, debate e decisão sobre empresas reais',
 'Decision Card', null)
on conflict (id) do update set
  step_order = excluded.step_order,
  title      = excluded.title,
  format     = excluded.format,
  theme      = excluded.theme,
  outcome    = excluded.outcome,
  deliverable= excluded.deliverable,
  tool_route = excluded.tool_route;


-- ############################################################################
-- PARTE: seed hypothesis library
-- ############################################################################

-- ============================================================
-- Seed: biblioteca curada de possiveis causas
-- ------------------------------------------------------------
-- Cada item diz ONDE olhar, nunca POR QUE algo acontece. O texto
-- vira hipotese so quando o aluno escolhe e edita. Placeholders
-- entre chaves sao trocados pelos numeros reais na interface.
-- O admin pode editar depois pela propria tabela.
-- ============================================================

delete from hypothesis_library;

insert into hypothesis_library
  (node, lever, cause_title, how_to_check, confirming_data, hypothesis_template, possible_experiment, sort_order)
values

-- ---------- aquisicao — Volume de leads / CPL ----------------
('aquisicao', 'demanda',
 'Investimento ou orçamento insuficiente para o volume necessário',
 'Compare o investimento atual com o investimento calculado na Arquitetura.',
 'Investimento atual vs. necessário; CPL atual.',
 'SE ajustarmos o investimento para R$ {investimento_necessario}, ENTÃO esperamos chegar a {leads_necessarios} leads, PORQUE o CPL atual de R$ {cpl} se mantém estável nessa faixa.',
 'Aumentar 20–30% o investimento no canal principal por 2 semanas e medir o CPL.', 1),

('aquisicao', 'demanda',
 'Mensagem/criativo não gera interesse (CTR baixo)',
 'CTR e CPC dos anúncios nos últimos 30 dias.',
 'CTR por criativo; comparação entre criativos.',
 'SE testarmos novos criativos focados na dor do ICP, ENTÃO esperamos aumentar o CTR e reduzir o CPL, PORQUE o CTR atual indica baixa aderência da mensagem.',
 'Teste A/B com 3 criativos por 7–14 dias.', 2),

('aquisicao', 'demanda',
 'Página de conversão perde o visitante',
 'Connect rate (carregamento) e taxa de conversão da landing page.',
 'Cliques vs. visitas vs. leads.',
 'SE melhorarmos a velocidade e a clareza da LP, ENTÃO esperamos aumentar a conversão visita→lead, PORQUE há perda relevante entre clique e lead.',
 'Nova versão da LP em teste A/B.', 3),

('aquisicao', 'demanda',
 'Dependência de um único canal',
 'De onde vieram os leads e as vendas dos últimos 3 meses.',
 'Leads e vendas por canal.',
 'SE testarmos um canal secundário (indicação, outbound, parceiros), ENTÃO esperamos ampliar a demanda qualificada, PORQUE hoje o canal principal concentra a maior parte do volume.',
 'Piloto de 30 dias em um canal secundário com meta de leads.', 4),

-- ---------- lead_mql — Lead → MQL ----------------------------
('lead_mql', 'qualificacao',
 'Critério de MQL não definido ou rígido demais',
 'Existe uma regra escrita do que é MQL? Quem classifica e quando?',
 'Amostra de 20 leads não qualificados. Tinham perfil?',
 'SE definirmos um critério objetivo de MQL (segmento, porte, decisor, necessidade), ENTÃO esperamos que a taxa Lead→MQL reflita o potencial real, PORQUE hoje a classificação depende de interpretação individual.',
 'Documentar o critério e reclassificar os leads do último mês.', 1),

('lead_mql', 'qualificacao',
 'Mídia atraindo público fora do ICP',
 'Segmentação das campanhas vs. ICP definido.',
 'Perfil (cargo, porte, segmento) dos leads por campanha.',
 'SE ajustarmos a segmentação para o ICP, ENTÃO esperamos aumentar a taxa Lead→MQL de {taxa_atual} para próximo de {taxa_meta}, PORQUE parte relevante dos leads vem de fora do perfil.',
 'Campanha com segmentação restrita ao ICP vs. campanha atual.', 2),

('lead_mql', 'qualificacao',
 'Oferta ou mensagem atrai curiosos',
 'A promessa do anúncio/LP filtra quem não é cliente? Há isca gratuita genérica?',
 'Taxa de MQL por oferta/isca.',
 'SE deixarmos a oferta mais específica para o problema do ICP, ENTÃO esperamos menos leads, porém mais qualificados, PORQUE a oferta atual é ampla demais.',
 'Testar uma versão da LP com a qualificação explícita ("para empresas que faturam acima de X").', 3),

('lead_mql', 'qualificacao',
 'Formulário sem perguntas de qualificação',
 'O formulário pergunta faturamento, cargo, segmento ou momento?',
 'Campos do formulário; % de leads sem informação para qualificar.',
 'SE incluirmos 2–3 perguntas de qualificação no formulário, ENTÃO esperamos classificar melhor os leads e priorizar o contato, PORQUE hoje não há informação suficiente para qualificar.',
 'Novo formulário com perguntas de qualificação por 2 semanas.', 4),

('lead_mql', 'qualificacao',
 'Leads não são contatados ou classificados',
 'Quantos leads do mês receberam contato? Qual o tempo até o primeiro contato?',
 '% de leads contatados; tempo médio de resposta.',
 'SE garantirmos contato em até 15 minutos, ENTÃO esperamos aumentar a taxa de contato e de MQL, PORQUE parte dos leads nunca chega a ser avaliada.',
 'SLA de primeiro contato de 15 minutos por 30 dias.', 5),

('lead_mql', 'qualificacao',
 'Problema de tracking (duplicados, spam, contagem errada)',
 'Leads duplicados, testes internos, spam, integração formulário→CRM.',
 'Auditoria de 50 leads do mês.',
 'SE limparmos o tracking e a integração, ENTÃO esperamos que o número de leads reflita a realidade, PORQUE a taxa pode estar distorcida por contagem incorreta.',
 'Auditoria de pixels, UTMs e integração com o CRM.', 6),

-- ---------- mql_opp — MQL → Oportunidade ---------------------
('mql_opp', 'conversao',
 'Demora ou falta de follow-up após a qualificação',
 'Tempo entre virar MQL e o primeiro contato comercial; número de tentativas.',
 'Tempo médio de resposta; tentativas por lead.',
 'SE implementarmos uma cadência de contato (ligação + WhatsApp + e-mail em 5 dias), ENTÃO esperamos aumentar MQL→Oportunidade, PORQUE os MQLs esfriam antes da abordagem.',
 'Cadência estruturada em metade dos MQLs vs. o processo atual.', 1),

('mql_opp', 'conversao',
 'Passagem marketing → vendas sem SLA',
 'Existe um acordo de quando e como o lead é repassado? O vendedor aceita ou rejeita com motivo?',
 'MQLs repassados vs. trabalhados.',
 'SE formalizarmos um SLA entre marketing e vendas, ENTÃO esperamos que mais MQLs sejam trabalhados, PORQUE hoje parte deles se perde na passagem.',
 'SLA documentado + revisão semanal dos MQLs não trabalhados.', 2),

('mql_opp', 'conversao',
 'Abordagem inicial não gera agendamento',
 'Roteiro de primeiro contato; taxa contato→reunião.',
 'Gravações ou mensagens de abordagem; taxa de agendamento.',
 'SE mudarmos a abordagem para um diagnóstico (perguntas sobre a situação), ENTÃO esperamos aumentar o agendamento, PORQUE a abordagem atual apresenta o produto cedo demais.',
 'Novo roteiro testado por 2 semanas.', 3),

('mql_opp', 'conversao',
 'Capacidade comercial insuficiente para o volume',
 'MQLs por vendedor/mês vs. capacidade de atendimento.',
 'MQLs por vendedor; % sem contato.',
 'SE ajustarmos o volume ou a capacidade (SDR, priorização), ENTÃO esperamos atender todos os MQLs no prazo, PORQUE o time não consegue absorver o volume atual.',
 'Priorização por score dos MQLs de maior fit.', 4),

-- ---------- opp_sale — Oportunidade → Venda ------------------
('opp_sale', 'conversao',
 'Diagnóstico fraco na reunião',
 'O vendedor investiga situação, problema, impacto e objetivo antes de apresentar?',
 'Gravações de reuniões; tempo falando vs. ouvindo.',
 'SE estruturarmos a reunião com diagnóstico antes da oferta, ENTÃO esperamos aumentar Oportunidade→Venda, PORQUE hoje a proposta é apresentada sem conectar com o problema do cliente.',
 'Roteiro de reunião diagnóstica aplicado por 30 dias.', 1),

('opp_sale', 'conversao',
 'Follow-up pós-proposta inexistente ou sem valor',
 'O que acontece depois da proposta? Quantos contatos? Com qual conteúdo?',
 'Propostas sem resposta; número de follow-ups.',
 'SE aplicarmos um follow-up com contexto, prova e fechamento de ciclo (D0, D+1, D+3, D+5, D+7), ENTÃO esperamos converter mais propostas, PORQUE muitas oportunidades morrem por falta de acompanhamento.',
 'Cadência pós-proposta padronizada.', 2),

('opp_sale', 'conversao',
 'Objeções recorrentes não tratadas (preço, timing, sócio)',
 'Motivos de perda registrados no CRM.',
 'Distribuição dos motivos de perda.',
 'SE tratarmos a objeção mais frequente já no diagnóstico, ENTÃO esperamos reduzir perdas por esse motivo, PORQUE ela se repete na maioria das oportunidades perdidas.',
 'Incluir a pergunta de validação da objeção no roteiro.', 3),

('opp_sale', 'conversao',
 'Oportunidades sem qualificação real (fit, decisor, orçamento)',
 'As oportunidades têm decisor presente, orçamento e urgência?',
 '% de oportunidades com decisor; motivo "sem fit" / "sem decisão".',
 'SE só considerarmos oportunidade após validar decisor, necessidade e momento, ENTÃO esperamos uma taxa de fechamento mais real e previsível, PORQUE hoje entram oportunidades que não teriam como comprar.',
 'Critério de entrada em oportunidade documentado.', 4),

('opp_sale', 'conversao',
 'Proposta ou oferta pouco clara',
 'A proposta mostra problema, transformação, entregáveis e investimento de forma simples?',
 'Feedback de clientes perdidos; tempo de decisão.',
 'SE reescrevermos a proposta focando no resultado para o cliente, ENTÃO esperamos reduzir o tempo de decisão e aumentar o fechamento, PORQUE a proposta atual é genérica.',
 'Novo modelo de proposta em metade das oportunidades.', 5),

-- ---------- ticket — Ticket médio ----------------------------
('ticket', 'ticket',
 'Descontos frequentes para fechar',
 '% de vendas com desconto; desconto médio.',
 'Preço de tabela vs. preço praticado.',
 'SE limitarmos o desconto a critérios definidos, ENTÃO esperamos aumentar o ticket médio, PORQUE hoje o desconto é usado como argumento principal de fechamento.',
 'Política de desconto com aprovação por 30 dias.', 1),

('ticket', 'ticket',
 'Sem oferta complementar (upsell/cross-sell)',
 'Existe produto adicional ou plano superior oferecido na venda?',
 '% de vendas com item adicional.',
 'SE oferecermos um produto complementar no momento da venda, ENTÃO esperamos aumentar o ticket, PORQUE parte dos clientes tem necessidade adicional não atendida.',
 'Oferta complementar apresentada em todas as propostas.', 2),

('ticket', 'ticket',
 'Mix de clientes de menor porte',
 'Ticket por segmento/porte de cliente.',
 'Distribuição de vendas por porte.',
 'SE direcionarmos a aquisição para clientes de maior porte dentro do ICP, ENTÃO esperamos elevar o ticket, PORQUE clientes maiores compram pacotes maiores.',
 'Campanha específica para o segmento de maior ticket.', 3),

-- ---------- retencao — Recompra / Retenção / Indicação -------
('retencao', 'retencao',
 'Onboarding fraco nos primeiros 30 dias',
 'O que acontece depois da venda? Existe processo de ativação?',
 'Churn nos primeiros 90 dias.',
 'SE estruturarmos um onboarding com marcos de valor, ENTÃO esperamos reduzir o churn inicial, PORQUE o cliente não percebe resultado no começo.',
 'Checklist de onboarding para novos clientes por 60 dias.', 1),

('retencao', 'frequencia',
 'Nenhuma ação ativa de recompra',
 'Existe contato programado com a base para nova compra?',
 '% de clientes que recompraram; tempo médio entre compras.',
 'SE criarmos uma cadência de relacionamento com a base, ENTÃO esperamos aumentar a frequência de compra, PORQUE hoje a recompra depende da iniciativa do cliente.',
 'Campanha para a base ativa com oferta de recompra.', 2),

('retencao', 'indicacao',
 'Nenhum processo de indicação',
 'Vocês pedem indicação? Em que momento? Há incentivo?',
 '% de vendas vindas de indicação.',
 'SE pedirmos indicação no momento de maior satisfação (após o primeiro resultado), ENTÃO esperamos aumentar as vendas por indicação, PORQUE hoje não existe pedido estruturado.',
 'Programa de indicação piloto por 60 dias.', 3);


-- ############################################################################
-- PARTE: jornada aquisicao experimentos
-- ############################################################################

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
