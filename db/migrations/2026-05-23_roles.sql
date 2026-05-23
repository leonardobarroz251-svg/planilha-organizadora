-- =========================================================
-- Cofre — adiciona papéis (user/admin) ao schema
-- Rode no SQL Editor do Supabase. Idempotente.
-- =========================================================

-- 1) Coluna role em profiles
alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user','admin'));

create index if not exists profiles_role_idx on public.profiles(role);

-- 2) Helper is_admin() — SECURITY DEFINER evita recursão de RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 3) Policies de admin em profiles (read all + update all)
drop policy if exists "profiles admin read all" on public.profiles;
create policy "profiles admin read all"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "profiles admin update all" on public.profiles;
create policy "profiles admin update all"
  on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

-- 4) Trigger: bloqueia troca de role por não-admins
create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'forbidden: only admins can change role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_guard on public.profiles;
create trigger profiles_role_guard
  before update on public.profiles
  for each row execute function public.prevent_self_role_change();

-- =========================================================
-- Pós-migration manual:
--   update public.profiles set role='admin' where email='leonardo_palm@hotmail.com';
-- =========================================================
