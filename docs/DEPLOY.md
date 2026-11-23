# Publicação e operação

## Estado atual (23/11/2026)

- Vercel: projeto `rb-assessoria` (time Rapha, plano Hobby), região das funções `gru1` (São Paulo), Node 22.
- URL: https://rb-assessoria.vercel.app (pública). Previews de branches exigem login na Vercel.
- Variáveis já configuradas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `IP_HASH_SALT`, `CRON_SECRET`.
- **Falta (manual):** `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API Keys → chave secreta) e, ao ativar o chatbot, `ANTHROPIC_API_KEY` ou `OPENAI_API_KEY`. Depois de adicionar, faça *Redeploy*.
- Supabase: textos iniciais aplicados; administrador configurado.


## 1. Supabase (projeto `rb-assessoria`, ref `kmbyxccoaimgjsmgwazs`, São Paulo)

1. Migrations em `supabase/migrations/` (aplicadas na ordem). O projeto da Júlia **não** é tocado.
2. **Authentication → Providers → Email:** desative “Allow new users to sign up” e ative “Leaked password protection”.
3. **Authentication → URL Configuration:** Site URL = domínio final; adicione `https://SEU-DOMINIO/admin/auth/callback` e a URL de preview da Vercel em Redirect URLs.
4. **Primeiro administrador:** Authentication → Users → *Add user* (e-mail + senha forte, “Auto confirm”). Depois, no SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'SEU-EMAIL';
   ```
5. **Project Settings → API Keys:** copie a chave publicável (`sb_publishable_…`) e a chave secreta (`sb_secret_…` ou service_role) para as variáveis da Vercel. A secreta **nunca** vai para o navegador nem para o Git.

## 2. Vercel

1. Importar o repositório GitHub `rb_assessoria` (framework Next.js, sem configurações extras).
2. Variáveis de ambiente (ver `.env.example`) em *Production* e *Preview*:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `IP_HASH_SALT`, `CRON_SECRET` e, quando for usar: `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`, `RESEND_API_KEY`, `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM`, `LEADS_WEBHOOK_TOKEN`.
3. Cada PR/branch gera um **preview**. Produção (`main`) só após aprovação.
4. Cron diário (`vercel.json`, 08h de Brasília) envia alertas de vencimento.
5. Domínio: Project → Settings → Domains → adicionar `rbassessoria.com.br` (exemplo) e configurar o DNS conforme indicado. HTTPS é automático. Atualize `NEXT_PUBLIC_SITE_URL` e o campo “Endereço do site” em Conteúdo → SEO global.
6. Monitoramento básico: Vercel → Logs/Observability; Supabase → Logs e Advisors.

## 3. Search Console e Analytics

- Search Console: verifique por meta tag (cole o código em Conteúdo → Analytics e verificação) e envie `/sitemap.xml`.
- GA4 e Meta Pixel: informe os IDs no painel. Os scripts só carregam após o aceite de cookies.

## 4. Backup e recuperação

- Plano gratuito: sem backups diários acessíveis. Faça dump semanal:
  ```bash
  npx supabase db dump --db-url "postgresql://postgres:SENHA@db.kmbyxccoaimgjsmgwazs.supabase.co:5432/postgres" -f backup-$(date +%F).sql
  ```
  e exporte CSVs pelo painel (Leads, Financeiro). Guarde fora do Supabase.
- Plano Pro: backups diários automáticos (7 dias) e opção de PITR.
- Recuperação: novo projeto Supabase → aplicar migrations → restaurar dump (`psql -f backup.sql`) → atualizar variáveis na Vercel.
- Conteúdo do site: “Histórico de versões” em cada bloco permite restaurar edições.
