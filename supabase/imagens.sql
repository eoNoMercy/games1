-- Rode UMA vez no SQL Editor do Supabase (pode rodar de novo sem problema)
alter table products add column if not exists image_w int, add column if not exists image_h int;
