-- =====================================================================
-- RB Assessoria & Comunicação — schema inicial
-- Todas as tabelas com RLS. Escrita administrativa restrita a perfis
-- com role 'admin' ou 'editor' (editor não acessa financeiro/CRM).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------
-- Perfis e papéis
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'pending' check (role in ('pending','editor','admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.current_role_name()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'anon');
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin','editor'));
$$;

-- Usadas dentro de policies avaliadas também para anon (retornam false).
revoke execute on function public.current_role_name() from public;
grant execute on function public.current_role_name() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;

create policy "profiles: self read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "profiles: admin update" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Novo usuário => perfil 'pending' (sem acesso). Um admin promove depois.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Utilitário updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------------
-- Auditoria e histórico
-- ---------------------------------------------------------------------
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;
create policy "audit: admin read" on public.audit_log for select to authenticated using (public.is_admin());
create policy "audit: staff insert" on public.audit_log for insert to authenticated
  with check (public.is_staff() and actor = auth.uid());
create index on public.audit_log (created_at desc);

create table public.content_revisions (
  id bigint generated always as identity primary key,
  entity text not null,
  entity_id text not null,
  data jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.content_revisions enable row level security;
create policy "revisions: staff all" on public.content_revisions for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create index on public.content_revisions (entity, entity_id, created_at desc);

-- ---------------------------------------------------------------------
-- CMS
-- ---------------------------------------------------------------------
-- Configurações/textos do site em blocos chave -> JSON.
-- `published` é o que o site exibe; `draft` guarda edições não publicadas.
create table public.site_settings (
  key text primary key,
  label text not null,
  draft jsonb not null default '{}'::jsonb,
  published jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.site_settings enable row level security;
create policy "settings: public read" on public.site_settings for select to anon, authenticated using (true);
create policy "settings: staff write" on public.site_settings for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create trigger t_settings_upd before update on public.site_settings for each row execute function public.touch_updated_at();
-- anon só pode ler a coluna publicada
revoke select on public.site_settings from anon;
grant select (key, label, published, updated_at) on public.site_settings to anon;

create table public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  url text not null,
  name text not null,
  category text not null default 'geral',
  alt text not null default '',
  mime text,
  size_bytes integer,
  width integer,
  height integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.media enable row level security;
create policy "media: public read" on public.media for select to anon, authenticated using (true);
create policy "media: staff write" on public.media for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  eyebrow text,
  summary text not null default '',
  description text not null default '',
  features jsonb not null default '[]'::jsonb,     -- [{title, text}]
  deliverables jsonb not null default '[]'::jsonb, -- ["..."]
  icon text not null default 'sparkles',
  cover_url text,
  cta_label text,
  seo_title text,
  seo_description text,
  show_on_home boolean not null default true,
  has_page boolean not null default true,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.services enable row level security;
create policy "services: public published" on public.services for select to anon, authenticated
  using (status = 'published' or public.is_staff());
create policy "services: staff write" on public.services for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create trigger t_services_upd before update on public.services for each row execute function public.touch_updated_at();

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  product text not null default 'saas-agendamento',
  name text not null,
  tagline text,
  price_cents integer check (price_cents is null or price_cents >= 0), -- null = sob consulta
  setup_cents integer check (setup_cents is null or setup_cents >= 0),
  billing_period text not null default 'mensal' check (billing_period in ('mensal','anual','unico')),
  features jsonb not null default '[]'::jsonb,
  highlighted boolean not null default false,
  cta_label text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.plans enable row level security;
create policy "plans: public published" on public.plans for select to anon, authenticated
  using (status = 'published' or public.is_staff());
create policy "plans: staff write" on public.plans for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create trigger t_plans_upd before update on public.plans for each row execute function public.touch_updated_at();

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'geral',
  show_on_home boolean not null default true,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.faqs enable row level security;
create policy "faqs: public published" on public.faqs for select to anon, authenticated
  using (status = 'published' or public.is_staff());
create policy "faqs: staff write" on public.faqs for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create trigger t_faqs_upd before update on public.faqs for each row execute function public.touch_updated_at();

-- Clientes & Projetos (vitrine pública — diferente do CRM)
create table public.portfolio_clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  segment text,
  category text not null default 'geral',
  logo_url text,
  cover_url text,
  gallery jsonb not null default '[]'::jsonb,       -- [{url, alt}]
  summary text not null default '',
  description text not null default '',
  services jsonb not null default '[]'::jsonb,      -- ["Social Media", ...]
  metrics jsonb not null default '[]'::jsonb,       -- [{value, label}]
  metrics_source text,
  instagram_url text,
  website_url text,
  extra_links jsonb not null default '[]'::jsonb,   -- [{label, url}]
  featured boolean not null default false,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.portfolio_clients enable row level security;
create policy "portfolio: public published" on public.portfolio_clients for select to anon, authenticated
  using (status = 'published' or public.is_staff());
create policy "portfolio: staff write" on public.portfolio_clients for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create trigger t_portfolio_upd before update on public.portfolio_clients for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Leads / CRM
-- ---------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  service text,
  message text,
  stage text not null default 'novo' check (stage in
    ('novo','contato','qualificado','proposta','negociacao','fechado','perdido')),
  source text not null default 'site',          -- site, chatbot, instagram, whatsapp, manychat, indicacao, ads...
  utm jsonb not null default '{}'::jsonb,
  landing_page text,
  estimated_value_cents integer,
  consent boolean not null default false,
  consent_at timestamptz,
  consent_text text,
  ip_hash text,
  notes text,
  lost_reason text,
  crm_client_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.leads enable row level security;
create policy "leads: admin all" on public.leads for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create trigger t_leads_upd before update on public.leads for each row execute function public.touch_updated_at();
create index on public.leads (stage, created_at desc);
create index on public.leads (created_at desc);

create table public.lead_activities (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  kind text not null default 'nota' check (kind in ('nota','ligacao','whatsapp','email','reuniao','proposta','status')),
  content text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.lead_activities enable row level security;
create policy "lead_activities: admin all" on public.lead_activities for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create index on public.lead_activities (lead_id, created_at desc);

create table public.crm_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  phone text,
  email text,
  service text,
  monthly_value_cents integer not null default 0 check (monthly_value_cents >= 0),
  start_date date,
  due_day integer check (due_day between 1 and 31),
  status text not null default 'ativo' check (status in ('ativo','pausado','encerrado','prospect')),
  notes text,
  lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.crm_clients enable row level security;
create policy "crm_clients: admin all" on public.crm_clients for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create trigger t_crm_upd before update on public.crm_clients for each row execute function public.touch_updated_at();
alter table public.leads add constraint leads_crm_client_fk foreign key (crm_client_id) references public.crm_clients(id) on delete set null;

create table public.client_history (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.crm_clients(id) on delete cascade,
  content text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.client_history enable row level security;
create policy "client_history: admin all" on public.client_history for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.crm_clients(id) on delete set null,
  name text not null,
  description text,
  status text not null default 'ativo' check (status in ('planejado','ativo','pausado','concluido','cancelado')),
  start_date date,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
create policy "projects: admin all" on public.projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create trigger t_projects_upd before update on public.projects for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Financeiro (somente admin)
-- ---------------------------------------------------------------------
create table public.fin_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('receita','despesa')),
  created_at timestamptz not null default now(),
  unique (name, kind)
);
alter table public.fin_categories enable row level security;
create policy "fin_categories: admin all" on public.fin_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create table public.fin_transactions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('receita','despesa')),
  description text not null,
  category_id uuid references public.fin_categories(id) on delete set null,
  client_id uuid references public.crm_clients(id) on delete set null,
  amount_cents integer not null check (amount_cents > 0),
  due_date date not null,
  -- previsto: lançado e aguardando; pago: confirmado manualmente; cancelado.
  -- "vencido" é derivado (previsto com due_date < hoje).
  status text not null default 'previsto' check (status in ('previsto','pago','cancelado')),
  paid_at date,
  paid_amount_cents integer check (paid_amount_cents is null or paid_amount_cents > 0),
  confirmed_by uuid references auth.users(id) on delete set null,
  expense_type text check (expense_type in ('fixa','variavel')),
  recurrence text not null default 'nenhuma' check (recurrence in ('nenhuma','mensal')),
  recurrence_group uuid,
  payment_method text,
  notes text,
  bank_line_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint paid_requires_date check (status <> 'pago' or (paid_at is not null and confirmed_by is not null))
);
alter table public.fin_transactions enable row level security;
create policy "fin_transactions: admin all" on public.fin_transactions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create trigger t_fin_upd before update on public.fin_transactions for each row execute function public.touch_updated_at();
create index on public.fin_transactions (due_date);
create index on public.fin_transactions (status, kind);

-- Linhas importadas de extrato (CSV/OFX) para conciliação manual
create table public.bank_statement_lines (
  id uuid primary key default gen_random_uuid(),
  import_batch uuid not null,
  bank text not null default 'btg',
  posted_at date not null,
  description text not null,
  amount_cents integer not null,   -- positivo = crédito, negativo = débito
  fit_id text,                     -- id único do OFX quando houver
  status text not null default 'pendente' check (status in ('pendente','conciliado','ignorado')),
  transaction_id uuid references public.fin_transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (bank, fit_id)
);
alter table public.bank_statement_lines enable row level security;
create policy "bank_lines: admin all" on public.bank_statement_lines for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Chatbot / IA
-- ---------------------------------------------------------------------
create table public.chat_settings (
  id integer primary key default 1 check (id = 1),
  enabled boolean not null default false,
  provider text not null default 'anthropic' check (provider in ('anthropic','openai')),
  model text not null default 'claude-haiku-5-5',
  assistant_name text not null default 'Assistente RB',
  welcome_message text not null default 'Olá! Sou o assistente virtual da RB Assessoria & Comunicação. Como posso ajudar?',
  tone text not null default 'Cordial, claro, profissional e próximo. Português do Brasil. Respostas curtas (até 4 frases), sem jargões.',
  rules text not null default '',
  fallback_message text not null default 'No momento não consigo responder por aqui. Deixe seu contato no formulário ou fale pelo WhatsApp que a equipe da RB retorna em breve.',
  max_messages_per_conversation integer not null default 20 check (max_messages_per_conversation between 2 and 200),
  max_output_tokens integer not null default 500 check (max_output_tokens between 100 and 4000),
  monthly_budget_usd numeric(10,2) not null default 5.00 check (monthly_budget_usd >= 0),
  alert_threshold_pct integer not null default 80 check (alert_threshold_pct between 1 and 100),
  price_input_per_mtok numeric(10,4) not null default 0.10,
  price_output_per_mtok numeric(10,4) not null default 0.50,
  updated_at timestamptz not null default now()
);
alter table public.chat_settings enable row level security;
create policy "chat_settings: admin all" on public.chat_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.unaccent_immutable(text)
returns text language sql immutable parallel safe strict set search_path = public, extensions as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, $1)
$$;

create table public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null default 'geral',  -- servicos, precos, faq, empresa, politicas, documento
  active boolean not null default true,
  source_document text,
  search tsvector generated always as (
    setweight(to_tsvector('portuguese', unaccent_immutable(coalesce(title,''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent_immutable(coalesce(content,''))), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.knowledge_items enable row level security;
create policy "knowledge: admin all" on public.knowledge_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create index on public.knowledge_items using gin (search);
create trigger t_knowledge_upd before update on public.knowledge_items for each row execute function public.touch_updated_at();

create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  ip_hash text,
  page text,
  status text not null default 'aberta' check (status in ('aberta','encerrada')),
  needs_human boolean not null default false,
  handoff_reason text,
  handoff_resolved_at timestamptz,
  lead_id uuid references public.leads(id) on delete set null,
  message_count integer not null default 0,
  tokens_in integer not null default 0,
  tokens_out integer not null default 0,
  cost_usd numeric(12,6) not null default 0,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
alter table public.chat_conversations enable row level security;
create policy "conversations: admin all" on public.chat_conversations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create index on public.chat_conversations (last_message_at desc);
create index on public.chat_conversations (needs_human) where needs_human;

create table public.chat_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system_note')),
  content text not null,
  provider text,
  model text,
  tokens_in integer,
  tokens_out integer,
  cost_usd numeric(12,6),
  is_fallback boolean not null default false,
  flagged boolean not null default false,
  correction text,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
create policy "messages: admin all" on public.chat_messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create index on public.chat_messages (conversation_id, created_at);

-- Notificações internas do painel
create table public.notifications (
  id bigint generated always as identity primary key,
  kind text not null,          -- lead, chat_handoff, budget, vencimento
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "notifications: admin all" on public.notifications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create index on public.notifications (created_at desc);

-- Integrações futuras (ManyChat, WhatsApp, Meta Ads...). Sem segredos aqui:
-- tokens ficam em variáveis de ambiente do servidor.
create table public.integrations (
  key text primary key,
  name text not null,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  notes text,
  updated_at timestamptz not null default now()
);
alter table public.integrations enable row level security;
create policy "integrations: admin all" on public.integrations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Rate limiting (janela fixa) — usado por RPCs públicas e rotas de API
-- ---------------------------------------------------------------------
create table public.rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, window_start)
);
alter table public.rate_limits enable row level security;
-- sem policies: acessível apenas via funções security definer / service role

create or replace function public.hit_rate_limit(p_bucket text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  n integer;
begin
  insert into public.rate_limits as r (bucket, window_start, hits) values (p_bucket, w, 1)
  on conflict (bucket, window_start) do update set hits = r.hits + 1
  returning hits into n;
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;
  return n <= p_limit;
end $$;
revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;

create or replace function public.request_ip_hash()
returns text language plpgsql stable security definer set search_path = public, extensions as $$
declare
  h json;
  ip text;
begin
  begin
    h := current_setting('request.headers', true)::json;
  exception when others then h := null;
  end;
  ip := coalesce(h->>'cf-connecting-ip', split_part(coalesce(h->>'x-forwarded-for',''), ',', 1), 'unknown');
  return encode(extensions.digest('rb-salt:' || trim(ip), 'sha256'), 'hex');
end $$;
revoke execute on function public.request_ip_hash() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- RPC pública: envio do formulário de orçamento
-- Valida, aplica rate limit por IP e cria lead + notificação.
-- ---------------------------------------------------------------------
create or replace function public.submit_lead(
  p_name text, p_email text, p_phone text, p_company text, p_service text,
  p_message text, p_consent boolean, p_source text default 'site',
  p_utm jsonb default '{}'::jsonb, p_landing_page text default null
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
                            landing_page, consent, consent_at, consent_text, ip_hash)
  values (trim(p_name), lower(trim(p_email)), nullif(trim(p_phone),''), nullif(trim(p_company),''),
          nullif(trim(p_service),''), nullif(trim(p_message),''),
          coalesce(nullif(trim(p_source),''),'site'),
          coalesce(p_utm, '{}'::jsonb), p_landing_page, true, now(),
          'Autorizo a RB Assessoria & Comunicação a usar meus dados para retornar este contato, conforme a Política de Privacidade.',
          v_ip)
  returning id into v_id;

  insert into public.notifications (kind, title, body, link)
  values ('lead', 'Novo lead: ' || trim(p_name), coalesce(nullif(trim(p_service),''), 'Solicitação pelo site'),
          '/admin/leads/' || v_id);
  return v_id;
end $$;
revoke execute on function public.submit_lead from public;
grant execute on function public.submit_lead to anon, authenticated;

-- ---------------------------------------------------------------------
-- Busca na base de conhecimento (usada pelo chatbot no servidor)
-- ---------------------------------------------------------------------
create or replace function public.search_knowledge(p_query text, p_limit integer default 6)
returns table (id uuid, title text, content text, category text, rank real)
language sql stable security definer set search_path = public, extensions as $$
  with q as (
    select websearch_to_tsquery('portuguese', public.unaccent_immutable(p_query)) as tsq,
           to_tsquery('portuguese', coalesce(nullif(array_to_string(
             array(select lexeme || ':*' from unnest(to_tsvector('portuguese', public.unaccent_immutable(p_query))) ), ' | '), ''), 'x')) as tsq_or
  )
  select k.id, k.title, k.content, k.category,
         greatest(ts_rank(k.search, q.tsq), ts_rank(k.search, q.tsq_or) * 0.6)::real as rank
  from public.knowledge_items k, q
  where k.active and (k.search @@ q.tsq or k.search @@ q.tsq_or)
  order by rank desc
  limit greatest(1, least(p_limit, 12));
$$;
revoke execute on function public.search_knowledge(text, integer) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Visões para o dashboard e financeiro (respeitam RLS do chamador)
-- ---------------------------------------------------------------------
create or replace view public.v_fin_transactions with (security_invoker = true) as
select t.*,
  case when t.status = 'previsto' and t.due_date < current_date then 'vencido' else t.status end as effective_status,
  c.name as category_name,
  cl.name as client_name
from public.fin_transactions t
left join public.fin_categories c on c.id = t.category_id
left join public.crm_clients cl on cl.id = t.client_id;

create or replace view public.v_ai_usage_monthly with (security_invoker = true) as
select date_trunc('month', created_at)::date as month,
       count(*) filter (where role = 'assistant') as replies,
       coalesce(sum(tokens_in),0) as tokens_in,
       coalesce(sum(tokens_out),0) as tokens_out,
       coalesce(sum(cost_usd),0)::numeric(12,4) as cost_usd
from public.chat_messages
group by 1;

-- ---------------------------------------------------------------------
-- Storage: bucket público de mídia (escrita só para staff) e bucket
-- privado de documentos (contratos/propostas — só admin)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif','image/gif'])
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 20971520, array['application/pdf','image/jpeg','image/png','image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/csv','application/x-ofx','text/plain'])
on conflict (id) do nothing;

create policy "media bucket: staff insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());
create policy "media bucket: staff update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_staff());
create policy "media bucket: staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());
create policy "documents bucket: admin all" on storage.objects for all to authenticated
  using (bucket_id = 'documents' and public.is_admin())
  with check (bucket_id = 'documents' and public.is_admin());

-- Central de documentos (contratos, propostas) — arquivos no bucket privado
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  path text not null unique,
  kind text not null default 'outro' check (kind in ('contrato','proposta','briefing','nota_fiscal','extrato','outro')),
  client_id uuid references public.crm_clients(id) on delete set null,
  size_bytes integer,
  mime text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.documents enable row level security;
create policy "documents: admin all" on public.documents for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on public.v_fin_transactions from anon;
revoke all on public.v_ai_usage_monthly from anon;
