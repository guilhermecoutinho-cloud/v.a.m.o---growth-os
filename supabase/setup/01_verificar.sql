-- ============================================================================
-- VERIFICACAO — rode depois de 00_aplicar_tudo.sql
-- ============================================================================
-- Cole no SQL Editor e rode. Cada linha deve dizer OK.
-- ============================================================================

-- 1. As tabelas existem?
select
  'tabelas' as item,
  count(*) || ' de 15' as encontrado,
  case when count(*) >= 15 then 'OK' else 'FALTANDO' end as status
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'organizations', 'profiles', 'organization_members', 'mentor_assignments',
    'revenue_goals', 'metric_snapshots', 'revenue_scenarios', 'hypothesis_library',
    'investigations', 'hypotheses', 'program_steps', 'program_progress',
    'leads', 'sales_diagnostics', 'settings',
    'journey_stages', 'acquisition_channels', 'experiments'
  )

union all

-- 2. O RLS esta ligado em todas?
select
  'RLS ligado',
  count(*) || ' tabelas',
  case when count(*) = 0 then 'OK' else 'FALTANDO em alguma' end
from pg_tables t
where t.schemaname = 'public'
  and t.tablename in (
    'metric_snapshots', 'revenue_goals', 'revenue_scenarios', 'hypotheses',
    'investigations', 'journey_stages', 'acquisition_channels', 'experiments',
    'leads', 'sales_diagnostics'
  )
  and not t.rowsecurity

union all

-- 3. As funcoes de permissao existem?
select
  'funcoes de RLS',
  count(*) || ' de 4',
  case when count(*) >= 4 then 'OK' else 'FALTANDO' end
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('is_admin', 'is_member', 'can_write', 'has_role')

union all

-- 4. As 9 etapas do programa foram semeadas?
select
  'etapas do programa',
  count(*) || ' de 9',
  case when count(*) = 9 then 'OK' else 'FALTANDO' end
from program_steps

union all

-- 5. As 25 possiveis causas foram semeadas?
select
  'biblioteca de causas',
  count(*) || ' de 25',
  case when count(*) = 25 then 'OK' else 'FALTANDO' end
from hypothesis_library

union all

-- 6. Os pisos de referencia existem?
-- O count evita que a linha suma da lista quando o registro nao existe:
-- um select direto na tabela devolveria zero linhas, e a verificacao
-- passaria despercebida em vez de acusar a falta.
select
  'pisos de referencia',
  count(*) || ' registro(s)',
  case when count(*) = 1 then 'OK' else 'FALTANDO' end
from settings where key = 'benchmarks'

union all

-- 7. As tabelas antigas sairam?
select
  'tabela funnels removida',
  case when count(*) = 0 then 'sim' else 'ainda existe' end,
  case when count(*) = 0 then 'OK' else 'VERIFICAR' end
from information_schema.tables
where table_schema = 'public' and table_name = 'funnels';


-- ============================================================================
-- Quem ja tem acesso (deve aparecer ao menos o seu admin)
-- ============================================================================
select email, role, created_at::date as desde
from profiles
order by created_at;


-- ============================================================================
-- As causas por no do funil (confere se o seed entrou completo)
-- ============================================================================
select node, count(*) as causas
from hypothesis_library
group by node
order by node;
