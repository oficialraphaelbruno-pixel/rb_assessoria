# Testes de permissão (RLS)

Os testes rodam **dentro do banco**, simulando cada papel com `set local role` e `request.jwt.claims`,
sempre em transação com `rollback` (não alteram dados). Execute no SQL Editor do Supabase.

- `rls_anon.sql` — visitante anônimo (chave pública): não lê dados privados, não vê rascunhos, não escreve, não executa funções internas.
- `rls_pending.sql` — usuário logado sem aprovação: não se promove a admin, não lê dados, não envia arquivos.
- `rls_editor.sql` — editor: edita conteúdo do site, mas não vê leads, CRM, financeiro, chatbot nem documentos.

Todas as linhas do resultado devem começar com `PASS`.
Última execução: 23/11/2026, 68/68 PASS.
