# Arquitetura

## Visão geral

```
Visitante ──► Vercel (Next.js) ──► Supabase Postgres (RLS)
                 │  ├─ páginas públicas: leitura anônima, cache por tag "content"
                 │  ├─ /api/contact  → valida (zod) + rate limit → leads
                 │  ├─ /api/chat     → rate limit + orçamento → provedor de IA → histórico
                 │  └─ /api/webhooks/leads (token) → leads de ManyChat/anúncios
Admin ──► /admin (Supabase Auth + papel em profiles) ──► server actions (sessão do usuário, RLS)
                                                    └─► Storage: media (público) / documents (privado)
```

- **Conteúdo sem novo deploy:** páginas públicas leem o Supabase com cache marcado pela tag `content`. Ao salvar/publicar no painel, a server action chama `revalidateTag("content")` e o site reflete a mudança imediatamente.
- **Rascunho x publicado:** blocos do site (`site_settings`) têm colunas `draft` e `published`; serviços, planos, FAQ e clientes têm `status`. A pré-visualização (`/api/preview/enable`, só para equipe) liga o *draft mode* do Next e lê rascunhos.
- **Autorização em camadas:** middleware exige sessão em `/admin`; cada página/ação valida o papel no servidor (`requireStaff` / `requireAdmin`); o banco aplica RLS (`is_staff()` / `is_admin()`). Mesmo uma chamada direta à API do Supabase com a chave pública não lê leads, CRM, financeiro ou conversas.
- **Chave secreta do Supabase** (service role) só existe no servidor e é usada apenas por: chatbot, captura de lead do chat, webhook, cron e e-mails. Sem ela, o formulário usa a RPC pública `submit_lead` (com validação e rate limit no banco) e o chatbot responde com a mensagem estática.

## Mapa de páginas

| Rota | Conteúdo |
|---|---|
| `/` | Topo, desafio, serviços, diferenciais, processo, portfólio, clientes (logos), SaaS + planos, sobre, FAQ, formulário |
| `/servicos` e `/servicos/[slug]` | Social Media, Sites, Sistemas SaaS (com planos Bronze/Prata/Ouro/Ultra Diamante), Automações e IA, Design |
| `/clientes-e-projetos` e `/[slug]` | Cards com filtro por categoria; detalhe com capa, resultados, serviços, Instagram, site, galeria e links |
| `/quem-esta-por-tras-da-rb` | Fundador: foto, nome, cargo, história, frase, experiência, especialidades, valores, visão, redes |
| `/clubes-e-escolinhas` | Página comercial para equipes parceiras da IMEF |
| `/contato` | Formulário de orçamento (`?servico=` pré-seleciona) + canais |
| `/privacidade` | Política de privacidade (editável) |
| `/admin/*` | Painel (ver MANUAL-PAINEL.md) |
| `/sitemap.xml`, `/robots.txt` | SEO (previews da Vercel não são indexados) |

## Banco de dados (Supabase — projeto `rb-assessoria`, região São Paulo)

| Área | Tabelas |
|---|---|
| Acesso | `profiles` (papel: pending / editor / admin), `audit_log`, `content_revisions` |
| CMS | `site_settings`, `services`, `plans`, `faqs`, `portfolio_clients`, `media` |
| Comercial | `leads` (funil + origem + UTM + consentimento), `lead_activities`, `crm_clients`, `client_history`, `projects`, `documents` |
| Financeiro | `fin_categories`, `fin_transactions` (previsto/pago/cancelado; "vencido" é derivado na view `v_fin_transactions`), `bank_statement_lines` |
| Chatbot | `chat_settings`, `knowledge_items` (busca full-text em português), `chat_conversations`, `chat_messages`, view `v_ai_usage_monthly` |
| Sistema | `notifications`, `integrations`, `rate_limits` |

Funções: `is_admin()`, `is_staff()`, `submit_lead()` (pública), `hit_rate_limit()`, `search_knowledge()` (somente servidor).
Regra no banco: um lançamento só pode ficar `pago` com `paid_at` e `confirmed_by` (constraint `paid_requires_date`).
Storage: bucket `media` (público, só imagens, 8 MB, sem SVG) e `documents` (privado, 20 MB, só admin).

## Chatbot

- `lib/ai/providers.ts`: interface `ChatProvider` com implementações Anthropic (SDK oficial) e OpenAI. Trocar de provedor = mudar no painel.
- Recuperação de informação: a cada pergunta, `search_knowledge` (Postgres full-text, sem custo extra) traz os itens mais relevantes da base; serviços e FAQ publicados entram como contexto. Evolução possível: embeddings (pgvector) quando a base crescer.
- Proteções: instruções fixas contra prompt injection; visitante nunca altera o prompt de sistema; sem acesso a dados financeiros/CRM (o bot só consulta base de conhecimento, serviços e FAQ); limite de mensagens por conversa; rate limit por IP e por visitante; orçamento mensal com alerta e corte automático para resposta estática; marcador de encaminhamento humano → fila em `/admin/chatbot/conversas?fila=1` + notificação.

## Design system

Cores extraídas da logomarca (pixels do arquivo oficial):

| Token | Hex | Origem |
|---|---|---|
| `navy-800` | `#0D3845` | letra **R** / texto principal |
| `petrol-500` | `#265A69` | “ASSESSORIA” e linha |
| `teal-500` | `#13A09B` | início do gradiente “COMUNICAÇÃO” |
| `turq-400` | `#34B4B2` | letra **B** / ação principal |
| `turq-300` | `#66C8C2` | fim do gradiente |
| `ink-900` | `#0B1418` | fundos escuros (como na apresentação comercial) |

Tipografia: **Montserrat** (títulos — mesma família da logo/apresentação) e **Inter** (texto), auto-hospedadas. Componentes: botões pill, cards com borda suave e brilho turquesa no hover, grade tecnológica sutil, motivo de barras do “O” da logo. A logo original (escura) é aplicada sobre placa branca em fundos escuros, como na apresentação — a identidade não foi alterada.
Gráficos: receitas `#13A09B` × despesas `#D9774B` (paleta validada para daltonismo).

## Decisões

- **Next.js 15.5** (estável) com Tailwind 4; sem bibliotecas de UI pesadas.
- **Formulários genéricos** (`lib/admin/resources.ts`): cada CRUD é descrito por campos; adicionar um campo novo é uma linha de configuração + migration.
- **Sem serviços pagos obrigatórios**: tudo funciona no plano gratuito do Supabase; IA e e-mail são opcionais e ativados por variável de ambiente.
