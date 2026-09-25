-- ============================================================================
-- DIAGNÓSTICO — quais policies existem hoje em organization_members
-- ============================================================================
-- Cole no SQL Editor e rode. Me mande o resultado.
-- ============================================================================

select
  policyname as nome,
  cmd as comando,
  qual::text as condicao_leitura,
  with_check::text as condicao_escrita
from pg_policies
where schemaname = 'public'
  and tablename = 'organization_members'
order by policyname;
