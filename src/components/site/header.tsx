"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

interface NavService { slug: string; title: string }

export function Header({ logo, logoAlt, services }: { logo: string; logoAlt: string; services: NavService[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links = [
    { href: "/clientes-e-projetos", label: "Clientes & Projetos" },
    { href: "/clubes-e-escolinhas", label: "Clubes" },
    { href: "/quem-esta-por-tras-da-rb", label: "Quem somos" },
    { href: "/contato", label: "Contato" },
  ];
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className={cn("sticky top-0 z-40 transition-all duration-300", scrolled ? "border-b border-mist-200/80 bg-white/85 backdrop-blur-xl" : "bg-white")}>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-navy-800 focus:px-4 focus:py-2 focus:text-white">
        Pular para o conteúdo
      </a>
      <div className="container-rb flex h-16 items-center justify-between gap-6 sm:h-20">
        <Logo src={logo} alt={logoAlt} />
        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          <div className="group relative">
            <Link href="/servicos" className={cn("inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition hover:text-teal-500", active("/servicos") && "text-teal-500")}>
              Serviços <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" aria-hidden />
            </Link>
            {services.length > 0 && (
              <div className="invisible absolute left-0 top-full w-80 translate-y-2 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <ul className="card p-2">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/servicos/${s.slug}`} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-turq-50 hover:text-teal-600">{s.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}
              className={cn("rounded-full px-3.5 py-2 text-sm font-medium transition hover:text-teal-500", active(l.href) && "text-teal-500")}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/contato#orcamento" className="btn-dark hidden px-5 py-2.5 sm:inline-flex">Solicitar orçamento</Link>
          <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-mist-200 lg:hidden"
            aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? "Fechar menu" : "Abrir menu"}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div id="menu-mobile" hidden={!open} className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-white lg:hidden">
        <nav aria-label="Menu móvel" className="container-rb flex flex-col gap-1 py-6">
          <Link href="/servicos" className="rounded-lg px-3 py-3 text-lg font-semibold">Serviços</Link>
          {services.map((s) => (
            <Link key={s.slug} href={`/servicos/${s.slug}`} className="rounded-lg px-6 py-2 text-mist-600">{s.title}</Link>
          ))}
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-3 text-lg font-semibold">{l.label}</Link>
          ))}
          <Link href="/contato#orcamento" className="btn-primary mt-4">Solicitar orçamento</Link>
        </nav>
      </div>
    </header>
  );
}
