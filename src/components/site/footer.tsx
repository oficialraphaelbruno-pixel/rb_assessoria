import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { Instagram, Linkedin } from "@/components/ui/brand-icons";
import { Logo } from "./logo";
import type { SettingsMap } from "@/lib/settings-defaults";
import { safeUrl, whatsappLink } from "@/lib/utils";

export function Footer({ settings, services }: { settings: SettingsMap; services: { slug: string; title: string }[] }) {
  const { brand, contact } = settings;
  const wa = whatsappLink(contact.whatsapp_number, contact.whatsapp_message);
  const ig = safeUrl(contact.instagram_url);
  const li = safeUrl(contact.linkedin_url);
  return (
    <footer className="relative overflow-hidden bg-ink-900 text-white/70">
      <div className="grid-tech pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="container-rb relative grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo src={brand.logo_url} alt={brand.logo_alt} onDark />
          {brand.tagline && <p className="mt-6 max-w-sm text-sm leading-relaxed">{brand.tagline}</p>}
          <div className="mt-6 flex gap-3">
            {ig && <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-white/15 p-2.5 transition hover:border-turq-400 hover:text-turq-300"><Instagram className="h-4 w-4" /></a>}
            {li && <a href={li} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-full border border-white/15 p-2.5 transition hover:border-turq-400 hover:text-turq-300"><Linkedin className="h-4 w-4" /></a>}
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-full border border-white/15 p-2.5 transition hover:border-turq-400 hover:text-turq-300"><MessageCircle className="h-4 w-4" /></a>}
          </div>
        </div>
        <div className="md:col-span-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Serviços</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.map((s) => <li key={s.slug}><Link className="hover:text-turq-300" href={`/servicos/${s.slug}`}>{s.title}</Link></li>)}
            <li><Link className="hover:text-turq-300" href="/clubes-e-escolinhas">Sites para clubes e escolinhas</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Empresa</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-turq-300" href="/clientes-e-projetos">Clientes & Projetos</Link></li>
            <li><Link className="hover:text-turq-300" href="/quem-esta-por-tras-da-rb">Quem está por trás da RB</Link></li>
            <li><Link className="hover:text-turq-300" href="/contato">Contato</Link></li>
            <li><Link className="hover:text-turq-300" href="/privacidade">Política de privacidade</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Contato</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {wa && contact.whatsapp_display && <li><a className="flex items-center gap-2 hover:text-turq-300" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4 text-turq-400" />{contact.whatsapp_display}</a></li>}
            {contact.email && <li><a className="flex items-center gap-2 break-all hover:text-turq-300" href={`mailto:${contact.email}`}><Mail className="h-4 w-4 shrink-0 text-turq-400" />{contact.email}</a></li>}
            {contact.city && <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-turq-400" />{contact.city}{contact.service_area ? ` · ${contact.service_area}` : ""}</li>}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-rb flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.</p>
          <p>Feito com estratégia e tecnologia.</p>
        </div>
      </div>
    </footer>
  );
}
