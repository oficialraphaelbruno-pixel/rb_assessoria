import "server-only";
import type { FieldDef } from "./fields";
import { parseBRLToCents, safeUrl, slugify } from "@/lib/utils";

export const UUID = /^[0-9a-f-]{36}$/i;

function parseJsonArray(raw: FormDataEntryValue | null): unknown[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

const str = (v: unknown, max = 5000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Converte o valor do formulário conforme o tipo do campo. Lança Error com mensagem amigável. */
export async function parseFieldValue(f: FieldDef, fd: FormData): Promise<unknown> {
  const raw = fd.get(f.name);
  const text = typeof raw === "string" ? raw.trim() : "";
  const need = () => { if (f.required) throw new Error(`Preencha “${f.label}”.`); };

  switch (f.type) {
    case "boolean":
      return raw === "on" || raw === "true";
    case "number": {
      if (!text) { need(); return null; }
      const n = Number(text);
      if (!Number.isFinite(n)) throw new Error(`“${f.label}” deve ser um número.`);
      return Math.round(n);
    }
    case "money": {
      if (!text) { need(); return null; }
      const c = parseBRLToCents(text);
      if (c == null || c < 0) throw new Error(`Valor inválido em “${f.label}”.`);
      return c;
    }
    case "date":
      if (!text) { need(); return null; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error(`Data inválida em “${f.label}”.`);
      return text;
    case "url":
    case "image": {
      if (!text) { need(); return null; }
      const u = safeUrl(text);
      if (!u) throw new Error(`Link inválido em “${f.label}”. Use um endereço começando com https://`);
      return text.startsWith("/") ? text : u;
    }
    case "email":
      if (!text) { need(); return null; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text)) throw new Error(`E-mail inválido em “${f.label}”.`);
      return text.toLowerCase();
    case "slug": {
      const base = text || str(fd.get(f.from ?? ""));
      const s = slugify(base);
      if (!s) throw new Error(`Informe “${f.label}”.`);
      return s;
    }
    case "select":
      if (!text) { need(); return null; }
      if (f.options && !f.options.some((o) => o.value === text)) throw new Error(`Opção inválida em “${f.label}”.`);
      return text;
    case "relation":
      if (!text) return null;
      if (!UUID.test(text)) throw new Error(`Seleção inválida em “${f.label}”.`);
      return text;
    case "list":
      return parseJsonArray(raw).map((v) => str(v, 500)).filter(Boolean);
    case "items":
      return parseJsonArray(raw).map((it) => {
        const o = (it ?? {}) as Record<string, unknown>;
        return Object.fromEntries((f.fields ?? []).map((sf) => [sf.name, str(o[sf.name], 2000)]));
      }).filter((o) => Object.values(o).some(Boolean));
    case "gallery":
      return parseJsonArray(raw).map((it) => {
        const o = (it ?? {}) as Record<string, unknown>;
        const url = safeUrl(str(o.url));
        return url ? { url, alt: str(o.alt, 300) } : null;
      }).filter(Boolean);
    case "links":
      return parseJsonArray(raw).map((it) => {
        const o = (it ?? {}) as Record<string, unknown>;
        const url = safeUrl(str(o.url));
        return url ? { label: str(o.label, 100) || url, url } : null;
      }).filter(Boolean);
    default:
      if (!text) need();
      return text.slice(0, 20000);
  }
}

