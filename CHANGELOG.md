# Changelog

## 0.3.0 — 2026-11-24
- Importação de planilhas (.xlsx/.csv) para Leads e Clientes, com modelos para download, validação linha a linha e tratamento de duplicados. Exportação no mesmo formato do modelo.
- Cidade em leads e clientes; data de próximo retorno com lista no dashboard e lembrete diário.
- Site: seção “Segmentos atendidos”, depoimentos (CMS), apresentação do fundador na home, barra fixa de contato no celular, página /planos com comparativo.
- Conteúdo v2: topo da home, página do fundador (formação, experiência, especialidades, valores e visão), FAQ com 21 perguntas, planos Bronze/Prata/Ouro/Ultra Diamante.
- Segurança: 68 testes de RLS, testes HTTP, correção do honeypot, 0 vulnerabilidades em dependências.

## 0.2.0 — 2026-11-23
- Tema claro/escuro no painel; planilhas de contatos; e-mail marketing com Resend; área de tráfego (Meta Ads).

## 0.1.0 — 2026-11-21 · Etapas 1 a 5 (base completa)

- Planejamento: análise da logomarca, design system, arquitetura, banco de dados com RLS.
- Site comercial: home, serviços (5 páginas), Clientes & Projetos, Quem está por trás da RB, Clubes & Escolinhas, Contato, Privacidade, SEO (metadados, Open Graph, sitemap, robots, dados estruturados).
- Painel: login com papéis, dashboard, CMS com rascunho/publicação/pré-visualização/histórico, biblioteca de mídia com otimização, serviços, planos SaaS, FAQ, portfólio.
- CRM: funil de leads (kanban), histórico comercial, conversão em cliente, clientes, projetos, documentos privados, exportação CSV.
- Financeiro: contas a pagar/receber, recorrência, baixa com confirmação, inadimplência, fluxo de caixa, relatórios, CSV, importação de extrato OFX/CSV com conciliação.
- Chatbot: provedores Anthropic/OpenAI, base de conhecimento com busca, limites de custo, fila humana, correções, teste.
- Integrações: webhook de leads, cron diário, e-mail opcional (Resend), GA4/Pixel com consentimento.
- Segurança: RLS, CSP e cabeçalhos, rate limiting, validação, auditoria, CI com testes e gitleaks.
