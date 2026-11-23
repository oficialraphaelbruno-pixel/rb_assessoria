"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell, Bot, BookOpen, Briefcase, ExternalLink, FileText, FolderKanban, Gauge, HelpCircle, Image as ImageIcon, LayoutTemplate,
  ListChecks, LogOut, Menu, MessagesSquare, PlugZap, ScrollText, Settings2, Tags, Upload, Users, Wallet, X, Layers, BadgeDollarSign, FlaskConical, Contact, Mail, TrendingUp, Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { group: "Visão geral", admin: false, items: [
    { href: "/admin", label: "Dashboard", icon: Gauge, exact: true },
    { href: "/admin/notificacoes", label: "Notificações", icon: Bell, admin: true },
  ]},
  { group: "Site", admin: false, items: [
    { href: "/admin/conteudo", label: "Conteúdo do site", icon: LayoutTemplate },
    { href: "/admin/servicos", label: "Serviços", icon: Layers },
    { href: "/admin/planos", label: "Planos", icon: BadgeDollarSign },
    { href: "/admin/portfolio", label: "Clientes & Projetos", icon: Briefcase },
    { href: "/admin/depoimentos", label: "Depoimentos", icon: Quote },
    { href: "/admin/faq", label: "Perguntas frequentes", icon: HelpCircle },
    { href: "/admin/midia", label: "Biblioteca de mídia", icon: ImageIcon },
  ]},
  { group: "Comercial", admin: true, items: [
    { href: "/admin/leads", label: "Leads (funil)", icon: ListChecks },
    { href: "/admin/clientes", label: "Clientes (CRM)", icon: Contact },
    { href: "/admin/email-marketing", label: "E-mail marketing", icon: Mail },
    { href: "/admin/trafego", label: "Tráfego (Meta Ads)", icon: TrendingUp },
    { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
    { href: "/admin/documentos", label: "Documentos", icon: FileText },
  ]},
  { group: "Financeiro", admin: true, items: [
    { href: "/admin/financeiro", label: "Visão geral", icon: Wallet, exact: true },
    { href: "/admin/financeiro/lancamentos", label: "Lançamentos", icon: ScrollText },
    { href: "/admin/financeiro/importar", label: "Importar extrato", icon: Upload },
    { href: "/admin/financeiro/categorias", label: "Categorias", icon: Tags },
  ]},
  { group: "Chatbot IA", admin: true, items: [
    { href: "/admin/chatbot", label: "Configurações e custos", icon: Bot, exact: true },
    { href: "/admin/chatbot/conhecimento", label: "Base de conhecimento", icon: BookOpen },
    { href: "/admin/chatbot/conversas", label: "Conversas", icon: MessagesSquare },
    { href: "/admin/chatbot/testar", label: "Testar o bot", icon: FlaskConical },
  ]},
  { group: "Sistema", admin: true, items: [
    { href: "/admin/usuarios", label: "Usuários", icon: Users },
    { href: "/admin/integracoes", label: "Integrações", icon: PlugZap },
    { href: "/admin/auditoria", label: "Auditoria", icon: Settings2 },
  ]},
];

export function Sidebar({ role, email, unread }: { role: "admin" | "editor"; email: string; unread: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  const nav = (
    <nav aria-label="Painel" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {NAV.filter((g) => !g.admin || role === "admin").map((g) => (
        <div key={g.group}>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">{g.group}</p>
          <ul className="mt-2 space-y-0.5">
            {g.items.filter((i) => !("admin" in i && i.admin) || role === "admin").map((i) => (
              <li key={i.href}>
                <Link href={i.href} aria-current={isActive(i.href, "exact" in i ? i.exact : false) ? "page" : undefined}
                  className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white",
                    isActive(i.href, "exact" in i ? i.exact : false) && "bg-turq-400/15 font-medium text-turq-300")}>
                  <i.icon className="h-4 w-4" aria-hidden />
                  <span className="flex-1">{i.label}</span>
                  {i.href === "/admin/notificacoes" && unread > 0 && <span className="rounded-full bg-turq-400 px-1.5 text-[11px] font-bold text-ink-900">{unread}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-mist-200 bg-white px-4 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menu" className="rounded-lg p-2 hover:bg-mist-100"><Menu className="h-5 w-5" /></button>
        <span className="font-display text-sm font-bold">Painel RB</span>
        <Link href="/admin/notificacoes" aria-label="Notificações" className="relative rounded-lg p-2 hover:bg-mist-100"><Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-turq-400" />}</Link>
      </div>
      {open && <div className="fixed inset-0 z-40 bg-ink-900/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-ink-900 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-4">
          <Link href="/admin" className="rounded-lg bg-[#fff] px-2.5 py-1.5"><Image src="/brand/logo-rb.png" alt="RB Assessoria" width={1682} height={362} className="h-7 w-auto" /></Link>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 lg:hidden" aria-label="Fechar menu"><X className="h-5 w-5" /></button>
        </div>
        {nav}
        <div className="space-y-1 border-t border-white/10 p-3">
          <ThemeToggle />
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"><ExternalLink className="h-4 w-4" /> Ver site</a>
          <form action="/admin/auth/logout" method="post">
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"><LogOut className="h-4 w-4" /> Sair</button>
          </form>
          <p className="truncate px-3 pt-2 text-xs text-white/40" title={email}>{email} · {role === "admin" ? "Administrador" : "Editor"}</p>
        </div>
      </aside>
    </>
  );
}
