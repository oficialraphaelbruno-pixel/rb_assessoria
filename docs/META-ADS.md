# Conectar o Meta Ads ao painel (área “Tráfego”)

O painel **só lê** os resultados das campanhas (investimento, alcance, cliques, CTR, CPC, leads). Ele não cria, altera nem pausa anúncios, e não mexe em pagamento.

## O que você precisa

- Um **Business Manager** (business.facebook.com) com a **conta de anúncios** da RB.
- 10 minutos.

## Passo a passo

1. **ID da conta de anúncios**
   Business Manager → *Configurações do negócio* → *Contas* → *Contas de anúncios*. Copie o número da conta (ex.: `1234567890123456`).

2. **Criar um app (uma vez só)**
   Acesse developers.facebook.com → *Meus apps* → *Criar app* → tipo **Empresa** (Business), vinculado ao seu Business Manager. Nome sugerido: “Painel RB”.
   No app, adicione o produto **Marketing API**.

3. **Criar um usuário do sistema** (o token dele não expira)
   Business Manager → *Configurações do negócio* → *Usuários* → *Usuários do sistema* → *Adicionar* → nome “Painel RB”, função **Funcionário**.
   Em *Atribuir ativos*: selecione a **conta de anúncios** com permissão **Ver desempenho** (só leitura) e o **app** “Painel RB”.

4. **Gerar o token**
   No usuário do sistema → *Gerar novo token* → escolha o app “Painel RB” → validade **Nunca expira** → marque a permissão **`ads_read`** → *Gerar*. Copie o token (aparece uma vez).

5. **Colocar na Vercel**
   Vercel → projeto `rb-assessoria` → *Settings* → *Environment Variables*:
   - `META_AD_ACCOUNT_ID` = número da conta (sem `act_`)
   - `META_ADS_ACCESS_TOKEN` = token (marque como **Sensitive**)
   Depois clique em **Redeploy**.

6. **Pixel (opcional, recomendado)**
   Gerenciador de Eventos → copie o **ID do Pixel** → no painel: *Conteúdo do site → Analytics e verificação → Meta Pixel ID*. O site envia o evento **Lead** a cada formulário enviado (após aceite de cookies).

7. **UTMs nos anúncios**
   No campo “Parâmetros de URL” do anúncio, use:
   `utm_source=instagram&utm_medium=paid&utm_campaign={{campaign.name}}`
   Assim cada lead do site aparece ligado à campanha certa na área Tráfego e na planilha exportada.

## Segurança

- Não compartilhe o token por chat ou e-mail. Ele fica somente nas variáveis da Vercel.
- Para revogar: Business Manager → Usuários do sistema → *Revogar tokens*.
