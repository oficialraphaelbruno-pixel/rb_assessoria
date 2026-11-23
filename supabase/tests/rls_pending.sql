-- Usuário logado sem aprovação (perfil "pending"). Tudo em rollback.
begin;
insert into auth.users (id, email, aud, role) values ('11111111-1111-1111-1111-111111111111', 'pendente-teste@example.com', 'authenticated', 'authenticated');
create temp table r(test text, result text) on commit drop;
grant all on r to authenticated;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
do $$
declare n int; t text; ok boolean;
begin
  update public.profiles set role='admin' where id = auth.uid(); get diagnostics n = row_count;
  insert into r values ('pendente se promove a admin', case when n=0 then 'PASS' else 'FAIL' end);
  foreach t in array array['leads','crm_clients','fin_transactions','chat_conversations','knowledge_items','documents','audit_log'] loop
    execute format('select count(*) from public.%I', t) into n;
    insert into r values ('pendente lê '||t, case when n=0 then 'PASS' else 'FAIL' end);
  end loop;
  update public.services set title='hack'; get diagnostics n = row_count;
  insert into r values ('pendente altera serviços', case when n=0 then 'PASS' else 'FAIL' end);
  begin insert into storage.objects(bucket_id,name,owner) values ('media','x/t.png',auth.uid()); insert into r values ('pendente envia mídia','FAIL');
  exception when others then insert into r values ('pendente envia mídia','PASS'); end;
  select public.is_staff() into ok; insert into r values ('is_staff() pendente', case when ok then 'FAIL' else 'PASS' end);
end $$;
reset role;
select * from r;
rollback;
