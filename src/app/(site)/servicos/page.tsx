import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { ContactSection, ServiceCard } from "@/components/site/blocks";
import { getServices, getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Serviços",
  description: "Social media, criação de artes e identidade visual, sites, sistemas SaaS de agendamento e automações com inteligência artificial.",
  alternates: { canonical: "/servicos" },
};

export default async function ServicesPage() {
  const [services, s] = await Promise.all([getServices(), getSettings()]);
  return (
    <>
      <PageHero eyebrow="Serviços" title="Estratégia, criação e tecnologia no mesmo trabalho" text="Do planejamento de conteúdo ao sistema que organiza seu atendimento: soluções que se conectam para a sua marca comunicar com direção." />
      <section className="section">
        <div className="container-rb grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((x, i) => <ServiceCard key={x.id} s={x} index={i} />)}
        </div>
        <div className="container-rb mt-12">
          <Link href="/clubes-e-escolinhas" className="flex flex-col justify-between gap-4 rounded-xl2 bg-gradient-to-r from-navy-800 to-petrol-500 p-8 text-white sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-turq-300">Para clubes, equipes e escolinhas</p>
              <p className="mt-2 text-2xl font-bold">Sites oficiais para o futebol de base</p>
            </div>
            <span className="btn-primary shrink-0">Conhecer</span>
          </Link>
        </div>
      </section>
      <ContactSection title={s.cta_final.title || "Vamos conversar?"} text={s.cta_final.text} services={services.map((x) => x.title)} buttonLabel={s.cta_final.button_label} />
    </>
  );
}
