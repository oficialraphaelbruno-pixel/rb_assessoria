# RB Assessoria & Comunicação — Plataforma digital

Site comercial, painel administrativo (CMS), CRM, gestão financeira e chatbot com IA da RB Assessoria & Comunicação.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage, RLS) · Vercel · Resend (opcional) · Anthropic / OpenAI (camada de provedor trocável).

## Documentação

| Documento | Conteúdo |
|---|---|
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Arquitetura, mapa de páginas, banco de dados, design system, decisões |
| [docs/MANUAL-PAINEL.md](docs/MANUAL-PAINEL.md) | Manual do painel administrativo (para uso diário, sem programação) |
| [docs/SEGURANCA.md](docs/SEGURANCA.md) | Controles de segurança/LGPD, riscos identificados e pendências |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Supabase, Vercel, domínio, variáveis de ambiente, backup |
| [docs/CUSTOS.md](docs/CUSTOS.md) | Custos, limites dos planos gratuitos, comparação de IA, BTG |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de alterações |

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev                  # http://localhost:3000  ·  painel em /admin
```

Scripts: `npm run typecheck` · `npm test` · `npm run build`.

## Estrutura

```
src/
  app/(site)/        páginas públicas (home, serviços, clientes, quem somos, clubes, contato, privacidade)
  app/admin/         painel (login + área protegida em (panel)/)
  app/api/           contato, chatbot, webhooks, cron, preview
  components/site/   componentes do site
  components/admin/  componentes do painel (formulários, mídia, gráficos…)
  lib/               supabase, conteúdo, IA, validação, ações do servidor
supabase/migrations/ schema (RLS) e conteúdo inicial
tests/               testes automatizados (vitest)
```

## Fluxo de trabalho (Git)

- `main` = produção (deploy automático na Vercel **somente após aprovação**).
- Trabalhe em branches `feat/...`, `fix/...` e abra Pull Request: a Vercel gera um *preview* e o CI roda typecheck, testes, build e varredura de segredos (gitleaks).
- Nunca commite `.env*` (já bloqueado no `.gitignore`).
