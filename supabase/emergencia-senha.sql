-- PLANO B (emergência): define uma nova senha direto no banco, sem depender de e-mail.
-- 1) Troque o e-mail e a senha abaixo. Use 12+ caracteres com maiúsculas, minúsculas, número e símbolo.
-- 2) Rode no SQL Editor do Supabase.
-- 3) Depois de rodar, apague a senha deste texto (e não deixe salva no histórico do editor).
-- Se der erro dizendo que "extensions.crypt" não existe, apague o "extensions." das duas funções e rode de novo.
update auth.users
set encrypted_password = extensions.crypt('TROQUE-POR-UMA-SENHA-FORTE', extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
where email = 'TROQUE-PELO-SEU-EMAIL@exemplo.com';

-- Encerra logins antigos dessa conta.
delete from auth.sessions where user_id in (select id from auth.users where email = 'TROQUE-PELO-SEU-EMAIL@exemplo.com');
