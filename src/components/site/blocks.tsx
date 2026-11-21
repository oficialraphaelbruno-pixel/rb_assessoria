import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ImageIcon, Plus } from "lucide-react";
import { Instagram } from "@/components/ui/brand-icons";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { ContactForm } from "./contact-form";
import type { Faq, Plan, PortfolioClient, Service } from "@/lib/types";
import { cn, formatBRL, safeUrl } from "@/lib/utils";

/** Imagem vinda do painel (Supabase Storage ou /public), com placeholder neutro quando ausente. */
export function CmsImage({ src, alt, className, sizes = "100vw", priority, fit = "cover" }: {
  src?: string | null; alt: string; className?: string; sizes?: string; priority?: boolean; fit?: "cover" | "contain";
}) {
  const url = safeUrl(src);
  if (!url) {
    return (
      <div className={cn("flex items-center justify-center bg-gradient-to-br from-mist-100 to-turq-50 text-mist-400", className)} role="img" aria-label={alt}>
        <ImageIcon className="h-8 w-8" aria-hidden />
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image src={url} alt={alt} fill sizes={sizes} priority={priority} className={fit === "cover" ? "object-cover" : "object-contain"} />
    </div>
  );
}

export function ServiceCard({ s, index = 0 }: { s: Service; index?: number }) {
  return (
    <Reveal delay={index * 60} className="h-full">
      <Link href={`/servicos/${s.slug}`} className="group relative flex h-full flex-col overflow-hidden rounded-xl2 border border-mist-200 bg-white p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:border-turq-300 hover:shadow-glow">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-turq-50 text-teal-500 transition group-hover:bg-turq-400 group-hover:text-ink-900">
          <Icon name={s.icon} className="h-6 w-6" />
        </span>
        <h3 className="mt-6 text-xl font-bold text-navy-800">{s.title}</h3>
        <p className="mt-3 flex-1 leading-relaxed text-mist-600">{s.summary}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600">
          Saiba mais <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
        </span>
      </Link>
    </Reveal>
  );
}

export function PortfolioCard({ c, index = 0 }: { c: PortfolioClient; index?: number }) {
  return (
    <Reveal delay={index * 60} className="h-full">
      <Link href={`/clientes-e-projetos/${c.slug}`} className="group flex h-full flex-col overflow-hidden rounded-xl2 border border-mist-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-glow">
        <div className="relative">
          <CmsImage src={c.cover_url} alt={`Projeto ${c.name}`} className="aspect-[16/10] w-full transition duration-500 group-hover:scale-[1.03]" sizes="(min-width:1024px) 33vw, 100vw" />
          {c.logo_url && (
            <div className="absolute bottom-3 left-3 h-14 w-14 overflow-hidden rounded-xl border border-white bg-white p-1.5 shadow-card">
              <CmsImage src={c.logo_url} alt={`Logo ${c.name}`} fit="contain" className="h-full w-full" sizes="56px" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          {c.segment && <p className="text-xs font-semibold uppercase tracking-wider text-teal-500">{c.segment}</p>}
          <h3 className="mt-2 text-lg font-bold text-navy-800">{c.name}</h3>
          {c.summary && <p className="mt-2 flex-1 text-sm leading-relaxed text-mist-600">{c.summary}</p>}
          {c.services.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {c.services.slice(0, 3).map((s) => <li key={s} className="rounded-full bg-mist-100 px-2.5 py-1 text-xs text-mist-600">{s}</li>)}
            </ul>
          )}
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600">Ver projeto <ArrowUpRight className="h-4 w-4" aria-hidden /></span>
        </div>
      </Link>
    </Reveal>
  );
}

export function ClientLogos({ clients }: { clients: PortfolioClient[] }) {
  const withLogo = clients.filter((c) => c.logo_url);
  if (!withLogo.length) return null;
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
      {withLogo.map((c) => (
        <li key={c.id}>
          <Link href={`/clientes-e-projetos/${c.slug}`} className="block opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" title={c.name}>
            <CmsImage src={c.logo_url} alt={c.name} fit="contain" className="h-14 w-32" sizes="128px" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-mist-200 rounded-xl2 border border-mist-200 bg-white">
      {faqs.map((f) => (
        <details key={f.id} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-navy-800">
            {f.question}
            <Plus className="h-5 w-5 shrink-0 text-teal-500 transition group-open:rotate-45" aria-hidden />
          </summary>
          <p className="mt-3 leading-relaxed text-mist-600">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function PlansGrid({ plans }: { plans: Plan[] }) {
  if (!plans.length) return null;
  const period = { mensal: "/mês", anual: "/ano", unico: "" } as const;
  return (
    <div className={cn("grid gap-6", plans.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3")}>
      {plans.map((p, i) => (
        <Reveal key={p.id} delay={i * 60} className="h-full">
          <div className={cn("relative flex h-full flex-col rounded-xl2 border p-7", p.highlighted ? "border-turq-400 bg-navy-800 text-white shadow-glow" : "border-mist-200 bg-white shadow-card")}>
            {p.highlighted && <span className="absolute -top-3 left-7 rounded-full bg-turq-400 px-3 py-1 text-xs font-bold text-ink-900">Mais escolhido</span>}
            <h3 className="text-xl font-bold">{p.name}</h3>
            {p.tagline && <p className={cn("mt-2 text-sm", p.highlighted ? "text-white/70" : "text-mist-600")}>{p.tagline}</p>}
            <p className="mt-6 font-display text-3xl font-bold">
              {p.price_cents == null ? "Sob consulta" : formatBRL(p.price_cents)}
              {p.price_cents != null && <span className="text-sm font-medium opacity-60">{period[p.billing_period]}</span>}
            </p>
            {p.setup_cents != null && <p className="mt-1 text-xs opacity-70">Implantação: {formatBRL(p.setup_cents)}</p>}
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-turq-400" aria-hidden />{f}</li>)}
            </ul>
            <Link href={`/contato?servico=${encodeURIComponent("Sistemas SaaS — Plano " + p.name)}#orcamento`} className={cn("mt-8", p.highlighted ? "btn-primary" : "btn-dark")}>
              {p.cta_label || "Solicitar proposta"}
            </Link>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function ContactSection({ title, text, services, defaultService, buttonLabel, id = "orcamento" }: {
  title: string; text?: string; services: string[]; defaultService?: string; buttonLabel?: string; id?: string;
}) {
  return (
    <section id={id} className="section relative scroll-mt-24 overflow-hidden bg-ink-900">
      <div className="grid-tech pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-turq-400/20 blur-[120px]" aria-hidden />
      <div className="container-rb relative grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SectionHeading eyebrow="Fale com a RB" title={title} text={text} dark />
        </div>
        <div className="card-dark p-6 sm:p-8 lg:col-span-3">
          <ContactForm services={services} defaultService={defaultService} dark buttonLabel={buttonLabel} />
        </div>
      </div>
    </section>
  );
}

export function SocialLink({ href }: { href: string | null }) {
  const url = safeUrl(href);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-ghost">
      <Instagram className="h-4 w-4" aria-hidden /> Instagram
    </a>
  );
}
