# Custos, limites e integrações

Valores de referência de novembro/2026 — confirme sempre na página oficial antes de contratar. **Nenhum serviço pago foi contratado.**

| Serviço | Plano atual | Custo | Limites relevantes | Quando pagar |
|---|---|---|---|---|
| Supabase | Free | US$ 0 | 500 MB de banco, 1 GB de Storage, 50 mil usuários ativos/mês, **projeto pausa após 7 dias sem uso**, sem backups diários acessíveis, máx. 2 projetos gratuitos ativos (a conta já usa 2: Júlia + RB) | Pro (US$ 25/mês) quando o site estiver em produção com tráfego, para evitar pausa e ter backups diários |
| Vercel | Hobby | US$ 0 | **O plano Hobby é para uso não comercial** pelos termos da Vercel | Pro (US$ 20/mês por membro) para o site comercial em produção |
| GitHub | Free | US$ 0 | Repositórios privados e Actions com cota mensal | — |
| Domínio | — | ~R$ 40/ano (.com.br no Registro.br) | — | Ao publicar |
| Resend (e-mail) | Opcional | US$ 0 até 3.000 e-mails/mês (100/dia) | Exige domínio verificado | Só se o volume crescer |
| IA do chatbot | Opcional | por uso (abaixo) | — | Ao ativar o chatbot |

## IA: OpenAI x Anthropic

| Modelo | Entrada (US$/1M tokens) | Saída (US$/1M tokens) | Custo estimado por conversa* |
|---|---|---|---|
| **Claude Haiku 5.5** (Anthropic) | 0,10 | 0,50 | ~US$ 0,002 |
| GPT-4o mini (OpenAI) | 0,15 | 0,60 | ~US$ 0,003 |
| GPT-5 mini (OpenAI) | 0,25 | 2,00 | ~US$ 0,007 |
| Claude Sonnet 5.5 (Anthropic) | 2,00 | 10,00 | ~US$ 0,04 |

\* Conversa típica de 6 mensagens com ~2.500 tokens de contexto por mensagem e respostas curtas. Preços OpenAI obtidos de fontes secundárias atualizadas em set–out/2026; confirme em platform.openai.com/pricing.

**Recomendação:** começar com **Claude Haiku 5.5** — na análise de custo ele saiu mais barato que os modelos “mini” da OpenAI, com qualidade adequada para atendimento com base de conhecimento. Por isso, a análise **não confirmou** a preferência inicial pela OpenAI. A troca de provedor é feita no painel (camada de abstração pronta, as duas integrações estão implementadas). Com o limite padrão de US$ 5/mês, isso cobre ~2.000 conversas.

Importante: assinaturas **ChatGPT Plus / Claude Pro não dão créditos de API**. É preciso criar conta de API (console.anthropic.com ou platform.openai.com), cadastrar cartão e gerar uma chave.

## BTG Empresas

Não foi localizada documentação pública e oficial de API do BTG Empresas acessível para conta PJ comum. Há menções a um “API Portal” e integrações via ERPs parceiros (Omie, Conta Azul, Senior), normalmente para extrato e boletos, mediante contratação/habilitação pelo banco. **Não presumimos disponibilidade.** Implementado: financeiro manual + importação de extrato **OFX/CSV** exportado do internet banking, com conciliação manual. Próximo passo, se desejar: perguntar ao gerente do BTG sobre acesso ao API Portal (somente leitura de extrato). Nenhuma movimentação bancária, Pix ou pagamento automático foi implementado.

## Integrações futuras (preparadas, não ativadas)

- **ManyChat / formulários de anúncios / Zapier / Make:** webhook `/api/webhooks/leads` com token. ManyChat Pro ~US$ 15/mês (pago pelo cliente/RB).
- **WhatsApp Business Platform:** requer número dedicado e aprovação da Meta; cobrança por conversa iniciada.
- **Meta Ads / Google Ads:** Pixel e GA4 configuráveis no painel (carregam só após consentimento); UTMs gravados em cada lead; evento `generate_lead` disparado no envio do formulário.
