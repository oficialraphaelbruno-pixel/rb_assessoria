"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UUID } from "./parse";
import type { ActionResult } from "./actions";

export async function setUserRole(userId: string, role: string): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!UUID.test(userId) || !["pending", "editor", "admin"].includes(role)) return { ok: false, error: "Dados inválidos." };
  if (userId === staff.id) return { ok: false, error: "Você não pode alterar o próprio papel." };
  const db = await createClient();
  const { error } = await db.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, error: "Não foi possível alterar." };
  await db.from("audit_log").insert({ actor: staff.id, action: "set_role", entity: "profiles", entity_id: userId, details: { role } });
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function toggleIntegration(key: string, enabled: boolean): Promise<ActionResult> {
  const staff = await requireAdmin();
  const db = await createClient();
  const { error } = await db.from("integrations").update({ enabled, updated_at: new Date().toISOString() }).eq("key", key);
  if (error) return { ok: false, error: "Não foi possível alterar." };
  await db.from("audit_log").insert({ actor: staff.id, action: enabled ? "enable" : "disable", entity: "integrations", entity_id: key });
  revalidatePath("/admin/integracoes");
  return { ok: true };
}

export async function registerDocument(data: { name: string; path: string; kind: string; client_id: string | null; size: number; mime: string; notes: string }): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!/^[a-z0-9/_.-]+$/i.test(data.path) || data.path.includes("..")) return { ok: false, error: "Caminho inválido." };
  if (data.client_id && !UUID.test(data.client_id)) return { ok: false, error: "Cliente inválido." };
  const db = await createClient();
  const { error } = await db.from("documents").insert({ name: data.name.slice(0, 200), path: data.path, kind: data.kind, client_id: data.client_id, size_bytes: data.size, mime: data.mime.slice(0, 100), notes: data.notes.slice(0, 1000) || null, created_by: staff.id });
  if (error) return { ok: false, error: "Arquivo enviado, mas não registrado." };
  await db.from("audit_log").insert({ actor: staff.id, action: "upload", entity: "documents", details: { path: data.path } });
  revalidatePath("/admin/documentos");
  return { ok: true, message: "Documento enviado." };
}

/** Link temporário (5 min) para baixar documento do bucket privado. */
export async function documentLink(id: string): Promise<ActionResult & { url?: string }> {
  const staff = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Documento inválido." };
  const db = await createClient();
  const { data: doc } = await db.from("documents").select("path").eq("id", id).single();
  if (!doc) return { ok: false, error: "Documento não encontrado." };
  const { data, error } = await db.storage.from("documents").createSignedUrl(doc.path, 300);
  if (error) return { ok: false, error: "Não foi possível gerar o link." };
  await db.from("audit_log").insert({ actor: staff.id, action: "download", entity: "documents", entity_id: id });
  return { ok: true, url: data.signedUrl };
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Documento inválido." };
  const db = await createClient();
  const { data: doc } = await db.from("documents").select("path").eq("id", id).single();
  if (!doc) return { ok: false, error: "Documento não encontrado." };
  await db.storage.from("documents").remove([doc.path]);
  await db.from("documents").delete().eq("id", id);
  await db.from("audit_log").insert({ actor: staff.id, action: "delete", entity: "documents", entity_id: id });
  revalidatePath("/admin/documentos");
  return { ok: true };
}
