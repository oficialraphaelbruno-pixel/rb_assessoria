-- E-mail marketing: consentimento separado (LGPD) e status de sincronização com o Resend
alter table public.leads
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists audience text not null default 'outro' check (audience in ('clube','empresa','outro')),
  add column if not exists resend_contact_id text,
  add column if not exists resend_synced_at timestamptz,
  add column if not exists resend_error text;
create index if not exists leads_marketing_idx on public.leads (marketing_consent, audience) where marketing_consent;

-- Classificação automática do público pelo serviço/empresa informados
create or replace function public.classify_lead_audience(p_service text, p_company text, p_message text)
returns text language sql immutable set search_path = public as $$
  select case
    when lower(coalesce(p_service,'') || ' ' || coalesce(p_company,'') || ' ' || coalesce(p_message,''))
         ~ '(clube|escolinha|futebol|equipe|time |academia de futebol|categoria de base|peneira|sub-?[0-9]{2})' then 'clube'
    when coalesce(p_company,'') <> '' or coalesce(p_service,'') <> '' then 'empresa'
    else 'outro' end;
$$;

create or replace function public.leads_set_audience()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.audience = 'outro' then new.audience := public.classify_lead_audience(new.service, new.company, new.message); end if;
  elsif new.audience is not distinct from old.audience
        and (new.service is distinct from old.service or new.company is distinct from old.company) then
    new.audience := public.classify_lead_audience(new.service, new.company, new.message);
  end if;
  return new;
end $$;
drop trigger if exists t_leads_audience on public.leads;
create trigger t_leads_audience before insert or update on public.leads for each row execute function public.leads_set_audience();
update public.leads set audience = public.classify_lead_audience(service, company, message);

-- RPC pública: novo parâmetro de consentimento de marketing
drop function if exists public.submit_lead(text, text, text, text, text, text, boolean, text, jsonb, text);
create or replace function public.submit_lead(
  p_name text, p_email text, p_phone text, p_company text, p_service text,
  p_message text, p_consent boolean, p_source text default 'site',
  p_utm jsonb default '{}'::jsonb, p_landing_page text default null,
  p_marketing boolean default false
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_ip text := public.request_ip_hash();
begin
  if not public.hit_rate_limit('lead:' || v_ip, 8, 3600) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if p_consent is not true then
    raise exception 'consent_required' using errcode = 'P0001';
  end if;
  if length(trim(coalesce(p_name,''))) < 2 or length(p_name) > 120 then
    raise exception 'invalid_name' using errcode = 'P0001';
  end if;
  if p_email is null or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(p_email) > 200 then
    raise exception 'invalid_email' using errcode = 'P0001';
  end if;
  if length(coalesce(p_phone,'')) > 30 or length(coalesce(p_company,'')) > 160
     or length(coalesce(p_service,'')) > 120 or length(coalesce(p_message,'')) > 4000
     or length(coalesce(p_source,'')) > 40 or length(coalesce(p_landing_page,'')) > 300 then
    raise exception 'invalid_length' using errcode = 'P0001';
  end if;

  insert into public.leads (name, email, phone, company, service, message, source, utm,
                            landing_page, consent, consent_at, consent_text, ip_hash,
                            marketing_consent, marketing_consent_at)
  values (trim(p_name), lower(trim(p_email)), nullif(trim(p_phone),''), nullif(trim(p_company),''),
          nullif(trim(p_service),''), nullif(trim(p_message),''),
          coalesce(nullif(trim(p_source),''),'site'),
          coalesce(p_utm, '{}'::jsonb), p_landing_page, true, now(),
          'Autorizo a RB Assessoria & Comunicação a usar meus dados para retornar este contato, conforme a Política de Privacidade.',
          v_ip, coalesce(p_marketing, false), case when p_marketing then now() end)
  returning id into v_id;

  insert into public.notifications (kind, title, body, link)
  values ('lead', 'Novo lead: ' || trim(p_name), coalesce(nullif(trim(p_service),''), 'Solicitação pelo site'),
          '/admin/leads/' || v_id);
  return v_id;
end $$;
revoke execute on function public.submit_lead(text, text, text, text, text, text, boolean, text, jsonb, text, boolean) from public;
grant execute on function public.submit_lead(text, text, text, text, text, text, boolean, text, jsonb, text, boolean) to anon, authenticated;
