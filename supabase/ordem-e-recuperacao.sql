-- Rode UMA vez no SQL Editor do Supabase, DEPOIS de seguranca.sql (pode rodar de novo sem problema).

-- 1) Ordem arrastável: produtos ganham posição (categorias e consoles já tinham).
alter table public.products add column if not exists position int default 0;
create index if not exists products_ordem_idx on public.products (category_id, position);

-- Salva a nova ordem de uma vez só; só administrador consegue (as regras de linha também valem).
create or replace function public.reorder_items(p_table text, p_ids uuid[]) returns void language plpgsql security invoker set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if p_table = 'products' then
    update public.products t set position = o.ord from unnest(p_ids) with ordinality as o(id, ord) where t.id = o.id;
  elsif p_table = 'categories' then
    update public.categories t set position = o.ord from unnest(p_ids) with ordinality as o(id, ord) where t.id = o.id;
  elsif p_table = 'consoles' then
    update public.consoles t set position = o.ord from unnest(p_ids) with ordinality as o(id, ord) where t.id = o.id;
  else raise exception 'invalid';
  end if;
end $$;
revoke all on function public.reorder_items(text, uuid[]) from public, anon;
grant execute on function public.reorder_items(text, uuid[]) to authenticated;

-- 2) Auditoria de acesso e recuperação de senha (sem senhas, sem tokens, e-mail e IP só como código embaralhado).
create table if not exists public.audit_log (
  id bigint generated always as identity primary key, created_at timestamptz not null default now(),
  event text not null, user_id uuid, ip_hash text, detail text
);
alter table public.audit_log enable row level security;
revoke all on table public.audit_log from anon, authenticated;
grant select on table public.audit_log to authenticated;
drop policy if exists "admin le auditoria" on public.audit_log;
create policy "admin le auditoria" on public.audit_log for select to authenticated using (public.is_admin());

create or replace function public.log_event(p_event text, p_user uuid, p_ip text, p_detail text) returns void language sql security definer set search_path = public as $$
  insert into public.audit_log (event, user_id, ip_hash, detail)
  select p_event, p_user, left(coalesce(p_ip,''), 32), left(coalesce(p_detail,''), 200)
  where p_event in ('recovery_requested','recovery_blocked','recovery_failed','password_changed','password_change_failed','login_ok','login_failed')
$$;
revoke all on function public.log_event(text, uuid, text, text) from public;
grant execute on function public.log_event(text, uuid, text, text) to anon, authenticated;
