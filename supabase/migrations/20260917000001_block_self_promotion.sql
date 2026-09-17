-- ============================================================
-- FECHA A AUTO-PROMOCAO NO CADASTRO PUBLICO
-- ------------------------------------------------------------
-- O trigger anterior lia o 'role' do raw_user_meta_data, que e
-- controlado por quem faz o signup. Bastava mandar role=admin
-- no cadastro para nascer administrador.
--
-- Agora o papel so pode vir de app_metadata, que e escrito
-- exclusivamente pelo servidor (service_role). O metadata do
-- usuario nunca mais decide permissao.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    -- app_metadata: so a service_role escreve aqui.
    coalesce((new.raw_app_meta_data->>'role')::user_role, 'student'::user_role)
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;


-- ============================================================
-- IMPEDE QUE UM USUARIO EDITE O PROPRIO PAPEL
-- ------------------------------------------------------------
-- Sem isto, um aluno com sessao valida poderia dar um UPDATE
-- em profiles e se promover a admin.
-- ============================================================

create or replace function public.prevent_role_escalation()
returns trigger as $$
begin
  -- auth.uid() e nulo quando a service_role age: ai a troca e permitida.
  if auth.uid() is not null and new.role is distinct from old.role then
    if not public.is_admin() then
      raise exception 'Apenas administradores podem alterar o papel de um usuario.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
  before update on public.profiles
  for each row execute procedure public.prevent_role_escalation();
