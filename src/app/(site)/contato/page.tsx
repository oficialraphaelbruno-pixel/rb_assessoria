import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { Instagram } from "@/components/ui/brand-icons";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "@/components/site/contact-form";
import { getServices, getSettings } from "@/lib/content";
import { safeUrl, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contato e orçamento",
  description: "Solicite um orçamento ou agende uma conversa de diagnóstico com a RB Assessoria & Comunicação.",
  alternates: { canonical: "/contato" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ servico?: string }> }) {
  const { servico } = await searchParams;
  const [s, services] = await Promise.all([getSettings(), getServices()]);
  const titles = services.map((x) => x.title);
  const def = servico && servico.length < 120 ? servico : undefined;
  const options = def && !titles.includes(def) ? [def, ...titles] : titles;
  const wa = whatsappLink(s.contact.whatsapp_number, s.contact.whatsapp_message);
  const ig = safeUrl(s.contact.instagram_url);

  return (
    <>
      <PageHero eyebrow="Contato" title={s.cta_final.title || "Vamos conversar?"} text={s.cta_final.text} />
      <section className="section">
        <div className="container-rb grid gap-12 lg:grid-cols-12">
          <div id="orcamento" className="card scroll-mt-28 p-6 sm:p-10 lg:col-span-8">
            <h2 className="text-2xl font-bold text-navy-800">Solicitar orçamento</h2>
            <p className="mt-2 text-mist-600">Preencha os campos e retornaremos pelo contato informado.</p>
            <div className="mt-8"><ContactForm services={options} defaultService={def} buttonLabel={s.cta_final.button_label || "Enviar solicitação"} /></div>
          </div>
          <aside className="space-y-4 lg:col-span-4">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-xl2 bg-navy-800 p-6 text-white transition hover:bg-navy-700">
                <MessageCircle className="h-8 w-8 text-turq-300" aria-hidden />
                <span><span className="block text-sm text-white/60">WhatsApp</span><span className="text-lg font-semibold">{s.contact.whatsapp_display}</span></span>
              </a>
            )}
            {s.contact.email && <a href={`mailto:${s.contact.email}`} className="card flex items-center gap-4 p-6 hover:border-turq-300"><Mail className="h-6 w-6 text-teal-500" aria-hidden /><span className="break-all">{s.contact.email}</span></a>}
            {ig && <a href={ig} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-4 p-6 hover:border-turq-300"><Instagram className="h-6 w-6 text-teal-500" aria-hidden />{s.contact.instagram_handle || "Instagram"}</a>}
            {s.contact.city && <div className="card flex items-center gap-4 p-6"><MapPin className="h-6 w-6 text-teal-500" aria-hidden /><span>{s.contact.city}{s.contact.service_area && <span className="block text-sm text-mist-600">{s.contact.service_area}</span>}</span></div>}
            {s.contact.hours && <p className="px-2 text-sm text-mist-600">{s.contact.hours}</p>}
          </aside>
        </div>
      </section>
    </>
  );
}
