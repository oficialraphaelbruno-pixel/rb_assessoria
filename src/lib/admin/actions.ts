"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getResource } from "./resources";
import { requireAdmin, requireStaff, type Staff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CONTENT_TAG } from "@/lib/supabase/public";
import { SETTINGS_SCHEMA } from "@/lib/settings-defaults";
import { parseFieldValue } from "./parse";

export interface ActionResult { ok: boolean; error?: string; id?: string; message?: string }

import { UUID } from "./parse";

async function audit(staff: Staff, action: string, entity: string, entityId: string | null, details: Record<string, unknown> = {}) {
  const db = await createClient();
  await db.from("audit_log").insert({ actor: staff.id, action, entity, entity_id: entityId, details });
}

function afterContentChange(path: string) {
  revalidateTag(CONTENT_TAG);
  revalidatePath(path);
}

export async function saveResource(resourceKey: string, id: string | null, _prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const r = getResource(resourceKey);
  const staff = r.adminOnly ? await requireAdmin() : await requireStaff();
  if (id && !UUID.test(id)) return { ok: false, error: "Registro inválido." };

  const row: Record<string, unknown> = {};
  try {
    for (const f of r.fields) row[f.name] = await parseFieldValue(f, fd);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const db = await createClient();
  const q = id ? db.from(r.table).update(row).eq("id", id).select("id").single() : db.from(r.table).insert(row).select("id").single();
  const { data, error } = await q;
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um registro com esse endereço/nome." };
    if (error.code === "42501") return { ok: false, error: "Você não tem permissão para esta ação." };
    console.error("[saveResource]", r.table, error);
    return { ok: false, error: "Não foi possível salvar. Verifique os campos." };
  }
  await audit(staff, id ? "update" : "create", r.table, data.id, { title: row[r.titleField] });
  if (r.affectsSite) {
    await db.from("content_revisions").insert({ entity: r.table, entity_id: data.id, data: row, created_by: staff.id });
    afterContentChange("/");
  }
  revalidatePath(r.path);
  return { ok: true, id: data.id, message: "Alterações salvas." };
}

export async function deleteResource(resourceKey: string, id: string): Promise<ActionResult> {
  const r = getResource(resourceKey);
  const staff = r.adminOnly ? await requireAdmin() : await requireStaff();
  if (!UUID.test(id)) return { ok: false, error: "Registro inválido." };
  const db = await createClient();
  const { data: before } = await db.from(r.table).select("*").eq("id", id).maybeSingle();
  const { error } = await db.from(r.table).delete().eq("id", id);
  if (error) return { ok: false, error: error.code === "23503" ? "Este registro está vinculado a outros dados e não pode ser excluído." : "Não foi possível excluir." };
  await audit(staff, "delete", r.table, id, { snapshot: before });
  if (r.affectsSite) afterContentChange("/");
  revalidatePath(r.path);
  return { ok: true, message: "Excluído." };
}

export async function setResourceStatus(resourceKey: string, id: string, status: "draft" | "published"): Promise<ActionResult> {
  const r = getResource(resourceKey);
  if (!r.publishable) return { ok: false, error: "Este item não possui publicação." };
  const staff = await requireStaff();
  const db = await createClient();
  const { error } = await db.from(r.table).update({ status }).eq("id", id);
  if (error) return { ok: false, error: "Não foi possível alterar o status." };
  await audit(staff, status === "published" ? "publish" : "unpublish", r.table, id);
  afterContentChange("/");
  revalidatePath(r.path);
  return { ok: true, message: status === "published" ? "Publicado no site." : "Ocultado do site." };
}

/* ------------------------------------------------------------------ */
/* Blocos do site (site_settings)                                      */
/* ------------------------------------------------------------------ */

export async function saveSetting(key: string, publish: boolean, _prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const staff = await requireStaff();
  const def = SETTINGS_SCHEMA.find((d) => d.key === key);
  if (!def) return { ok: false, error: "Bloco desconhecido." };
  const value: Record<string, unknown> = {};
  try {
    for (const f of def.fields) value[f.name] = await parseFieldValue(f, fd);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  // URLs nulas viram string vazia para manter o formato do JSON
  for (const k of Object.keys(value)) if (value[k] === null) value[k] = "";

  const db = await createClient();
  const payload = { key, label: def.label, draft: value, updated_by: staff.id, ...(publish ? { published: value } : {}) };
  const { error } = await db.from("site_settings").upsert(payload, { onConflict: "key" });
  if (error) return { ok: false, error: "Não foi possível salvar." };
  await db.from("content_revisions").insert({ entity: "site_settings", entity_id: key, data: value, created_by: staff.id });
  await audit(staff, publish ? "publish" : "save_draft", "site_settings", key);
  if (publish) afterContentChange("/");
  revalidatePath(`/admin/conteudo/${key}`);
  return { ok: true, message: publish ? "Publicado! O site já exibe as alterações." : "Rascunho salvo. Use “Pré-visualizar” para conferir." };
}

export async function discardSettingDraft(key: string): Promise<ActionResult> {
  const staff = await requireStaff();
  const db = await createClient();
  const { data } = await db.from("site_settings").select("published").eq("key", key).single();
  if (!data) return { ok: false, error: "Bloco não encontrado." };
  await db.from("site_settings").update({ draft: data.published, updated_by: staff.id }).eq("key", key);
  await audit(staff, "discard_draft", "site_settings", key);
  revalidatePath(`/admin/conteudo/${key}`);
  return { ok: true, message: "Rascunho descartado." };
}

export async function restoreSettingRevision(key: string, revisionId: number): Promise<ActionResult> {
  const staff = await requireStaff();
  const db = await createClient();
  const { data: rev } = await db.from("content_revisions").select("data").eq("id", revisionId).eq("entity", "site_settings").eq("entity_id", key).single();
  if (!rev) return { ok: false, error: "Versão não encontrada." };
  await db.from("site_settings").update({ draft: rev.data, updated_by: staff.id }).eq("key", key);
  await audit(staff, "restore_revision", "site_settings", key, { revisionId });
  revalidatePath(`/admin/conteudo/${key}`);
  return { ok: true, message: "Versão restaurada como rascunho. Revise e publique." };
}
