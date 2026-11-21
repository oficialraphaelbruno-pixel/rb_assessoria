import { clsx, type ClassValue } from "clsx";

export const cn = (...v: ClassValue[]) => clsx(v);

export function formatBRL(cents: number | null | undefined) {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseBRLToCents(input: string): number | null {
  const clean = input.replace(/[^\d,.-]/g, "").trim();
  if (!clean) return null;
  // aceita "1.234,56", "1234,56", "1234.56"
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export function formatDate(d: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = {}) {
  if (!d) return "—";
  const date = typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + "T12:00:00") : new Date(d);
  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", ...opts });
}

export function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

/** Só permite http(s), mailto, tel e caminhos relativos — evita javascript: */
export function safeUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  const v = u.trim();
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  try {
    const p = new URL(v);
    return ["http:", "https:", "mailto:", "tel:"].includes(p.protocol) ? p.toString() : null;
  } catch {
    return null;
  }
}

export function whatsappLink(number: string, message?: string) {
  const n = number.replace(/\D/g, "");
  if (!n) return null;
  return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}
