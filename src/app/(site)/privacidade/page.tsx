import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { Markdown } from "@/lib/markdown";
import { getSettings } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Política de privacidade", alternates: { canonical: "/privacidade" } };

export default async function PrivacyPage() {
  const { privacy: p } = await getSettings();
  return (
    <>
      <PageHero eyebrow="LGPD" title="Política de privacidade" text={p.updated_at ? `Atualizada em ${formatDate(p.updated_at)}` : undefined} />
      <section className="section">
        <div className="container-rb max-w-3xl">
          <Markdown source={p.body} />
          {(p.controller || p.contact_email) && (
            <div className="mt-10 rounded-xl2 bg-mist-50 p-6 text-sm text-mist-600">
              {p.controller && <p><strong className="text-navy-800">Controlador:</strong> {p.controller}</p>}
              {p.contact_email && <p className="mt-1"><strong className="text-navy-800">Contato para assuntos de privacidade:</strong> <a className="underline" href={`mailto:${p.contact_email}`}>{p.contact_email}</a></p>}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
