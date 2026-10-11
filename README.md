# DW Eletrônicos: site + painel admin

## 1. Supabase (grátis)
1. Crie um projeto em supabase.com.
2. SQL Editor: rode `supabase/schema.sql` (cria tudo, já com a segurança).
3. Authentication > Users > **Add user**: crie o seu e-mail e senha (marque "Auto confirm").
4. Edite o e-mail em `supabase/tornar-admin.sql` e rode no SQL Editor. **Sem isso ninguém consegue editar nada.**
5. Authentication > Sign In / Providers > Email: **desligue "Allow new users to sign up"**.
6. Authentication > Settings: JWT expiry em 3600 s ou menos, "Refresh token rotation" ligado, e ative o CAPTCHA se quiser proteção extra no login.
7. Project Settings > API: copie a URL e a chave `anon public`. **Nunca use a `service_role` aqui.**

## 2. Rodar local
    cp .env.example .env.local   # cole a URL e a chave anon
    npm install
    npm run dev
Painel (sem link no site): http://localhost:3000/admin

## 3. Publicar na Vercel
Suba para o GitHub (o `.gitignore` já impede subir o `.env`), importe na Vercel e cadastre `SUPABASE_URL` e `SUPABASE_ANON_KEY` em Environment Variables.

## Segurança
- Chaves só no servidor; o navegador nunca recebe a chave do Supabase.
- Toda alteração do painel passa por ações no servidor que conferem sessão de admin, limitam requisições, validam e limpam os dados.
- Banco com regras de linha (RLS), permissões mínimas e validações próprias; fotos só JPG/PNG/WebP até 4 MB.
- Rode `npm run audit` de vez em quando; o Dependabot (`.github/dependabot.yml`) abre atualizações automáticas.

## Recuperar a senha do painel (funciona com o e-mail padrão do Supabase, sem SMTP)
1. Supabase > Authentication > **URL Configuration**:
   - **Site URL**: o endereço da loja (ou `http://localhost:3000` para testar).
   - **Redirect URLs**: adicione `https://SEU-SITE/admin/redefinir-senha` e `http://localhost:3000/admin/redefinir-senha`.
2. No site, abra `/admin/login` > **Esqueci minha senha**, informe o e-mail e abra o link recebido **no mesmo navegador** em que fez o pedido (o link é preso a ele, por segurança).
3. Crie a nova senha (12+ caracteres, maiúsculas, minúsculas, número e símbolo) e entre pelo login.
Não use o botão "Send password recovery" do painel do Supabase: ele gera um link de formato antigo.
Obs.: o e-mail padrão do Supabase tem limite baixo de envios por hora; para uso intenso configure um SMTP próprio.

### Se o link do e-mail der "expirou" ou "já foi usado"
- Cada novo pedido cancela os anteriores: espere o e-mail MAIS RECENTE chegar, clique uma única vez e no mesmo navegador do pedido.
- Confira em Supabase > Authentication > Sign In / Providers > Email se o tempo de validade do código não está muito curto (o padrão é 3600 segundos).
- Plano B sem e-mail: use `supabase/emergencia-senha.sql` (troque e-mail e senha e rode no SQL Editor).
