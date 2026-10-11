-- Troque pelo e-mail do usuário que você criou em Authentication > Users e rode UMA vez.
-- Depois, saia do painel e entre de novo para a permissão valer.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'TROQUE-PELO-SEU-EMAIL@exemplo.com';
