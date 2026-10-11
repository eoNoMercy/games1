-- Cole TUDO no Supabase > SQL Editor > Run
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  store_name text, tagline text, logo_url text, whatsapp text, address text, maps_url text,
  hours text, instagram text, hero_cover_url text, hero_disc_url text, hero_title text, hero_platform text
);
insert into settings (id, store_name, tagline) values (1, 'DW Eletrônicos', 'Games e eletrônicos em mídia física.') on conflict do nothing;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(), name text not null, text text default '', position int default 0
);
create table if not exists products (
  id uuid primary key default gen_random_uuid(), name text not null, platform text default '',
  category_id uuid references categories(id) on delete set null, description text default '',
  image_url text, price text, featured boolean default false, active boolean default true,
  created_at timestamptz default now()
);
insert into categories (name, text, position) select * from (values
  ('Jogos','Mídia física para cada plataforma.',1), ('Consoles','Videogames de mesa e portáteis.',2), ('Acessórios','Controles, cabos e periféricos.',3)
) v where not exists (select 1 from categories);

alter table settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
drop policy if exists "leitura publica" on settings;
create policy "leitura publica" on settings for select using (true);
drop policy if exists "leitura publica" on categories;
create policy "leitura publica" on categories for select using (true);
drop policy if exists "leitura publica" on products;
create policy "leitura publica" on products for select using (true);
drop policy if exists "dono edita" on settings;
create policy "dono edita" on settings for all to authenticated using (true) with check (true);
drop policy if exists "dono edita" on categories;
create policy "dono edita" on categories for all to authenticated using (true) with check (true);
drop policy if exists "dono edita" on products;
create policy "dono edita" on products for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
drop policy if exists "midia leitura" on storage.objects;
create policy "midia leitura" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "midia dono" on storage.objects;
create policy "midia dono" on storage.objects for all to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');

-- Desempenho
create index if not exists products_lista_idx on products (active, category_id, created_at desc);
-- Rode UMA vez no SQL Editor do Supabase (pode rodar de novo sem problema)
create table if not exists consoles (
  id uuid primary key default gen_random_uuid(), name text not null unique, position int default 0
);
alter table consoles enable row level security;
drop policy if exists "leitura publica" on consoles;
create policy "leitura publica" on consoles for select using (true);
drop policy if exists "dono edita" on consoles;
create policy "dono edita" on consoles for all to authenticated using (true) with check (true);
insert into consoles (name, position) values
  ('PS3',1), ('PS4',2), ('PS5',3), ('Xbox 360',4), ('Xbox One',5), ('Xbox Series X|S',6), ('Nintendo Switch',7), ('PC',8)
on conflict (name) do nothing;

alter table products add column if not exists platforms text[] default '{}';
update products set platforms = array[platform] where coalesce(platform,'') <> '' and (platforms is null or platforms = '{}');
-- Rode UMA vez no SQL Editor do Supabase (pode rodar de novo sem problema)
alter table products add column if not exists image_w int, add column if not exists image_h int;
-- SEGURANÇA DO BANCO. Rode no SQL Editor (pode rodar de novo sem problema). Rode também supabase/tornar-admin.sql.

-- 1) Quem é administrador: papel "admin" gravado em app_metadata (o usuário NÃO consegue alterar isso sozinho).
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 2) Permissões das tabelas: visitantes só leem; só administrador escreve.
revoke all on table public.settings, public.categories, public.products, public.consoles from anon, authenticated;
grant select on table public.settings, public.categories, public.products, public.consoles to anon, authenticated;
grant insert, update, delete on table public.settings, public.categories, public.products, public.consoles to authenticated;

-- 3) Regras de linha (RLS) refeitas do zero.
do $$ declare t text; p record; begin
  foreach t in array array['settings','categories','products','consoles'] loop
    execute format('alter table public.%I enable row level security', t);
    for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
    if t = 'products' then
      execute 'create policy "ler publico" on public.products for select using (active = true or public.is_admin())';
    else
      execute format('create policy "ler publico" on public.%I for select using (true)', t);
    end if;
    execute format('create policy "admin insere" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin altera" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin apaga" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- 4) Validação no banco (vale mesmo que alguém fale direto com a API).
alter table public.products drop constraint if exists products_valida;
alter table public.products add constraint products_valida check (
  char_length(name) between 1 and 120 and char_length(coalesce(description,'')) <= 1000 and char_length(coalesce(price,'')) <= 30
  and coalesce(array_length(platforms,1),0) <= 12 and (image_url is null or image_url ~ '^https://')
  and (image_w is null or image_w between 1 and 10000) and (image_h is null or image_h between 1 and 10000)) not valid;
alter table public.categories drop constraint if exists categories_valida;
alter table public.categories add constraint categories_valida check (char_length(name) between 1 and 60 and char_length(coalesce(text,'')) <= 160) not valid;
alter table public.consoles drop constraint if exists consoles_valida;
alter table public.consoles add constraint consoles_valida check (char_length(name) between 1 and 40) not valid;
alter table public.settings drop constraint if exists settings_valida;
alter table public.settings add constraint settings_valida check (
  char_length(coalesce(store_name,'')) <= 80 and char_length(coalesce(tagline,'')) <= 160 and char_length(coalesce(address,'')) <= 240
  and char_length(coalesce(hours,'')) <= 160 and coalesce(whatsapp,'') ~ '^[0-9]{0,15}$'
  and coalesce(maps_url,'') ~ '^(https://.*)?$' and coalesce(instagram,'') ~ '^(https://.*)?$'
  and coalesce(logo_url,'') ~ '^(https://.*)?$' and coalesce(hero_cover_url,'') ~ '^(https://.*)?$' and coalesce(hero_disc_url,'') ~ '^(https://.*)?$') not valid;

-- 5) Armazenamento de fotos: só imagens, até 4 MB, só admin envia, sem listagem pública dos arquivos.
update storage.buckets set public = true, file_size_limit = 4194304, allowed_mime_types = array['image/jpeg','image/png','image/webp'] where id = 'media';
drop policy if exists "midia leitura" on storage.objects;
drop policy if exists "midia dono" on storage.objects;
drop policy if exists "midia admin envia" on storage.objects;
drop policy if exists "midia admin altera" on storage.objects;
drop policy if exists "midia admin apaga" on storage.objects;
create policy "midia admin envia" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "midia admin altera" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
create policy "midia admin apaga" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
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
