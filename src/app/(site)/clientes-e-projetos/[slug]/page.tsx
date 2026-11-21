import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe } from "lucide-react";
import { Instagram } from "@/components/ui/brand-icons";
import { PageHero } from "@/components/site/page-hero";
import { CmsImage } from "@/components/site/blocks";
import { getPortfolioClient } from "@/lib/content";
import { safeUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getPortfolioClient((await params).slug);
  if (!c) return {};
  return { title: `${c.name} — Clientes & Projetos`, description: c.summary || c.description.slice(0, 160), alternates: { canonical: `/clientes-e-projetos/${c.slug}` },
    openGraph: c.cover_url ? { images: [c.cover_url] } : undefined };
}

export default async function ClientPage({ params }: Props) {
  const c = await getPortfolioClient((await params).slug);
  if (!c) notFound();
  const ig = safeUrl(c.instagram_url);
  const site = safeUrl(c.website_url);
  const links = c.extra_links.map((l) => ({ ...l, url: safeUrl(l.url) })).filter((l) => l.url);

  return (
    <>
      <PageHero eyebrow={c.segment ?? "Projeto"} title={c.name} text={c.summary} crumbs={[{ href: "/clientes-e-projetos", label: "Clientes & Projetos" }, { href: `/clientes-e-projetos/${c.slug}`, label: c.name }]}>
        <div className="mt-8 flex flex-wrap gap-3">
          {ig && <a href={ig} target="_blank" rel="noopener noreferrer" className="btn-primary"><Instagram className="h-4 w-4" aria-hidden /> Ver Instagram</a>}
          {site && <a href={site} target="_blank" rel="noopener noreferrer" className="btn-ghost text-white"><Globe className="h-4 w-4" aria-hidden /> Visitar site</a>}
        </div>
      </PageHero>

      <section className="section">
        <div className="container-rb grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <CmsImage src={c.cover_url} alt={`Projeto ${c.name}`} className="aspect-[16/10] w-full rounded-xl2" priority sizes="(min-width:1024px) 60vw, 100vw" />
            {c.description && <div className="mt-8 space-y-4 text-lg leading-relaxed text-mist-600">{c.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>}
          </div>
          <aside className="space-y-6 lg:col-span-5">
            {c.logo_url && <div className="card flex h-32 items-center justify-center p-6"><CmsImage src={c.logo_url} alt={`Logo ${c.name}`} fit="contain" className="h-full w-full" sizes="300px" /></div>}
            {c.metrics.length > 0 && (
              <div className="rounded-xl2 bg-navy-800 p-6 text-white">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-turq-300">Resultados acompanhados</h2>
                <dl className="mt-5 grid grid-cols-2 gap-5">
                  {c.metrics.map((m) => <div key={m.label}><dt className="text-xs text-white/60">{m.label}</dt><dd className="font-display text-2xl font-bold">{m.value}</dd></div>)}
                </dl>
                {c.metrics_source && <p className="mt-5 text-xs text-white/50">Fonte: {c.metrics_source}</p>}
              </div>
            )}
            {c.services.length > 0 && (
              <div className="card p-6">
                <h2 className="font-bold text-navy-800">Serviços prestados</h2>
                <ul className="mt-4 flex flex-wrap gap-2">{c.services.map((s) => <li key={s} className="rounded-full bg-turq-50 px-3 py-1.5 text-sm text-teal-600">{s}</li>)}</ul>
              </div>
            )}
            {links.length > 0 && (
              <div className="card p-6">
                <h2 className="font-bold text-navy-800">Links</h2>
                <ul className="mt-3 space-y-2">{links.map((l) => <li key={l.url}><a href={l.url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-teal-600 hover:underline">{l.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden /></a></li>)}</ul>
              </div>
            )}
          </aside>
        </div>

        {c.gallery.length > 0 && (
          <div className="container-rb mt-16">
            <h2 className="text-2xl font-bold text-navy-800">Galeria</h2>
            <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              {c.gallery.map((g, i) => (
                <li key={i}>
                  <a href={safeUrl(g.url) ?? "#"} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl2">
                    <CmsImage src={g.url} alt={g.alt || `${c.name} — imagem ${i + 1}`} className="aspect-square w-full transition duration-500 hover:scale-105" sizes="(min-width:768px) 33vw, 50vw" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="container-rb mt-16">
          <Link href="/clientes-e-projetos" className="inline-flex items-center gap-2 font-semibold text-teal-600 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden /> Todos os projetos</Link>
        </div>
      </section>
    </>
  );
}
