-- ============================================================
-- Permite mais de um administrador
-- ------------------------------------------------------------
-- A migration 20260917000000 terminava rebaixando a 'student'
-- qualquer perfil admin que nao fosse o dono. Aquilo fazia sentido
-- naquele momento: o trigger falho promovia todo mundo a admin, e o
-- bloco limpava a bagunca.
--
-- Hoje o trigger ja grava 'student' por padrao e o papel so vem de
-- app_metadata, escrito pelo servidor. Aquele bloco virou um risco:
-- rodar o instalador de novo rebaixaria administradores legitimos —
-- foi o que aconteceu com guilhermecuitinho@gmail.com.
--
-- Esta migration nao o executa e reafirma quem deve ser admin.
-- Para promover outra pessoa, use a tela de Acessos ou rode aqui:
--
--   update public.profiles set role = 'admin' where email = 'x@y.com';
--
-- Lembrando que o papel tambem precisa ir para app_metadata, que e o
-- que o menu le. A tela de Acessos cuida dos dois.
-- ============================================================

update public.profiles
set role = 'admin'::user_role
where email in (
  'marketingcampinas@capitalupgrade.com.br',
  'guilhermecuitinho@gmail.com'
);

-- Confere o resultado.
select email, role, created_at::date as desde
from public.profiles
order by role, email;
