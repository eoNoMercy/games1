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
