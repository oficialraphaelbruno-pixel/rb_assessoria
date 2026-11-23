import Link from "next/link";
import { ArrowRight, BarChart3, Bot, CalendarCheck, CircleAlert, Megaphone, Monitor, Quote } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { ClientLogos, CmsImage, ContactSection, FaqList, PlansGrid, PortfolioCard, ServiceCard } from "@/components/site/blocks";
import { Icon } from "@/components/ui/icon";
import { getFaqs, getPlans, getPortfolio, getServices, getSettings, getTestimonials } from "@/lib/content";
import { safeUrl } from "@/lib/utils";

export default async function HomePage() {
  const [s, services, portfolio, faqs, plans, testimonials] = await Promise.all([getSettings(), getServices(), getPortfolio(), getFaqs(), getPlans(), getTestimonials()]);
  const show = s.home_sections;
  const homeServices = services.filter((x) => x.show_on_home);
  const homeFaqs = faqs.filter((f) => f.show_on_home);
  const featured = portfolio.filter((p) => p.featured).length ? portfolio.filter((p) => p.featured) : portfolio;
  const heroImage = safeUrl(s.hero.image_url);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink-900 text-white">
        <div className="grid-tech pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" aria-hidden />
        <div className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-teal-500/25 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-[360px] w-[360px] rounded-full bg-petrol-500/40 blur-[120px]" aria-hidden />
        <div className="container-rb relative grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-12 lg:py-32">
          <div className="lg:col-span-7">
            {s.hero.eyebrow && <p className="eyebrow animate-fade-up text-turq-300">{s.hero.eyebrow}</p>}
            <h1 className="mt-5 animate-fade-up text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl" style={{ animationDelay: "80ms" }}>
              {s.hero.title}
            </h1>
            {s.hero.subtitle && <p className="mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-white/70 sm:text-xl" style={{ animationDelay: "160ms" }}>{s.hero.subtitle}</p>}
            <div className="mt-10 flex animate-fade-up flex-col gap-3 sm:flex-row" style={{ animationDelay: "240ms" }}>
              {s.hero.primary_cta_label && <Link href={s.hero.primary_cta_href || "/contato"} className="btn-primary px-7 py-3.5 text-base">{s.hero.primary_cta_label} <ArrowRight className="h-4 w-4" aria-hidden /></Link>}
              {s.hero.secondary_cta_label && <Link href={s.hero.secondary_cta_href || "/servicos"} className="btn-ghost px-7 py-3.5 text-base text-white">{s.hero.secondary_cta_label}</Link>}
            </div>
          </div>
          <div className="relative lg:col-span-5" aria-hidden={!heroImage}>
            {heroImage ? (
              <CmsImage src={heroImage} alt={s.brand.name} priority className="aspect-[4/5] w-full rounded-3xl border border-white/10" sizes="(min-width:1024px) 40vw, 100vw" />
            ) : (
              <HeroVisual />
            )}
          </div>
        </div>
      </section>

      {/* DESAFIO */}
      {show.challenge && s.challenge.items.length > 0 && (
        <section className="section bg-mist-50">
          <div className="container-rb">
            <SectionHeading eyebrow={s.challenge.eyebrow} title={s.challenge.title} />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {s.challenge.items.map((item, i) => (
                <Reveal as="li" key={item} delay={i * 50} className="flex gap-3 rounded-xl2 border border-mist-200 bg-white p-5">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-turq-400" aria-hidden />
                  <span className="text-navy-800">{item}</span>
                </Reveal>
              ))}
            </ul>
            {s.challenge.closing && <p className="mt-10 border-l-4 border-turq-400 pl-5 text-lg font-semibold italic text-navy-800">{s.challenge.closing}</p>}
          </div>
        </section>
      )}

      {/* SEGMENTOS */}
      {show.segments && s.segments.items.length > 0 && (
        <section className="section">
          <div className="container-rb">
            <SectionHeading eyebrow={s.segments.eyebrow} title={s.segments.title} center />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {s.segments.items.map((it, i) => (
                <Reveal key={it.title} delay={i * 60} className="group h-full rounded-xl2 border border-mist-200 bg-gradient-to-b from-white to-turq-50/60 p-6 transition hover:-translate-y-1 hover:border-turq-300 hover:shadow-glow">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-800 text-turq-300 transition group-hover:bg-turq-400 group-hover:text-ink-900"><Icon name={it.icon} className="h-5 w-5" /></span>
                  <h3 className="mt-5 font-bold text-navy-800">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-600">{it.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SERVIÇOS */}
      {show.services && homeServices.length > 0 && (
        <section className="section" id="servicos">
          <div className="container-rb">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="O que fazemos" title="Estratégia, criação e tecnologia no mesmo trabalho" />
              <Link href="/servicos" className="btn-ghost shrink-0">Todos os serviços <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {homeServices.map((x, i) => <ServiceCard key={x.id} s={x} index={i} />)}
              <Reveal delay={homeServices.length * 60} className="h-full">
                <Link href="/clubes-e-escolinhas" className="group flex h-full flex-col justify-between rounded-xl2 bg-gradient-to-br from-navy-800 to-petrol-500 p-7 text-white transition hover:-translate-y-1 hover:shadow-glow">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-turq-300">Novo</p>
                    <h3 className="mt-3 text-xl font-bold">Sites para clubes e escolinhas de futebol</h3>
                    <p className="mt-3 text-white/70">Site oficial com história, categorias, calendário, notícias e patrocinadores.</p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-turq-300">Conhecer <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden /></span>
                </Link>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* DIFERENCIAIS */}
      {show.differentials && s.differentials.items.length > 0 && (
        <section className="section relative overflow-hidden bg-navy-800 text-white">
          <div className="grid-tech pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <div className="container-rb relative">
            <SectionHeading eyebrow={s.differentials.eyebrow} title={s.differentials.title} dark />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {s.differentials.items.map((d, i) => (
                <Reveal key={d.title} delay={i * 60} className="card-dark h-full p-6">
                  <Icon name={d.icon} className="h-7 w-7 text-turq-300" />
                  <h3 className="mt-5 text-lg font-bold">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{d.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROCESSO */}
      {show.process && s.process.steps.length > 0 && (
        <section className="section">
          <div className="container-rb">
            <SectionHeading eyebrow={s.process.eyebrow} title={s.process.title} center />
            <ol className="relative mt-14 grid gap-8 md:grid-cols-5">
              <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-turq-300 to-transparent md:block" aria-hidden />
              {s.process.steps.map((st, i) => (
                <Reveal as="li" key={st.title} delay={i * 80} className="relative text-center">
                  <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-turq-400 font-display text-lg font-bold text-ink-900 ring-8 ring-white">{i + 1}</span>
                  <h3 className="mt-5 font-bold text-navy-800">{st.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-600">{st.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* PORTFÓLIO */}
      {show.portfolio && featured.length > 0 && (
        <section className="section bg-mist-50">
          <div className="container-rb">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="Portfólio" title="Experiência aplicada a segmentos diferentes" text="Cada cliente tem uma realidade. A estratégia precisa respeitar essa diferença." />
              <Link href="/clientes-e-projetos" className="btn-ghost shrink-0">Ver todos <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 6).map((c, i) => <PortfolioCard key={c.id} c={c} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* CLIENTES (logos) */}
      {show.clients && portfolio.some((c) => c.logo_url) && (
        <section className="border-y border-mist-200 py-14">
          <div className="container-rb">
            <p className="mb-8 text-center text-sm font-semibold uppercase tracking-[0.18em] text-mist-400">Clientes atendidos</p>
            <ClientLogos clients={portfolio} />
          </div>
        </section>
      )}

      {/* DEPOIMENTOS */}
      {show.testimonials && testimonials.length > 0 && (
        <section className="section relative overflow-hidden bg-ink-900 text-white">
          <div className="grid-tech pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <div className="container-rb relative">
            <SectionHeading eyebrow="Depoimentos" title="O que dizem os clientes da RB" dark center />
            <div className={`mt-12 grid gap-6 ${testimonials.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
              {testimonials.slice(0, 6).map((t, i) => (
                <Reveal key={t.id} delay={i * 80} className="card-dark flex h-full flex-col p-7">
                  <Quote className="h-8 w-8 text-turq-400" aria-hidden />
                  <blockquote className="mt-4 flex-1 leading-relaxed text-white/85">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    {t.photo_url && <CmsImage src={t.photo_url} alt={t.author_name} className="h-11 w-11 shrink-0 rounded-full" sizes="44px" />}
                    <span><span className="block font-semibold">{t.author_name}</span><span className="text-sm text-white/60">{[t.author_role, t.company].filter(Boolean).join(" · ")}</span></span>
                  </figcaption>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SAAS */}
      {show.saas && s.saas.title && (
        <section className="section">
          <div className="container-rb">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <SectionHeading eyebrow={s.saas.eyebrow} title={s.saas.title} text={s.saas.text} />
                {s.saas.cta_label && <Link href={s.saas.cta_href || "/servicos/sistemas-saas"} className="btn-dark mt-8">{s.saas.cta_label} <ArrowRight className="h-4 w-4" aria-hidden /></Link>}
              </div>
              <Reveal className="grid grid-cols-2 gap-4">
                {[["Agenda online", CalendarCheck], ["Página personalizada", Monitor], ["Gestão de clientes", BarChart3], ["Automação de avisos", Bot]].map(([label, I], i) => {
                  const C = I as typeof CalendarCheck;
                  return (
                    <div key={label as string} className={`card p-6 ${i % 2 ? "translate-y-6" : ""}`}>
                      <C className="h-6 w-6 text-teal-500" aria-hidden />
                      <p className="mt-4 font-semibold text-navy-800">{label as string}</p>
                    </div>
                  );
                })}
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* PLANOS */}
      {show.plans && plans.length > 0 && (
        <section className="section bg-mist-50" id="planos">
          <div className="container-rb">
            <SectionHeading eyebrow={s.plans_page.eyebrow || "Planos"} title={s.plans_page.title} text={s.plans_page.subtitle} center />
            <div className="mt-12"><PlansGrid plans={plans} /></div>
            <p className="mt-8 text-center"><Link href="/planos" className="font-semibold text-teal-600 hover:underline">Comparar planos em detalhes →</Link></p>
          </div>
        </section>
      )}

      {/* SOBRE */}
      {show.about && s.about.title && (
        <section className="section">
          <div className="container-rb grid gap-12 lg:grid-cols-2">
            <SectionHeading eyebrow={s.about.eyebrow} title={s.about.title} text={s.about.text} />
            <div className="flex flex-col justify-center gap-4">
              {s.about.pillars.map((p, i) => (
                <Reveal key={p} delay={i * 80} className="flex items-center gap-4 rounded-xl2 border border-mist-200 bg-white p-5">
                  <span className="font-display text-2xl font-bold text-turq-400">0{i + 1}</span>
                  <span className="font-semibold text-navy-800">{p}</span>
                </Reveal>
              ))}
              {s.founder.name && (
                <Link href="/quem-esta-por-tras-da-rb" className="group mt-2 flex items-center gap-4 rounded-xl2 bg-navy-800 p-4 text-white transition hover:bg-navy-700">
                  <CmsImage src={s.founder.photo_url} alt={s.founder.photo_alt || s.founder.name} className="h-16 w-16 shrink-0 rounded-full border-2 border-turq-400" sizes="64px" />
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wider text-turq-300">Quem está por trás da RB</span>
                    <span className="block font-semibold">{s.founder.name}{s.founder.role ? ` · ${s.founder.role}` : ""}</span>
                    {s.founder.quote && <span className="mt-0.5 line-clamp-2 block text-sm text-white/70">“{s.founder.quote}”</span>}
                  </span>
                  <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-turq-300 transition group-hover:translate-x-1" aria-hidden />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {show.faq && homeFaqs.length > 0 && (
        <section className="section">
          <div className="container-rb grid gap-12 lg:grid-cols-3">
            <SectionHeading eyebrow="Perguntas frequentes" title="Dúvidas comuns antes de começar" />
            <div className="lg:col-span-2"><FaqList faqs={homeFaqs} /></div>
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org", "@type": "FAQPage",
            mainEntity: homeFaqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
          }).replace(/</g, "\\u003c") }} />
        </section>
      )}

      {/* CONTATO */}
      {show.contact && (
        <ContactSection title={s.cta_final.title || "Vamos conversar?"} text={s.cta_final.text} services={services.map((x) => x.title)} buttonLabel={s.cta_final.button_label} />
      )}
    </>
  );
}

/** Composição visual tecnológica (sem dados fictícios). */
function HeroVisual() {
  const chips = [
    { label: "Social Media", I: Megaphone, cls: "left-0 top-6" },
    { label: "Sites", I: Monitor, cls: "right-0 top-24" },
    { label: "Sistemas SaaS", I: CalendarCheck, cls: "left-4 bottom-24" },
    { label: "Automação com IA", I: Bot, cls: "right-2 bottom-6" },
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-10 rounded-full border border-turq-400/20" />
      <div className="absolute inset-20 rounded-full border border-turq-400/30" />
      <div className="absolute inset-[34%] flex items-end justify-center gap-[6%] rounded-full bg-gradient-to-br from-turq-400 to-teal-600 pb-[24%] shadow-glow">
        {[38, 60, 82].map((h) => <span key={h} className="block rounded-sm bg-ink-900/80" style={{ width: "13%", height: `${h * 0.55}%` }} />)}
      </div>
      {chips.map(({ label, I, cls }, i) => (
        <div key={label} className={`absolute ${cls} animate-float`} style={{ animationDelay: `${i * 1.2}s` }}>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium backdrop-blur-md">
            <I className="h-4 w-4 text-turq-300" /> {label}
          </div>
        </div>
      ))}
    </div>
  );
}
