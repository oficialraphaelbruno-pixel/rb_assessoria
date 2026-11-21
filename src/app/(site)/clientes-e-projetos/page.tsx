import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { ContactSection, PortfolioCard } from "@/components/site/blocks";
import { getPortfolio, getServices, getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Clientes & Projetos",
  description: "Empresas, profissionais e projetos esportivos atendidos pela RB Assessoria & Comunicação.",
  alternates: { canonical: "/clientes-e-projetos" },
};

const CATEGORY_LABEL: Record<string, string> = { esporte: "Esporte", "marca-pessoal": "Marca pessoal", "negocio-local": "Negócio local", empresa: "Empresa", geral: "Outros" };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const [clients, services, s] = await Promise.all([getPortfolio(), getServices(), getSettings()]);
  const categories = [...new Set(clients.map((c) => c.category))];
  const list = categoria ? clients.filter((c) => c.category === categoria) : clients;

  return (
    <>
      <PageHero eyebrow="Clientes & Projetos" title="Marcas, profissionais e projetos que comunicam com direção" text="Cada cliente tem uma realidade. Conheça alguns dos trabalhos desenvolvidos pela RB." />
      <section className="section">
        <div className="container-rb">
          {categories.length > 1 && (
            <nav aria-label="Filtrar por categoria" className="mb-10 flex flex-wrap gap-2">
              <Link href="/clientes-e-projetos" className={`rounded-full px-4 py-2 text-sm font-medium ${!categoria ? "bg-navy-800 text-white" : "bg-mist-100 text-navy-800 hover:bg-turq-50"}`}>Todos</Link>
              {categories.map((c) => (
                <Link key={c} href={`/clientes-e-projetos?categoria=${c}`} className={`rounded-full px-4 py-2 text-sm font-medium ${categoria === c ? "bg-navy-800 text-white" : "bg-mist-100 text-navy-800 hover:bg-turq-50"}`}>{CATEGORY_LABEL[c] ?? c}</Link>
              ))}
            </nav>
          )}
          {list.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.map((c, i) => <PortfolioCard key={c.id} c={c} index={i} />)}
            </div>
          ) : (
            <div className="mx-auto max-w-lg rounded-xl2 border border-dashed border-mist-200 p-12 text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-turq-400" aria-hidden />
              <h2 className="mt-4 text-xl font-bold text-navy-800">Projetos em breve</h2>
              <p className="mt-2 text-mist-600">Estamos organizando os cases para apresentar aqui. Enquanto isso, fale com a gente para conhecer nosso trabalho.</p>
              <Link href="/contato" className="btn-dark mt-6">Falar com a RB</Link>
            </div>
          )}
        </div>
      </section>
      <ContactSection title="Quer ver sua marca aqui?" text={s.cta_final.text} services={services.map((x) => x.title)} />
    </>
  );
}
