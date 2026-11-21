import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageHero({ eyebrow, title, text, crumbs = [], children }: {
  eyebrow?: string; title: string; text?: string; crumbs?: { href: string; label: string }[]; children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-white">
      <div className="grid-tech pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" aria-hidden />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-teal-500/25 blur-[110px]" aria-hidden />
      <div className="container-rb relative py-16 sm:py-24">
        {crumbs.length > 0 && (
          <nav aria-label="Trilha" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-white/50">
            <Link href="/" className="hover:text-turq-300">Início</Link>
            {crumbs.map((c) => (
              <span key={c.href} className="inline-flex items-center gap-1"><ChevronRight className="h-3.5 w-3.5" aria-hidden /><Link href={c.href} className="hover:text-turq-300">{c.label}</Link></span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="eyebrow text-turq-300">{eyebrow}</p>}
        <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
        {text && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">{text}</p>}
        {children}
      </div>
    </section>
  );
}
