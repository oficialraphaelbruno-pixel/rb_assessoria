import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { PageHero as PageHeader } from "@/components/site/page-hero";
import { ContactSection, FaqList, PlansGrid } from "@/components/site/blocks";
import { getFaqs, getPlans, getServices, getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Planos",
  description: "Planos Bronze, Prata, Ouro e Ultra Diamante: gestão de redes sociais, conteúdo, sites, automação, e-mail marketing, tráfego pago e sistemas SaaS.",
  alternates: { canonical: "/planos" },
};

/** Comparativo derivado dos recursos: cada plano inclui o anterior. */
const ROWS: { label: string; from: number }[] = [
  { label: "Planejamento e calendário editorial", from: 0 },
  { label: "Gestão de Instagram com artes e legendas", from: 0 },
  { label: "Relatório mensal de desempenho", from: 0 },
  { label: "Reels editados e stories com roteiro", from: 1 },
  { label: "Instagram + Facebook", from: 1 },
  { label: "Landing page ou página de links", from: 1 },
  { label: "Captação integrada ao funil de leads (CRM)", from: 1 },
  { label: "Automação no Instagram (ManyChat)", from: 2 },
  { label: "Site completo com painel", from: 2 },
  { label: "E-mail marketing", from: 2 },
  { label: "Gestão de tráfego pago (Meta Ads)", from: 2 },
  { label: "Sistema SaaS de agendamento ou gestão", from: 3 },
  { label: "Chatbot com IA no site", from: 3 },
  { label: "Integrações com WhatsApp, CRM e e-mail", from: 3 },
  { label: "Atendimento prioritário e reuniões quinzenais", from: 3 },
];

export default async function PlansPage() {
  const [plans, s, faqs, services] = await Promise.all([getPlans(), getSettings(), getFaqs(), getServices()]);
  const p = s.plans_page;
  const planFaqs = faqs.filter((f) => ["planos", "vendas", "automacao"].includes(f.category)).slice(0, 6);
  return (
    <>
      <PageHeader eyebrow={p.eyebrow || "Planos"} title={p.title} text={p.subtitle} />
      <section className="section">
        <div className="container-rb">
          {plans.length ? <PlansGrid plans={plans} /> : (
            <p className="text-center text-mist-600">Os planos estão sendo atualizados. <Link href="/contato" className="underline">Fale com a RB</Link> para receber a proposta.</p>
          )}
          {p.note && <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-mist-600">{p.note}</p>}
        </div>
      </section>

      {plans.length === 4 && (
        <section className="pb-20">
          <div className="container-rb">
            <h2 className="text-center text-2xl font-bold text-navy-800">Compare os planos</h2>
            <div className="mt-8 overflow-x-auto rounded-xl2 border border-mist-200">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-navy-800 text-white">
                  <tr><th className="px-5 py-4 text-left font-semibold">Recurso</th>{plans.map((pl) => <th key={pl.id} className={`px-5 py-4 text-center font-semibold ${pl.highlighted ? "text-turq-300" : ""}`}>{pl.name}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-mist-100 bg-white">
                  {ROWS.map((r) => (
                    <tr key={r.label}>
                      <td className="px-5 py-3 text-navy-800">{r.label}</td>
                      {plans.map((pl, i) => (
                        <td key={pl.id} className="px-5 py-3 text-center">
                          {i >= r.from ? <Check className="mx-auto h-5 w-5 text-teal-500" aria-label="Incluído" /> : <Minus className="mx-auto h-4 w-4 text-mist-200" aria-label="Não incluído" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {planFaqs.length > 0 && (
        <section className="section bg-mist-50">
          <div className="container-rb grid gap-12 lg:grid-cols-3">
            <div><p className="eyebrow">Dúvidas</p><h2 className="mt-4 text-3xl font-bold text-navy-800">Perguntas sobre os planos</h2></div>
            <div className="lg:col-span-2"><FaqList faqs={planFaqs} /></div>
          </div>
        </section>
      )}
      <ContactSection title={s.cta_final.title || "Vamos conversar?"} text={s.cta_final.text} services={["Plano Bronze", "Plano Prata", "Plano Ouro", "Plano Ultra Diamante", ...services.map((x) => x.title)]} buttonLabel={s.cta_final.button_label} />
    </>
  );
}
