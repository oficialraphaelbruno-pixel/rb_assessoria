import type { Metadata } from "next";
import Link from "next/link";
import { Instagram, Linkedin } from "@/components/ui/brand-icons";
import { CmsImage } from "@/components/site/blocks";
import { Reveal } from "@/components/site/reveal";
import { getSettings } from "@/lib/content";
import { safeUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { founder } = await getSettings();
  return { title: "Quem está por trás da RB", description: founder.bio[0]?.slice(0, 160) || founder.headline, alternates: { canonical: "/quem-esta-por-tras-da-rb" } };
}

export default async function FounderPage() {
  const { founder: f } = await getSettings();
  const ig = safeUrl(f.instagram_url);
  const li = safeUrl(f.linkedin_url);
  return (
    <>
      <section className="relative overflow-hidden bg-mist-50">
        <div className="container-rb grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-3 -rotate-2 rounded-[2rem] bg-gradient-to-br from-turq-400 to-petrol-500 opacity-90" aria-hidden />
              <CmsImage src={f.photo_url} alt={f.photo_alt || f.name || "Fundador"} priority className="relative aspect-[4/5] w-full rounded-[1.75rem] bg-mist-100" sizes="(min-width:1024px) 40vw, 100vw" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <p className="eyebrow">{f.eyebrow || "Quem está por trás da RB"}</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-navy-800 sm:text-5xl">{f.headline || f.name}</h1>
            {f.name && <p className="mt-6 text-lg font-semibold text-navy-800">{f.name}{f.role && <span className="font-normal text-mist-600"> · {f.role}</span>}</p>}
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-mist-600">
              {f.bio.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            {f.quote && <blockquote className="mt-8 border-l-4 border-turq-400 pl-5 text-xl font-semibold italic text-navy-800">{f.quote}</blockquote>}
            {(ig || li) && (
              <div className="mt-8 flex gap-3">
                {ig && <a href={ig} target="_blank" rel="noopener noreferrer" className="btn-ghost"><Instagram className="h-4 w-4" aria-hidden /> Instagram</a>}
                {li && <a href={li} target="_blank" rel="noopener noreferrer" className="btn-ghost"><Linkedin className="h-4 w-4" aria-hidden /> LinkedIn</a>}
              </div>
            )}
          </div>
        </div>
      </section>

      {(f.experience || f.specialties.length > 0 || f.values.length > 0 || f.vision) && (
        <section className="section">
          <div className="container-rb grid gap-6 md:grid-cols-2">
            {f.experience && <Reveal className="card p-8"><h2 className="text-xl font-bold text-navy-800">Experiência</h2><p className="mt-3 whitespace-pre-line leading-relaxed text-mist-600">{f.experience}</p></Reveal>}
            {f.specialties.length > 0 && <Reveal className="card p-8"><h2 className="text-xl font-bold text-navy-800">Especialidades</h2><ul className="mt-4 flex flex-wrap gap-2">{f.specialties.map((s) => <li key={s} className="rounded-full bg-turq-50 px-3 py-1.5 text-sm text-teal-600">{s}</li>)}</ul></Reveal>}
            {f.values.length > 0 && <Reveal className="card p-8"><h2 className="text-xl font-bold text-navy-800">Valores</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-mist-600">{f.values.map((v) => <li key={v}>{v}</li>)}</ul></Reveal>}
            {f.vision && <Reveal className="rounded-xl2 bg-navy-800 p-8 text-white"><h2 className="text-xl font-bold">Visão da empresa</h2><p className="mt-3 leading-relaxed text-white/75">{f.vision}</p></Reveal>}
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container-rb flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold text-navy-800">Vamos conversar sobre a sua marca?</h2>
          <Link href="/contato#orcamento" className="btn-dark">Agendar uma conversa</Link>
        </div>
      </section>
    </>
  );
}
