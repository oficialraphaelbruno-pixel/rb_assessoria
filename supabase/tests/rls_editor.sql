-- Editor (somente conteúdo do site). Tudo em rollback.
begin;
insert into auth.users (id, email, aud, role) values ('22222222-2222-2222-2222-222222222222', 'editor-teste@example.com', 'authenticated', 'authenticated');
update public.profiles set role = 'editor' where id = '22222222-2222-2222-2222-222222222222';
create temp table r(test text, result text) on commit drop;
grant all on r to authenticated;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
do $$
declare n int; t text;
begin
  foreach t in array array['leads','crm_clients','fin_transactions','bank_statement_lines','chat_settings','chat_conversations','documents','notifications'] loop
    execute format('select count(*) from public.%I', t) into n;
    insert into r values ('editor lê '||t, case when n=0 then 'PASS' else 'FAIL' end);
  end loop;
  update public.faqs set sort_order = sort_order where true; get diagnostics n = row_count;
  insert into r values ('editor pode editar FAQ', case when n>0 then 'PASS' else 'FAIL' end);
  update public.profiles set role='admin' where id = auth.uid(); get diagnostics n = row_count;
  insert into r values ('editor se promove a admin', case when n=0 then 'PASS' else 'FAIL' end);
end $$;
reset role;
select * from r;
rollback;
