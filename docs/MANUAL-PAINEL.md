# Manual do painel administrativo

Acesse **seusite.com.br/admin** e entre com e-mail e senha. Esqueceu a senha? Use “Esqueci minha senha” na tela de login.

## Papéis

- **Administrador:** acesso total (site, leads, CRM, financeiro, chatbot, usuários).
- **Editor:** apenas o conteúdo do site (textos, serviços, clientes, FAQ, mídia). Não vê financeiro nem leads.
- Novos usuários são criados no Supabase (*Authentication → Users → Add user*) e entram **sem acesso** até um administrador definir o papel em **Sistema → Usuários**.

## Site

### Conteúdo do site
Cada bloco (topo da home, diferenciais, contatos, SEO, página do fundador, clubes, política de privacidade…) tem um formulário.
1. Edite e clique **Salvar rascunho** (não aparece no site).
2. **Pré-visualizar rascunho** abre o site com uma faixa amarela mostrando o rascunho (só você vê).
3. **Publicar** coloca no ar imediatamente — não precisa de novo deploy.
4. **Histórico de versões**: restaure qualquer versão anterior como rascunho.
5. Em **Seções visíveis na página inicial** você liga/desliga seções inteiras.

### Serviços, Planos SaaS, Perguntas frequentes
Lista com busca. Botões **Publicar/Ocultar** em cada linha. No formulário: textos, tópicos, entregas, ícone, imagem, SEO, ordem de exibição.
Planos: deixe o **preço vazio** para exibir “Sob consulta”. Os planos só aparecem no site quando publicados.

### Clientes & Projetos
Cadastre nome, segmento, categoria, logomarca, foto de capa, galeria, descrição, serviços prestados, resultados, links (Instagram, site e adicionais), destaque e ordem.
- Os clientes **IMEF, Samuel do Carmo, Manu Aguilar e Júlia Santos Epil já estão cadastrados como rascunho**, com textos e números da apresentação comercial. Confira, adicione as imagens e clique **Publicar** quando tiver autorização de cada cliente.
- Só publique resultados reais e com fonte.

### Planos
Em **Site → Planos** ficam os planos Bronze, Prata, Ouro e Ultra Diamante (nome, descrição, recursos, preço, destaque). Deixe o preço vazio para exibir “Sob consulta”. Eles aparecem em **/planos** (com tabela comparativa) e na página inicial. Os textos da página ficam em **Conteúdo do site → Página de planos**.

### Depoimentos
Em **Site → Depoimentos** cadastre depoimentos reais de clientes (com autorização). A seção aparece na página inicial assim que houver ao menos um publicado.

### Biblioteca de mídia
Arraste imagens (JPG, PNG, WebP, AVIF, GIF). Elas são **otimizadas automaticamente** (WebP, máx. 2000 px). Clique na imagem para editar nome, **texto alternativo** (importante para acessibilidade e Google) e categoria. Ao excluir, o sistema avisa se a imagem está em uso.
Em qualquer campo de imagem dos formulários, use **Escolher / enviar imagem**.

## Comercial

### Leads (funil)
Novo lead → Contato iniciado → Qualificado → Proposta enviada → Negociação → Cliente fechado / Perdido.
- **Funil:** arraste os cards entre colunas (ou use o seletor no card). **Lista:** visão em tabela. Filtros por origem e busca.
- Leads chegam do formulário do site, do chatbot (“Deixar meu contato”) e do webhook (ManyChat/anúncios). Também dá para cadastrar manualmente (**Novo lead**).
- No lead: editar dados, valor estimado, observações, **histórico comercial** (ligação, WhatsApp, reunião, proposta), origem/UTM e consentimento.
- **Converter em cliente** cria o cliente no CRM. **Excluir** atende pedidos de exclusão de dados (LGPD).
- **Exportar CSV** baixa a lista (abre no Excel).

### Importar planilhas (Leads e Clientes)
1. Em **Leads → Importar planilha** (ou **Clientes (CRM) → Importar planilha**), clique em **Baixar modelo (.xlsx)**. Os modelos também estão na pasta `modelos/` do repositório.
2. Preencha a aba “Leads” (ou “Clientes”) a partir da linha 2, uma linha por contato. Use as listas suspensas de Tipo, Origem, Etapa e Status. A aba “Instruções” explica cada coluna.
3. Envie o arquivo (.xlsx ou .csv), clique em **Validar** para ver erros linha a linha e depois em **Importar**.
4. Contatos que já existem (mesmo e-mail ou WhatsApp; no CRM também o mesmo nome) podem ser **ignorados** ou **atualizados**.
5. Dica: a planilha exportada tem as mesmas colunas do modelo. Exporte, edite no Excel e importe de volta.

