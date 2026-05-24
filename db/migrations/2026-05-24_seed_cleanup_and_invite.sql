-- =========================================================
-- Cofre — limpeza do seed de exemplo + suporte a role via convite
-- Rode no SQL Editor do Supabase em ambientes ja provisionados.
-- Idempotente.
-- =========================================================

-- Nova versao do trigger: cria profile + preferences + 1 conta + 8 categorias.
-- Le o role de raw_user_meta_data.role (passado pelo admin no convite).
-- Remove transacoes e budgets de exemplo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'user');
  if v_role not in ('user', 'admin') then
    v_role := 'user';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''),'@',1)),
    v_role
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.accounts (user_id, name, provider, sync_status, balance)
  values (new.id, 'Conta principal', 'manual', 'manual', 0)
  on conflict do nothing;

  insert into public.categories (user_id, slug, name, icon, color, kind, position) values
    (new.id, 'moradia',     'Moradia',         'home',     'oklch(0.7 0.08 145)', 'expense', 0),
    (new.id, 'transporte',  'Transporte',      'car',      'oklch(0.7 0.09 245)', 'expense', 1),
    (new.id, 'dia-a-dia',   'Dia a dia',       'coffee',   'oklch(0.72 0.09 70)', 'expense', 2),
    (new.id, 'saude',       'Saúde',           'heart',    'oklch(0.68 0.12 25)', 'expense', 3),
    (new.id, 'lazer',       'Lazer',           'sparkles', 'oklch(0.7 0.13 320)', 'expense', 4),
    (new.id, 'obrigacoes',  'Obrigações',      'receipt',  'oklch(0.6 0.05 270)', 'expense', 5),
    (new.id, 'carro-uber',  'Carro Uber/99',   'briefcase','oklch(0.66 0.1 50)',  'expense', 6),
    (new.id, 'renda',       'Renda',           'wallet',   'oklch(0.62 0.13 150)','income',  7)
  on conflict (user_id, slug) do nothing;

  return new;
end;
$$;

-- Trigger ja existe; nao precisa recriar, mas garantimos por seguranca.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
