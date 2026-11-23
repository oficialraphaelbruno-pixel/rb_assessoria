"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseSheet, readUpload, type ClientRow, type LeadRow, type RowError, type SheetKind } from "@/lib/spreadsheet";
import { syncLeadToResend } from "@/lib/resend";

export interface ImportResult {
  ok: boolean; error?: string; message?: string; imported?: boolean;
  total?: number; valid?: number; created?: number; updated?: number; skipped?: number;
  errors?: RowError[]; duplicates?: { row: number; name: string }[]; unknownHeaders?: string[];
}

const digits = (s: string | null) => (s ?? "").replace(/\D/g, "").slice(-11);

export async function importSpreadsheet(kind: SheetKind, _prev: ImportResult | null, fd: FormData): Promise<ImportResult> {
  const staff = await requireAdmin();
  const mode = String(fd.get("mode")) === "importar" ? "importar" : "validar";
  const onDuplicate = String(fd.get("duplicates")) === "atualizar" ? "atualizar" : "ignorar";
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { ok: false, error: "Selecione a planilha (.xlsx ou .csv)." };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "Arquivo maior que 5 MB." };

  let parsed;
  try {
    const table = await readUpload(file);
    parsed = kind === "leads" ? parseSheet("leads", table) : parseSheet("clientes", table);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  if (parsed.rows.length > 2000) return { ok: false, error: "Máximo de 2.000 linhas por importação." };

  const db = await createClient();
  const table = kind === "leads" ? "leads" : "crm_clients";
  const { data: existing } = await db.from(table).select("id, name, email, phone").limit(20000);
  const byEmail = new Map<string, string>(), byPhone = new Map<string, string>(), byName = new Map<string, string>();
  (existing ?? []).forEach((e) => {
    if (e.email) byEmail.set(String(e.email).toLowerCase(), e.id);
    const p = digits(e.phone); if (p.length >= 10) byPhone.set(p, e.id);
    if (kind === "clientes") byName.set(String(e.name).trim().toLowerCase(), e.id);
  });
  const seen = new Set<string>();
  const duplicates: { row: number; name: string }[] = [];
  const plan: { line: number; id: string | null; data: LeadRow | ClientRow }[] = [];
  for (const r of parsed.rows) {
    const key = (r.data.email ?? "") + "|" + digits(r.data.phone);
    if (seen.has(key) && key !== "|") { parsed.errors.push({ row: r.line, message: "linha repetida na própria planilha" }); continue; }
    seen.add(key);
    const id = (r.data.email && byEmail.get(r.data.email)) || (digits(r.data.phone).length >= 10 && byPhone.get(digits(r.data.phone))) || (kind === "clientes" && byName.get(r.data.name.trim().toLowerCase())) || null;
    if (id) duplicates.push({ row: r.line, name: r.data.name });
    plan.push({ line: r.line, id, data: r.data });
  }

  const summary = { total: parsed.rows.length + parsed.errors.length, valid: parsed.rows.length, errors: parsed.errors.sort((a, b) => a.row - b.row), duplicates, unknownHeaders: parsed.unknownHeaders };
  if (mode === "validar") {
    return { ok: true, ...summary, message: `${summary.valid} linha(s) prontas para importar${duplicates.length ? `, ${duplicates.length} já existem` : ""}${summary.errors.length ? `, ${summary.errors.length} com erro (serão ignoradas)` : ""}.` };
  }

  let created = 0, updated = 0, skipped = 0;
  const now = new Date().toISOString();
  for (const p of plan) {
    if (p.id && onDuplicate === "ignorar") { skipped++; continue; }
    if (kind === "leads") {
      const d = p.data as LeadRow;
      const row = {
        name: d.name, company: d.company, email: d.email, phone: d.phone, city: d.city, service: d.service, source: d.source, stage: d.stage,
        estimated_value_cents: d.estimated_value_cents, next_followup_at: d.next_followup_at, notes: d.notes,
        ...(d.audience ? { audience: d.audience } : {}),
        ...(d.consent ? { consent: true, consent_at: now, consent_text: "Consentimento informado na importação de planilha pela equipe." } : {}),
        ...(d.marketing_consent ? { marketing_consent: true, marketing_consent_at: now } : {}),
      };
      const q = p.id ? db.from("leads").update(row).eq("id", p.id).select("id, name, email, company, service, audience, marketing_consent").single()
        : db.from("leads").insert(row).select("id, name, email, company, service, audience, marketing_consent").single();
      const { data, error } = await q;
      if (error || !data) { parsed.errors.push({ row: p.line, message: "falha ao gravar" }); continue; }
      p.id ? updated++ : created++;
      if (data.marketing_consent) await syncLeadToResend(db, data).catch(() => null);
    } else {
      const d = p.data as ClientRow;
      const { error } = p.id ? await db.from("crm_clients").update(d).eq("id", p.id) : await db.from("crm_clients").insert(d);
      if (error) { parsed.errors.push({ row: p.line, message: "falha ao gravar" }); continue; }
      p.id ? updated++ : created++;
    }
  }
  await db.from("audit_log").insert({ actor: staff.id, action: "import", entity: table, details: { file: file.name.slice(0, 120), created, updated, skipped, errors: parsed.errors.length } });
  revalidatePath(kind === "leads" ? "/admin/leads" : "/admin/clientes");
  return { ok: true, imported: true, ...summary, errors: parsed.errors, created, updated, skipped,
    message: `Importação concluída: ${created} novo(s), ${updated} atualizado(s), ${skipped} ignorado(s) por já existirem${parsed.errors.length ? `, ${parsed.errors.length} linha(s) com erro` : ""}.` };
}
