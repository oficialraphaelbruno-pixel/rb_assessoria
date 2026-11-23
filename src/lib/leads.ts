import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeadInput } from "@/lib/validation";
import { sendAdminEmail } from "@/lib/notify";
import { syncLeadToResend } from "@/lib/resend";

export const CONSENT_TEXT =
  "Autorizo a RB Assessoria & Comunicação a usar meus dados para retornar este contato, conforme a Política de Privacidade.";

type CreateLead = Omit<LeadInput, "website" | "consent" | "marketing"> & { consent: boolean; marketing?: boolean; ip_hash?: string };

/** Cria lead com o cliente de serviço (rotas de servidor) + notificação interna + e-mail opcional. */
export async function createLead(admin: SupabaseClient, input: CreateLead) {
  const { data, error } = await admin.from("leads").insert({
    name: input.name, company: input.company || null, email: input.email || null, phone: input.phone || null,
    service: input.service || null, message: input.message || null, source: input.source || "site",
    utm: input.utm ?? {}, landing_page: input.landing_page || null, consent: input.consent,
    consent_at: input.consent ? new Date().toISOString() : null, consent_text: input.consent ? CONSENT_TEXT : null,
    ip_hash: input.ip_hash ?? null,
    marketing_consent: !!input.marketing && !!input.email,
    marketing_consent_at: input.marketing && input.email ? new Date().toISOString() : null,
  }).select("id, name, email, company, service, audience, marketing_consent").single();
  if (error) throw error;
  const link = `/admin/leads/${data.id}`;
  // entra automaticamente na base de campanhas do Resend (somente com consentimento de marketing)
  if (data.marketing_consent) {
    try { await syncLeadToResend(admin, data); } catch (e) { console.error("[resend] falha ao sincronizar", e); }
  }
  await admin.from("notifications").insert({ kind: "lead", title: `Novo lead: ${input.name}`, body: input.service || `Origem: ${input.source}`, link });
  await sendAdminEmail(`Novo lead: ${input.name}`, {
    Nome: input.name, Empresa: input.company, "E-mail": input.email, WhatsApp: input.phone,
    Serviço: input.service, Origem: input.source, Mensagem: input.message,
    "Aceita e-mails de marketing": input.marketing ? "Sim" : "Não",
  }, link);
  return data.id as string;
}
