-- Visitante anônimo. Rodar no SQL Editor; tudo em rollback.
begin;
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
create temp table r(test text, result text) on commit drop;
grant all on r to anon;
do $$
declare n int; t text; ok boolean;
begin
  foreach t in array array['leads','lead_activities','crm_clients','client_history','projects','fin_categories','fin_transactions','bank_statement_lines','chat_settings','knowledge_items','chat_conversations','chat_messages','notifications','integrations','rate_limits','audit_log','content_revisions','documents','profiles','v_fin_transactions','v_ai_usage_monthly'] loop
    begin
      execute format('select count(*) from public.%I', t) into n;
      insert into r values ('leitura anon: '||t, case when n=0 then 'PASS (0 linhas)' else 'FAIL ('||n||')' end);
    exception when insufficient_privilege then insert into r values ('leitura anon: '||t, 'PASS (sem permissão)');
    end;
  end loop;
  foreach t in array array['services','plans','faqs','portfolio_clients','testimonials'] loop
    execute format('select count(*) from public.%I where status <> ''published''', t) into n;
    insert into r values ('anon vê rascunhos de '||t, case when n=0 then 'PASS' else 'FAIL' end);
  end loop;
  begin perform draft from public.site_settings limit 1; insert into r values ('anon lê site_settings.draft','FAIL');
  exception when insufficient_privilege then insert into r values ('anon lê site_settings.draft','PASS'); end;
  begin insert into public.leads(name,email) values ('x','x@x.com'); insert into r values ('anon insere lead direto','FAIL');
  exception when others then insert into r values ('anon insere lead direto','PASS'); end;
  update public.site_settings set label='hack' where key='hero'; get diagnostics n = row_count;
  insert into r values ('anon altera site_settings', case when n=0 then 'PASS' else 'FAIL' end);
  update public.profiles set role='admin'; get diagnostics n = row_count;
  insert into r values ('anon escala papel', case when n=0 then 'PASS' else 'FAIL' end);
  begin perform public.search_knowledge('preço'); insert into r values ('anon executa search_knowledge','FAIL');
  exception when insufficient_privilege then insert into r values ('anon executa search_knowledge','PASS'); end;
  begin perform public.hit_rate_limit('x',1,60); insert into r values ('anon executa hit_rate_limit','FAIL');
  exception when insufficient_privilege then insert into r values ('anon executa hit_rate_limit','PASS'); end;
  select public.is_admin() into ok; insert into r values ('is_admin() anon', case when ok then 'FAIL' else 'PASS' end);
  begin perform public.submit_lead('Teste','t@t.com','','','','',false); insert into r values ('submit_lead sem consentimento','FAIL');
  exception when others then insert into r values ('submit_lead sem consentimento','PASS'); end;
  begin insert into storage.objects(bucket_id,name) values ('media','x/teste.png'); insert into r values ('anon grava no bucket media','FAIL');
  exception when others then insert into r values ('anon grava no bucket media','PASS'); end;
end $$;
select * from r;
rollback;
