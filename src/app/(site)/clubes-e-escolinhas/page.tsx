import type { Metadata } from "next";
import { Check, Trophy } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { ContactSection } from "@/components/site/blocks";
import { Reveal } from "@/components/site/reveal";
import { getServices, getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sites para clubes e escolinhas de futebol",
  description: "Site oficial para clubes, equipes e escolinhas de futebol: história, categorias de base, calendário, notícias, galerias e patrocinadores.",
  alternates: { canonical: "/clubes-e-escolinhas" },
};

const SERVICE_LABEL = "Site para clube / escolinha de futebol";

export default async function ClubsPage() {
  const [{ clubs: c, cta_final }, services] = await Promise.all([getSettings(), getServices()]);
  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} text={c.subtitle}>
        <a href="#orcamento" className="btn-primary mt-8">{c.cta_label}</a>
      </PageHero>
      <section className="section">
        <div className="container-rb">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 50} className="card h-full p-6">
                <Check className="h-6 w-6 rounded-full bg-turq-50 p-1 text-teal-500" aria-hidden />
                <h2 className="mt-4 text-lg font-bold text-navy-800">{b.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-mist-600">{b.text}</p>
              </Reveal>
            ))}
          </div>
          {c.closing && (
            <div className="mt-14 flex flex-col items-start gap-5 rounded-xl2 bg-gradient-to-r from-navy-800 to-petrol-500 p-8 text-white sm:flex-row sm:items-center">
              <Trophy className="h-10 w-10 shrink-0 text-turq-300" aria-hidden />
              <p className="text-xl font-semibold">{c.closing}</p>
            </div>
          )}
        </div>
      </section>
      <ContactSection title="Vamos montar o site oficial da sua equipe?" text={cta_final.text}
        services={[SERVICE_LABEL, ...services.map((x) => x.title)]} defaultService={SERVICE_LABEL} buttonLabel={c.cta_label} />
    </>
  );
}
