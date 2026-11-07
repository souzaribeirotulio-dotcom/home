-- ============================================================
--  SR Compras — dados do sistema de compras (já aplicado no projeto Supabase)
--
--  Uma tabela só, organizada em "coleções". Cada registro é gravado
--  individualmente, então duas pessoas editando produtos diferentes
--  ao mesmo tempo não apagam o trabalho uma da outra.
--
--  colecao      chave                    valor
--  -----------  -----------------------  ----------------------------------
--  fornecedor   id do fornecedor         {id, nome, atacado, criado}
--  produto      código (ou N:<nome>)     {codigo, produto, marca, fornecedores[], principal, ...}
--  extra        chave do produto         venda extraordinária (vale para todos os ciclos)
--  desc         chave do produto         venda descontinuada (vale para todos os ciclos)
--  comprado     chave do produto         comprado no ciclo atual {compradoEm[]...}
--  estado       id da lista              {an, checked{}} — progresso de cada lista no ciclo
--  ciclo        'atual'                  {raw[], importDate, nRaw} — planilha importada
--  sheets       'atual'                  {dados{}, msg} — CSV do Sheets (já comprados)
--  backup       'cadastro'               cópia do cadastro antes de importar um backup
--
--  Acesso: quem tem o SR Compras liberado em Configurações (ou é admin).
-- ============================================================
create table public.compras_registros (
  colecao text not null check (colecao in ('fornecedor','produto','extra','desc','comprado','estado','ciclo','sheets','backup')),
  chave text not null check (length(chave) between 1 and 300),
  valor jsonb not null,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid default auth.uid() references public.usuarios(id) on delete set null,
  primary key (colecao, chave)
);
comment on table public.compras_registros is 'SR Compras: cadastro de fornecedores/produtos, marcações e ciclo de compras. Acesso: sr_tem_acesso(''compras'').';

alter table public.compras_registros enable row level security;
revoke all on public.compras_registros from anon;
grant select, insert, update, delete on public.compras_registros to authenticated;

create policy "compras_ler" on public.compras_registros
  for select to authenticated using ((select sr_priv.sr_tem_acesso('compras')));
create policy "compras_inserir" on public.compras_registros
  for insert to authenticated with check ((select sr_priv.sr_tem_acesso('compras')));
create policy "compras_alterar" on public.compras_registros
  for update to authenticated using ((select sr_priv.sr_tem_acesso('compras'))) with check ((select sr_priv.sr_tem_acesso('compras')));
create policy "compras_excluir" on public.compras_registros
  for delete to authenticated using ((select sr_priv.sr_tem_acesso('compras')));

-- quem e quando alterou (não dá para falsificar pelo site)
create or replace function sr_priv.compras_carimbar()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  new.atualizado_por := (select auth.uid());
  return new;
end; $$;
create trigger compras_registros_carimbo before insert or update on public.compras_registros
  for each row execute function sr_priv.compras_carimbar();

-- "versão" dos dados: o site usa para saber se outra pessoa alterou algo
create or replace function public.compras_versao()
returns text language sql stable security invoker set search_path = '' as $$
  select count(*)::text || '|' || coalesce(max(atualizado_em)::text, '')
  from public.compras_registros;
$$;
revoke all on function public.compras_versao() from public, anon;
grant execute on function public.compras_versao() to authenticated;
