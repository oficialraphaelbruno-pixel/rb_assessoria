import { draftMode } from "next/headers";
import Link from "next/link";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ChatWidget } from "@/components/site/chat-widget";
import { Attribution } from "@/components/site/attribution";
import { Analytics } from "@/components/site/analytics";
import { getServices, getSettings } from "@/lib/content";
import { whatsappLink } from "@/lib/utils";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services, draft] = await Promise.all([getSettings(), getServices(), draftMode()]);
  const nav = services.filter((s) => s.has_page).map((s) => ({ slug: s.slug, title: s.title }));
  const wa = whatsappLink(settings.contact.whatsapp_number, settings.contact.whatsapp_message);
  const org = {
    "@context": "https://schema.org", "@type": "ProfessionalService", name: settings.brand.name,
    url: settings.seo.site_url || undefined, email: settings.contact.email || undefined,
    telephone: settings.contact.whatsapp_display || undefined, areaServed: "BR",
    address: settings.contact.city ? { "@type": "PostalAddress", addressLocality: settings.contact.city.split("/")[0], addressCountry: "BR" } : undefined,
    sameAs: [settings.contact.instagram_url, settings.contact.linkedin_url].filter(Boolean),
  };
  return (
    <>
      {draft.isEnabled && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-amber-400 px-4 py-2 text-sm font-medium text-ink-900">
          Pré-visualização: exibindo rascunhos.
          <Link href="/api/preview/disable" prefetch={false} className="underline">Sair da pré-visualização</Link>
        </div>
      )}
      <Header logo={settings.brand.logo_url} logoAlt={settings.brand.logo_alt} services={nav} />
      <main id="conteudo">{children}</main>
      <Footer settings={settings} services={nav} />
      <ChatWidget whatsappHref={wa} />
      <Attribution />
      <Analytics ga4={settings.analytics.ga4_id} pixel={settings.analytics.meta_pixel_id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org).replace(/</g, "\\u003c") }} />
    </>
  );
}
