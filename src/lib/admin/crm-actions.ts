"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseBRLToCents } from "@/lib/utils";
import { UUID } from "./parse";
import type { ActionResult } from "./actions";
import { STAGES, SOURCES } from "./crm-constants";

const STAGE_VALUES: string[] = STAGES.map((s) => s.value);

async function log(action: string, entity: string, id: string, details: Record<string, unknown> = {}) {
  const staff = await requireAdmin();
  const db = await createClient();
  await db.from("audit_log").insert({ actor: staff.id, action, entity, entity_id: id, details });
  return { staff, db };
}

export async function updateLeadStage(id: string, stage: string): Promise<ActionResult> {
  if (!UUID.test(id) || !STAGE_VALUES.includes(stage)) return { ok: false, error: "Dados inválidos." };
  const { staff, db } = await log("stage", "leads", id, { stage });
  const { error } = await db.from("leads").update({ stage }).eq("id", id);
  if (error) return { ok: false, error: "Não foi possível atualizar." };
  await db.from("lead_activities").insert({ lead_id: id, kind: "status", content: `Etapa alterada para “${STAGES.find((s) => s.value === stage)!.label}”`, created_by: staff.id });
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function addLeadActivity(id: string, _prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const content = String(fd.get("content") || "").trim().slice(0, 4000);
  const kind = String(fd.get("kind") || "nota");
  if (!UUID.test(id) || !content) return { ok: false, error: "Escreva a anotação." };
  if (!["nota", "ligacao", "whatsapp", "email", "reuniao", "proposta"].includes(kind)) return { ok: false, error: "Tipo inválido." };
  const { staff, db } = await log("activity", "leads", id);
  await db.from("lead_activities").insert({ lead_id: id, kind, content, created_by: staff.id });
  revalidatePath(`/admin/leads/${id}`);
  return { ok: true, message: "Registrado no histórico." };
}

export async function updateLead(id: string, _prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Lead inválido." };
  const source = String(fd.get("source") || "site");
  const stage = String(fd.get("stage") || "novo");
  if (!SOURCES.includes(source) || !STAGE_VALUES.includes(stage)) return { ok: false, error: "Dados inválidos." };
  const value = String(fd.get("estimated_value") || "");
  const row = {
    name: String(fd.get("name") || "").trim().slice(0, 120),
    company: String(fd.get("company") || "").trim().slice(0, 160) || null,
    email: String(fd.get("email") || "").trim().toLowerCase().slice(0, 200) || null,
    phone: String(fd.get("phone") || "").trim().slice(0, 30) || null,
    service: String(fd.get("service") || "").trim().slice(0, 120) || null,
    source, stage,
    estimated_value_cents: value ? parseBRLToCents(value) : null,
    notes: String(fd.get("notes") || "").slice(0, 8000) || null,
    lost_reason: String(fd.get("lost_reason") || "").slice(0, 500) || null,
    audience: ["clube", "empresa", "outro"].includes(String(fd.get("audience"))) ? String(fd.get("audience")) : "outro",
    city: String(fd.get("city") || "").trim().slice(0, 80) || null,
    next_followup_at: /^\d{4}-\d{2}-\d{2}$/.test(String(fd.get("next_followup_at") || "")) ? String(fd.get("next_followup_at")) : null,
  };
  if (row.name.length < 2) return { ok: false, error: "Informe o nome." };
  const { db } = await log("update", "leads", id);
  const { error } = await db.from("leads").update(row).eq("id", id);
  if (error) return { ok: false, error: "Não foi possível salvar." };
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
  return { ok: true, message: "Lead atualizado." };
}

export async function createManualLead(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const staff = await requireAdmin();
  const name = String(fd.get("name") || "").trim().slice(0, 120);
  const source = String(fd.get("source") || "outro");
  if (name.length < 2) return { ok: false, error: "Informe o nome." };
  if (!SOURCES.includes(source)) return { ok: false, error: "Origem inválida." };
  const db = await createClient();
  const { data, error } = await db.from("leads").insert({
    name, source,
    email: String(fd.get("email") || "").trim().toLowerCase() || null,
    phone: String(fd.get("phone") || "").trim() || null,
    service: String(fd.get("service") || "").trim() || null,
    message: String(fd.get("message") || "").trim() || null,
    company: String(fd.get("company") || "").trim().slice(0, 160) || null,
    city: String(fd.get("city") || "").trim().slice(0, 80) || null,
    consent: fd.get("consent") === "on",
    consent_at: fd.get("consent") === "on" ? new Date().toISOString() : null,
    consent_text: fd.get("consent") === "on" ? "Consentimento obtido pela equipe em atendimento direto." : null,
  }).select("id").single();
  if (error) return { ok: false, error: "Não foi possível criar." };
  await db.from("audit_log").insert({ actor: staff.id, action: "create", entity: "leads", entity_id: data.id });
  revalidatePath("/admin/leads");
  return { ok: true, id: data.id, message: "Lead criado." };
}

export async function convertLeadToClient(id: string): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Lead inválido." };
  const { staff, db } = await log("convert", "leads", id);
  const { data: lead } = await db.from("leads").select("*").eq("id", id).single();
  if (!lead) return { ok: false, error: "Lead não encontrado." };
  if (lead.crm_client_id) return { ok: true, id: lead.crm_client_id, message: "Já convertido." };
  const { data: client, error } = await db.from("crm_clients").insert({
    name: lead.name, company: lead.company, phone: lead.phone, email: lead.email, service: lead.service,
    monthly_value_cents: lead.estimated_value_cents ?? 0, start_date: new Date().toISOString().slice(0, 10), status: "ativo", lead_id: id,
    notes: lead.notes,
  }).select("id").single();
  if (error) return { ok: false, error: "Não foi possível criar o cliente." };
  await db.from("leads").update({ stage: "fechado", crm_client_id: client.id }).eq("id", id);
  await db.from("client_history").insert({ client_id: client.id, content: "Cliente criado a partir de lead do funil.", created_by: staff.id });
  revalidatePath("/admin/leads");
  return { ok: true, id: client.id, message: "Cliente criado no CRM." };
}

/** Exclusão definitiva (atende pedidos de eliminação de dados — LGPD). */
export async function deleteLead(id: string): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Lead inválido." };
  const { db } = await log("delete", "leads", id);
  const { error } = await db.from("leads").delete().eq("id", id);
  if (error) return { ok: false, error: "Não foi possível excluir." };
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function addClientHistory(clientId: string, _prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const content = String(fd.get("content") || "").trim().slice(0, 4000);
  if (!UUID.test(clientId) || !content) return { ok: false, error: "Escreva o registro." };
  const { staff, db } = await log("history", "crm_clients", clientId);
  await db.from("client_history").insert({ client_id: clientId, content, created_by: staff.id });
  revalidatePath(`/admin/clientes/${clientId}`);
  return { ok: true, message: "Registrado." };
}

export async function markNotificationsRead(): Promise<ActionResult> {
  await requireAdmin();
  const db = await createClient();
  await db.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
