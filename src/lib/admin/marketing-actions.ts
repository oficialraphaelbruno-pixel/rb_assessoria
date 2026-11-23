"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { syncLeadToResend, unsubscribeInResend } from "@/lib/resend";
import { UUID } from "./parse";
import type { ActionResult } from "./actions";

const COLS = "id, name, email, company, service, audience, marketing_consent";

export async function syncLead(id: string): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Lead inválido." };
  const db = await createClient();
  const { data: lead } = await db.from("leads").select(COLS).eq("id", id).single();
  if (!lead) return { ok: false, error: "Lead não encontrado." };
  const r = await syncLeadToResend(db, lead);
  await db.from("audit_log").insert({ actor: staff.id, action: "resend_sync", entity: "leads", entity_id: id, details: { ok: r.ok } });
  revalidatePath("/admin/email-marketing"); revalidatePath(`/admin/leads/${id}`);
  return r.ok ? { ok: true, message: "Contato enviado ao Resend." } : { ok: false, error: r.error };
}

export async function syncPending(): Promise<ActionResult> {
  const staff = await requireAdmin();
  const db = await createClient();
  const { data } = await db.from("leads").select(COLS).eq("marketing_consent", true).not("email", "is", null).is("resend_synced_at", null).limit(100);
  let ok = 0, fail = 0;
  for (const lead of data ?? []) (await syncLeadToResend(db, lead)).ok ? ok++ : fail++;
  await db.from("audit_log").insert({ actor: staff.id, action: "resend_sync_batch", entity: "leads", details: { ok, fail } });
  revalidatePath("/admin/email-marketing");
  return fail ? { ok: false, error: `${ok} enviado(s), ${fail} com erro (veja a coluna de status).` } : { ok: true, message: `${ok} contato(s) enviados ao Resend.` };
}

/** Registra consentimento obtido pela equipe (ex.: confirmado por WhatsApp) e sincroniza. */
export async function grantMarketingConsent(id: string): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Lead inválido." };
  const db = await createClient();
  const { data: lead } = await db.from("leads").update({ marketing_consent: true, marketing_consent_at: new Date().toISOString() })
    .eq("id", id).not("email", "is", null).select(COLS).single();
  if (!lead) return { ok: false, error: "O lead precisa ter e-mail." };
  await db.from("lead_activities").insert({ lead_id: id, kind: "nota", content: "Consentimento para e-mails de marketing registrado pela equipe.", created_by: staff.id });
  await db.from("audit_log").insert({ actor: staff.id, action: "marketing_consent_grant", entity: "leads", entity_id: id });
  const r = await syncLeadToResend(db, lead);
  revalidatePath("/admin/email-marketing"); revalidatePath(`/admin/leads/${id}`);
  return r.ok ? { ok: true, message: "Consentimento registrado e contato enviado ao Resend." } : { ok: true, message: `Consentimento registrado. Resend: ${r.error}` };
}

/** Revogação (LGPD): tira da base de campanhas e descadastra no Resend. */
export async function revokeMarketingConsent(id: string): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Lead inválido." };
  const db = await createClient();
  const { data: lead } = await db.from("leads").select("email").eq("id", id).single();
  if (!lead) return { ok: false, error: "Lead não encontrado." };
  if (lead.email) await unsubscribeInResend(lead.email);
  await db.from("leads").update({ marketing_consent: false, resend_synced_at: null }).eq("id", id);
  await db.from("lead_activities").insert({ lead_id: id, kind: "nota", content: "Consentimento de marketing revogado; contato descadastrado do Resend.", created_by: staff.id });
  await db.from("audit_log").insert({ actor: staff.id, action: "marketing_consent_revoke", entity: "leads", entity_id: id });
  revalidatePath("/admin/email-marketing"); revalidatePath(`/admin/leads/${id}`);
  return { ok: true, message: "Removido da base de campanhas." };
}