Colunas do modelo de Leads: Nome do contato*, Empresa / equipe, E-mail, WhatsApp, Cidade / UF, Tipo, Serviço de interesse, Origem, Etapa do funil, Valor estimado, Próximo retorno, Observações, Autorizou contato?, Aceita e-mails de marketing?
Colunas do modelo de Clientes: Nome*, Empresa / equipe, E-mail, Telefone / WhatsApp, Cidade / UF, Serviço contratado, Valor mensal, Data de início, Dia de vencimento, Status, Observações.

### Retornos (follow-up)
Na ficha do lead, preencha **Próximo retorno**. No dia marcado (ou se atrasar) o lead aparece no topo do **Dashboard** em “Retornos para hoje”, fica destacado no funil e entra no resumo diário de notificações.

### Planilhas de contatos
Em **Leads → Exportar planilha** escolha: todos, só clubes e escolinhas, só empresas, só leads novos ou só quem aceita e-mails. O arquivo abre no Excel/Google Planilhas com nome, empresa/equipe, e-mail, WhatsApp (com link pronto para abrir a conversa), serviço, mensagem, tipo, origem, campanha e etapa. Em **Clientes (CRM)** também há **Exportar planilha**.

### E-mail marketing
- No formulário do site há uma opção (separada e opcional) “Quero receber por e-mail conteúdos, novidades e oportunidades”. Quem marca entra automaticamente no Resend, no segmento **RB — Leads do site (todos)**, com o tipo (clube/escolinha ou empresa), empresa e serviço.
- A página **E-mail marketing** mostra a base, filtros por tipo, status de envio ao Resend e exportação.
- Na ficha do lead: **Registrar consentimento** (quando a pessoa autorizou por outro canal) e **Remover da base** (descadastra no Resend).
- Para disparar uma campanha, peça ao Claude informando público, assunto e mensagem: ele monta no Resend e só envia após sua aprovação. É necessário um domínio próprio da RB verificado no Resend.

### Tráfego (Meta Ads)
Investimento, alcance, cliques, CTR, CPC, leads e custo por lead de cada campanha, mais os leads do site vindos da Meta (por UTM). Configuração em `docs/META-ADS.md`.

### Clientes (CRM)
Nome, empresa, contatos, serviço, valor mensal, início, dia de vencimento, status e observações. Na ficha: histórico, projetos e pagamentos.

### Projetos
Projetos por cliente, com status, início e prazo.

### Documentos
Contratos, propostas e arquivos em área **privada**. O download gera link temporário (5 min) e fica registrado na auditoria.

## Financeiro

- **Visão geral:** previsto x realizado do mês, saldo, MRR (soma das mensalidades ativas), fluxo de caixa de 12 meses, despesas por categoria, inadimplência e contas vencidas.
- **Gerar mensalidades do mês:** cria lançamentos “previsto” para clientes ativos com valor mensal.
- **Lançamentos → Novo lançamento:** conta a receber ou a pagar, categoria, cliente, despesa fixa/variável, recorrência mensal (gera os próximos meses).
- **Dar baixa:** abra o lançamento, informe data e valor efetivos e marque a confirmação. **Nada é considerado pago sem essa confirmação.** É possível desfazer a baixa.
- Status: **Previsto**, **Vencido** (previsto com data passada), **Pago/Recebido**, **Cancelado**.
- **Importar extrato:** exporte o extrato do BTG Empresas em OFX (ou CSV com colunas Data, Descrição, Valor) e importe. Para cada linha: vincular a um previsto (dá baixa), criar lançamento já pago, ou ignorar. O sistema **não** acessa sua conta bancária nem faz Pix/transferências.
- **Exportar CSV** do mês ou completo.

## Chatbot IA

- **Configurações e custos:** ativar/desativar, provedor e modelo, nome, boas-vindas, tom, regras, resposta estática, limites (mensagens por conversa, tamanho da resposta, **limite mensal em US$** e % de alerta) e preços por token para a estimativa.
- **Base de conhecimento:** o que o bot sabe. Escreva itens objetivos (serviços, como funciona, políticas, preços quando quiser divulgar). Desative um item para o bot parar de usá-lo.
- **Conversas:** histórico completo, custo por conversa e **fila humana** (casos que precisam de você). Em cada resposta: **Corrigir resposta** — a correção pode virar item oficial da base. **Marcar como atendido** tira da fila.
- **Testar o bot:** converse como visitante antes de ativar.
- Ao atingir o limite mensal, o bot passa a responder a mensagem estática (com botões de contato e WhatsApp) e você recebe notificação.

## Sistema

- **Notificações:** novos leads, fila humana, alertas de consumo da IA e vencimentos (resumo diário).
- **Integrações:** status das variáveis de ambiente e canais (ManyChat, WhatsApp, Instagram, Meta Ads, Google Ads, e-mail). Ativar um canal apenas libera o recebimento de leads com essa origem.
- **Auditoria:** quem fez o quê e quando.
