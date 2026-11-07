-- SR Central — cadastro de usuários (já aplicado no projeto Supabase)
create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9._-]{2,32}$'),
  nome text not null default '',
  admin boolean not null default false,
  ativo boolean not null default true,
  sistemas text[] not null default '{}',
  senha_padrao boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
alter table public.usuarios enable row level security;

create schema if not exists sr_priv;
revoke all on schema sr_priv from public, anon;
grant usage on schema sr_priv to authenticated;

-- admin ativo?
create or replace function sr_priv.sr_eh_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.usuarios u where u.id = (select auth.uid()) and u.admin and u.ativo);
$$;

-- o usuário logado pode usar o sistema X?  -> use nas regras RLS das tabelas de cada sistema
create or replace function sr_priv.sr_tem_acesso(sistema text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.usuarios u
    where u.id = (select auth.uid()) and u.ativo and (u.admin or sistema = any(u.sistemas)));
$$;

revoke all on function sr_priv.sr_eh_admin() from public, anon;
revoke all on function sr_priv.sr_tem_acesso(text) from public, anon;
grant execute on function sr_priv.sr_eh_admin() to authenticated;
grant execute on function sr_priv.sr_tem_acesso(text) to authenticated;

-- leitura: o próprio cadastro, ou todos se for admin. Escrita só pela Edge Function sr-admin.
create policy "usuarios_ler_proprio_ou_admin" on public.usuarios
  for select to authenticated
  using (id = (select auth.uid()) or (select sr_priv.sr_eh_admin()));
revoke all on public.usuarios from anon;
revoke insert, update, delete on public.usuarios from authenticated;
grant select on public.usuarios to authenticated;

create or replace function sr_priv.sr_tocar_atualizado()
returns trigger language plpgsql set search_path = '' as $$
begin new.atualizado_em := now(); return new; end; $$;
create trigger usuarios_atualizado before update on public.usuarios
  for each row execute function sr_priv.sr_tocar_atualizado();

-- Usuário inicial: ADMIN / ADMIN (criado direto no banco; troque a senha em Configurações)
