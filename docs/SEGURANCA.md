# Segurança e LGPD

> Nenhum sistema é totalmente seguro. Este documento lista os controles implementados, os riscos conhecidos e as ações pendentes.

## Controles implementados

| Tema | Como |
|---|---|
| Autenticação | Supabase Auth (senha + recuperação por e-mail). Sessão validada no servidor (`auth.getUser()`), não apenas pelo cookie. URL do painel não é tratada como proteção. |
| Autorização | Papéis em `profiles` (pending/editor/admin). Verificação em toda página e server action + **RLS em todas as tabelas**. Editor não acessa leads/CRM/financeiro/chatbot. |
| RLS | Leitura pública somente de conteúdo **publicado**; `site_settings.draft` é invisível para anônimos (permissão por coluna). Leads, CRM, financeiro, conversas, documentos: só admin. |
| Segredos | Chave secreta do Supabase e chaves de IA apenas em variáveis de ambiente do servidor; `.env*` no `.gitignore`; varredura gitleaks no CI. |
| SQL injection | Acesso via PostgREST/supabase-js com parâmetros; funções SQL com `search_path` fixo; buscas sanitizadas. |
| XSS | React escapa saída; sem HTML bruto de usuários; links do CMS passam por `safeUrl` (bloqueia `javascript:`/`data:`); SVG proibido no upload; JSON-LD com `<` escapado; CSP restritiva. |
| CSRF | Server actions do Next verificam origem; rotas públicas checam `Origin`; cookies de sessão `SameSite`. |
| Validação | zod nas rotas públicas; validação por tipo de campo nas server actions; limites de tamanho no banco (RPC). |
| Rate limiting | Tabela `rate_limits` (janela fixa) por IP com hash salgado: formulário 5/h, chat 30/10 min por IP e 80/dia por visitante, lead do chat 5/h. Honeypot anti-spam. |
| Upload | Buckets com tipos MIME e tamanho limitados; escrita só para equipe (policies de Storage); documentos em bucket privado com links assinados de 5 min. |
| APIs | Webhook com token (comparação em tempo constante); cron com `CRON_SECRET`; chatbot nunca expõe configuração interna. |
| IA | Prompt fixo contra injeção; sem acesso a dados internos; limites de custo; resposta estática em falha. |
| Auditoria | `audit_log` para criação/edição/publicação/exclusão, baixas financeiras, exportações e downloads. |
| Erros | Mensagens genéricas ao usuário; detalhes só no log do servidor. |
| Cabeçalhos | CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy; `/admin` com `noindex` e `no-store`. |
| LGPD | Consentimento obrigatório e registrado (data e texto) em cada lead; política de privacidade editável; exclusão definitiva de lead; cookies de analytics só após aceite; IPs armazenados apenas como hash. |
| Financeiro | Nenhuma integração de pagamento/transferência. Baixa exige confirmação explícita; constraint no banco impede “pago” sem data e responsável. |

## Riscos identificados e mitigação

| Risco | Situação |
|---|---|
| Cadastro público no Supabase Auth habilitado por padrão | Novos usuários entram como `pending` (sem acesso), mas **recomenda-se desativar** “Allow new users to sign up” em Authentication → Providers → Email. **Pendente (manual).** |
| Proteção de senhas vazadas / MFA | Ativar “Leaked password protection” e, se desejar, MFA no Supabase. **Pendente (manual).** |
| Rate limit por IP compartilhado | Redes corporativas podem compartilhar IP; limites foram dimensionados com folga. |
| `script-src 'unsafe-inline'` na CSP | Necessário para scripts inline do Next e do GA/Pixel. Evolução: CSP com nonce. |
| Plano gratuito do Supabase sem backup automático diário acessível | Ver “Backup” em DEPLOY.md (dump periódico). |
| Projeto Supabase criado na organização “Julia Santos Epil” | É um projeto **separado** (não altera o da Júlia), mas compartilha a organização/cota gratuita. Pode ser transferido para uma organização própria da RB depois. |
| Dependência do provedor de IA | Camada de abstração + resposta estática + corte por orçamento. |

## Testes executados (23/11/2026)

**Permissões no banco (RLS)**: 68/68 aprovados, simulando cada papel dentro do Postgres (scripts em `supabase/tests/`):
- Visitante anônimo: não lê nenhuma das 21 tabelas/visões privadas, não vê rascunhos, não escreve, não executa funções internas, não envia arquivos; formulário público rejeita dados inválidos.
- Usuário logado sem aprovação: não consegue se promover a administrador, não lê dados, não forja auditoria, não envia mídia.
- Editor: edita conteúdo, mas não acessa leads, CRM, financeiro, chatbot, documentos ou notificações.

**HTTP (servidor de produção local)**: todas as rotas do painel e exportações redirecionam para o login sem sessão; APIs rejeitam outra origem (403), JSON inválido (400), dados inválidos (422); webhook e cron exigem token (401); pré-visualização exige login; sem *open redirect* no callback; cabeçalhos de segurança presentes; `/admin` com `noindex` e `no-store`; configuração do chatbot não expõe regras.
- Corrigido: o campo anti-spam (honeypot) revelava o motivo da recusa; agora o envio de robôs recebe resposta de sucesso e é descartado.
- Corrigido: leitura de planilhas Excel re-salvas por outros programas (notas no cabeçalho quebravam a leitura).

**Dependências**: `npm audit` = 0 vulnerabilidades (versões corrigidas de `postcss` e `uuid` forçadas via *overrides*).

**Testes automatizados**: 22 (vitest), incluindo importação/exportação de planilhas.

## Testes anteriores

- 16 testes automatizados (`npm test`): conversão de valores, bloqueio de URLs perigosas, CSV injection, parser OFX/CSV, validação do formulário (consentimento, honeypot, limites), validação do chat, regras do prompt e cálculo de custo.
- Typecheck estrito e build de produção.
- Advisors de segurança do Supabase (ver relatório da etapa).
