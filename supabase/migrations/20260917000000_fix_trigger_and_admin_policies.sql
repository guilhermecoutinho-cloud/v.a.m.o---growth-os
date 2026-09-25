-- ============================================================
-- 1. CORRIGE A FALHA: todo usuario novo virava 'admin'
-- ------------------------------------------------------------
-- O trigger ativo no banco (vindo de fix_trigger.sql) gravava
-- role='admin' e full_name='Usuário Admin' fixos, ignorando o
-- metadata enviado no signup. Volta ao comportamento da migration
-- original: 'student' por padrao, full_name lido do metadata.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;


-- ============================================================
-- 2. CORRIGE AS POLICIES DE ADMIN
-- ------------------------------------------------------------
-- As policies antigas faziam "select 1 from profiles" dentro da
-- propria policy de profiles. Essa subconsulta e filtrada pelo
-- RLS, entao o admin so enxergava a si mesmo e nunca os demais.
-- A funcao abaixo e SECURITY DEFINER: roda fora do RLS e responde
-- a pergunta "quem esta logado e admin?" sem recursao.
-- ============================================================

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'::user_role
  );
$$ language sql security definer stable set search_path = public;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles" on profiles
  for select using (public.is_admin());

drop policy if exists "Admins can update profiles" on profiles;
create policy "Admins can update profiles" on profiles
  for update using (public.is_admin());

drop policy if exists "Admins can delete profiles" on profiles;
create policy "Admins can delete profiles" on profiles
  for delete using (public.is_admin());


-- ============================================================
-- 3. LIMPA OS USUARIOS DE TESTE
-- ------------------------------------------------------------
-- Criados durante a verificacao do fluxo; todos nasceram admin
-- por causa do trigger antigo. O delete em auth.users remove o
-- profile junto (on delete cascade).
-- ============================================================

delete from auth.users
where email like 'teste.e2e.%@gmail.com'
   or email like 'teste.b.%@gmail.com'
   or email like 't.sem-meta.%@gmail.com'
   or email like 't.com-meta.%@gmail.com'
   or email like 't.role-student.%@gmail.com'
   or email like 't.rec.%@gmail.com';


-- ============================================================
-- 4. PROMOVE O ADMIN DE VERDADE
-- ------------------------------------------------------------
-- Troque o email abaixo se quiser outro dono. Roda depois da
-- limpeza para nao ser apagado por ela.
-- ============================================================

update public.profiles
set role = 'admin'::user_role
where email = 'marketingcampinas@capitalupgrade.com.br';


-- ============================================================
-- 5. SOBRA DE SEGURANCA  ⚠ HISTORICO — NAO RODE ESTE BLOCO HOJE
-- ------------------------------------------------------------
-- ATENCAO: o update abaixo rebaixa a 'student' qualquer admin que
-- nao seja o dono. Fazia sentido em 17/09, quando o trigger falho
-- promovia todo mundo a admin. Hoje ele rebaixaria administradores
-- legitimos — ja aconteceu uma vez. Veja
-- 20260925000004_admins_multiplos.sql.
-- Qualquer perfil admin remanescente que nao seja o dono volta
-- a ser student. Protege contra contas criadas pelo trigger
-- falho antes desta correcao.
-- ============================================================

update public.profiles
set role = 'student'::user_role
where role = 'admin'::user_role
  and email <> 'marketingcampinas@capitalupgrade.com.br';
