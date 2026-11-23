import "server-only";
import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export const AUDIENCE_LABEL: Record<string, string> = { clube: "Clube / escolinha", empresa: "Empresa / profissional", outro: "Outro" };

export function resendConfigured() {
  return !!env.resendKey && !!env.resendSegmentId;
}

interface LeadForSync { id: string; name: string; email: string | null; company: string | null; service: string | null; audience: string; marketing_consent: boolean }

/**
 * Envia (ou atualiza) o contato no segmento da RB no Resend.
 * Só sincroniza quem deu consentimento explícito de marketing.
 * Registra o resultado no lead para acompanhamento no painel.
 */
export async function syncLeadToResend(db: SupabaseClient, lead: LeadForSync): Promise<{ ok: boolean; error?: string }> {
  if (!lead.marketing_consent || !lead.email) return { ok: false, error: "Lead sem consentimento de marketing ou sem e-mail." };
  if (!resendConfigured()) return { ok: false, error: "Resend não configurado (RESEND_API_KEY / RESEND_SEGMENT_ID)." };
  const resend = new Resend(env.resendKey);
  const [firstName, ...rest] = lead.name.trim().split(/\s+/);
  const properties = { rb_tipo: lead.audience, rb_empresa: lead.company ?? "", rb_servico: lead.service ?? "" };

  let contactId: string | null = null;
  let error: string | null = null;
  const created = await resend.contacts.create({
    email: lead.email, firstName, lastName: rest.join(" ") || undefined, unsubscribed: false,
    properties, segments: [{ id: env.resendSegmentId }],
  });
  if (created.data?.id) {
    contactId = created.data.id;
  } else {
    // contato já existe: atualiza dados e garante que está no segmento
    const upd = await resend.contacts.update({ email: lead.email, firstName, lastName: rest.join(" ") || undefined, unsubscribed: false, properties });
    if (upd.error) {
      error = created.error?.message || upd.error.message;
    } else {
      contactId = upd.data?.id ?? null;
      const seg = await resend.contacts.segments.add({ email: lead.email, segmentId: env.resendSegmentId });
      if (seg.error && !/already/i.test(seg.error.message)) error = seg.error.message;
    }
  }
  await db.from("leads").update({
    resend_contact_id: contactId, resend_synced_at: error ? null : new Date().toISOString(), resend_error: error,
  }).eq("id", lead.id);
  return error ? { ok: false, error } : { ok: true };
}

/** Remove da base de campanhas (revogação do consentimento): marca como descadastrado no Resend. */
export async function unsubscribeInResend(email: string) {
  if (!env.resendKey) return { ok: false, error: "Resend não configurado." };
  const resend = new Resend(env.resendKey);
  const r = await resend.contacts.update({ email, unsubscribed: true });
  return r.error ? { ok: false, error: r.error.message } : { ok: true };
}
