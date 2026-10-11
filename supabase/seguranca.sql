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
