import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeadInput } from "@/lib/validation";
import { sendAdminEmail } from "@/lib/notify";

export const CONSENT_TEXT =
  "Autorizo a RB Assessoria & Comunicação a usar meus dados para retornar este contato, conforme a Política de Privacidade.";

type CreateLead = Omit<LeadInput, "website" | "consent"> & { consent: boolean; ip_hash?: string };

/** Cria lead com o cliente de serviço (rotas de servidor) + notificação interna + e-mail opcional. */
export async function createLead(admin: SupabaseClient, input: CreateLead) {
  const { data, error } = await admin.from("leads").insert({
    name: input.name, company: input.company || null, email: input.email || null, phone: input.phone || null,
    service: input.service || null, message: input.message || null, source: input.source || "site",
    utm: input.utm ?? {}, landing_page: input.landing_page || null, consent: input.consent,
    consent_at: input.consent ? new Date().toISOString() : null, consent_text: input.consent ? CONSENT_TEXT : null,
    ip_hash: input.ip_hash ?? null,
  }).select("id").single();
  if (error) throw error;
  const link = `/admin/leads/${data.id}`;
  await admin.from("notifications").insert({ kind: "lead", title: `Novo lead: ${input.name}`, body: input.service || `Origem: ${input.source}`, link });
  await sendAdminEmail(`Novo lead: ${input.name}`, {
    Nome: input.name, Empresa: input.company, "E-mail": input.email, WhatsApp: input.phone,
    Serviço: input.service, Origem: input.source, Mensagem: input.message,
  }, link);
  return data.id as string;
}
