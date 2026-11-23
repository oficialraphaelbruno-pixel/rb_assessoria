import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CmsImage, ContactSection, PlansGrid } from "@/components/site/blocks";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { Icon } from "@/components/ui/icon";
import { getPlans, getService, getServices, getSettings } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getService((await params).slug);
  if (!s) return {};
  return { title: s.seo_title || s.title, description: s.seo_description || s.summary, alternates: { canonical: `/servicos/${s.slug}` } };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [s, all, settings] = await Promise.all([getService(slug), getServices(), getSettings()]);
  if (!s) notFound();
  const plans = slug === "sistemas-saas" ? await getPlans() : [];
  const others = all.filter((x) => x.slug !== slug && x.has_page).slice(0, 3);

  return (
    <>
      <PageHero eyebrow={s.eyebrow ?? "Serviço"} title={s.title} text={s.summary} crumbs={[{ href: "/servicos", label: "Serviços" }, { href: `/servicos/${s.slug}`, label: s.title }]}>
        <Link href={`/contato?servico=${encodeURIComponent(s.title)}#orcamento`} className="btn-primary mt-8">{s.cta_label || "Solicitar orçamento"} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
      </PageHero>

      <section className="section">
        <div className="container-rb grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-turq-50 text-teal-500"><Icon name={s.icon} className="h-7 w-7" /></span>
              <p className="mt-6 text-lg leading-relaxed text-mist-600">{s.description}</p>
              {s.cover_url && <CmsImage src={s.cover_url} alt={s.title} className="mt-8 aspect-[4/3] w-full rounded-xl2" sizes="(min-width:1024px) 40vw, 100vw" />}
              {s.deliverables.length > 0 && (
                <div className="mt-8 rounded-xl2 bg-mist-50 p-6">
                  <h2 className="font-bold text-navy-800">{slug === "automacoes-ia" ? "Como funciona o fluxo" : "O que pode estar incluído"}</h2>
                  <ul className="mt-4 space-y-2.5">
                    {s.deliverables.map((d) => <li key={d} className="flex gap-2.5 text-sm text-mist-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" aria-hidden />{d}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="grid content-start gap-5 sm:grid-cols-2 lg:col-span-7">
            {s.features.map((f, i) => (
              <Reveal key={f.title} delay={i * 50} className="card h-full p-6">
                <span className="font-display text-sm font-bold text-turq-400">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-bold text-navy-800">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-600">{f.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {slug === "sistemas-saas" && (
        <section className="section bg-mist-50">
          <div className="container-rb">
            <SectionHeading eyebrow="Planos" title="Sistema próprio no plano Ultra Diamante ou sob medida" text="O sistema de agendamento e gestão faz parte do plano Ultra Diamante e também pode ser contratado separadamente, com recursos ajustados ao seu negócio." center />
            {plans.length > 0 && <div className="mt-12"><PlansGrid plans={plans} /></div>}
            <p className="mt-8 text-center"><Link href="/planos" className="font-semibold text-teal-600 hover:underline">Ver todos os planos →</Link></p>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="py-16">
          <div className="container-rb">
            <h2 className="text-xl font-bold text-navy-800">Outros serviços</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {others.map((o) => (
                <Link key={o.id} href={`/servicos/${o.slug}`} className="group flex items-center gap-4 rounded-xl2 border border-mist-200 p-5 transition hover:border-turq-300">
                  <Icon name={o.icon} className="h-6 w-6 text-teal-500" />
                  <span className="flex-1 font-semibold text-navy-800">{o.title}</span>
                  <ArrowRight className="h-4 w-4 text-mist-400 transition group-hover:translate-x-1 group-hover:text-teal-500" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactSection title={`Vamos conversar sobre ${s.title.toLowerCase()}?`} text={settings.cta_final.text} services={all.map((x) => x.title)} defaultService={s.title} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Service", name: s.title, description: s.summary,
        provider: { "@type": "Organization", name: settings.brand.name }, areaServed: "BR",
      }).replace(/</g, "\\u003c") }} />
    </>
  );
}
