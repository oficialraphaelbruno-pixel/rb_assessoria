-- Cidade (prospecção por região) e próximo retorno (follow-up) nos leads; cidade no CRM
alter table public.leads add column if not exists city text;
alter table public.leads add column if not exists next_followup_at date;
create index if not exists leads_followup_idx on public.leads (next_followup_at) where next_followup_at is not null;
alter table public.crm_clients add column if not exists city text;

-- Depoimentos de clientes (aparecem no site só quando publicados)
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  company text,
  quote text not null,
  photo_url text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
drop policy if exists "testimonials: public published" on public.testimonials;
create policy "testimonials: public published" on public.testimonials for select to anon, authenticated
  using (status = 'published' or public.is_staff());
drop policy if exists "testimonials: staff write" on public.testimonials;
create policy "testimonials: staff write" on public.testimonials for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop trigger if exists t_testimonials_upd on public.testimonials;
create trigger t_testimonials_upd before update on public.testimonials for each row execute function public.touch_updated_at();

-- Seção "Segmentos atendidos" na home (conteúdo editável)
insert into public.site_settings (key, label, draft, published)
select 'segments', 'Segmentos atendidos', v, v from (select $j${
  "eyebrow": "Para quem trabalhamos",
  "title": "Experiência aplicada a realidades diferentes",
  "items": [
    {"title": "Esporte e futebol de base", "text": "Clubes, escolinhas, eventos esportivos e profissionais do esporte que precisam ser vistos e lembrados.", "icon": "trophy"},
    {"title": "Marcas pessoais", "text": "Treinadores, fotógrafos e especialistas que vivem da própria reputação.", "icon": "users"},
    {"title": "Negócios locais", "text": "Serviços com atendimento presencial ou hora marcada que querem mais clientes da região.", "icon": "target"},
    {"title": "Empresas em crescimento", "text": "Negócios que precisam organizar comunicação, site, atendimento e processos digitais.", "icon": "zap"}
  ]
}$j$::jsonb as v) t
on conflict (key) do nothing;
update public.site_settings
set draft = draft || '{"segments": true, "testimonials": true}'::jsonb,
    published = published || '{"segments": true, "testimonials": true}'::jsonb
where key = 'home_sections';
