"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { UUID } from "./parse";
import type { ActionResult } from "./actions";

export async function updateMedia(id: string, data: { name: string; alt: string; category: string }): Promise<ActionResult> {
  const staff = await requireStaff();
  if (!UUID.test(id)) return { ok: false, error: "Arquivo inválido." };
  const db = await createClient();
  const { error } = await db.from("media").update({
    name: data.name.trim().slice(0, 200) || "imagem", alt: data.alt.trim().slice(0, 300), category: slugify(data.category) || "geral",
  }).eq("id", id);
  if (error) return { ok: false, error: "Não foi possível salvar." };
  await db.from("audit_log").insert({ actor: staff.id, action: "update", entity: "media", entity_id: id });
  revalidatePath("/admin/midia");
  return { ok: true, message: "Salvo." };
}

/** Verifica onde a imagem é usada antes de excluir (exclusão segura). */
async function findUsage(url: string) {
  const db = await createClient();
  const [st, sv, pc] = await Promise.all([
    db.from("site_settings").select("label, draft, published"),
    db.from("services").select("title, cover_url"),
    db.from("portfolio_clients").select("name, logo_url, cover_url, gallery"),
  ]);
  const has = (v: unknown) => JSON.stringify(v ?? "").includes(url);
  return [
    ...(st.data ?? []).filter((r) => has(r.draft) || has(r.published)).map((r) => `Conteúdo: ${r.label}`),
    ...(sv.data ?? []).filter((r) => has(r.cover_url)).map((r) => `Serviço: ${r.title}`),
    ...(pc.data ?? []).filter((r) => has([r.logo_url, r.cover_url, r.gallery])).map((r) => `Cliente: ${r.name}`),
  ];
}

export async function deleteMedia(id: string, force = false): Promise<ActionResult & { usage?: string[] }> {
  const staff = await requireStaff();
  if (!UUID.test(id)) return { ok: false, error: "Arquivo inválido." };
  const db = await createClient();
  const { data: m } = await db.from("media").select("*").eq("id", id).single();
  if (!m) return { ok: false, error: "Arquivo não encontrado." };
  if (!force) {
    const usage = await findUsage(m.url);
    if (usage.length) return { ok: false, usage, error: `Esta imagem está em uso: ${usage.join("; ")}.` };
  }
  const { error: stErr } = await db.storage.from("media").remove([m.path]);
  if (stErr) return { ok: false, error: "Não foi possível remover o arquivo do armazenamento." };
  await db.from("media").delete().eq("id", id);
  await db.from("audit_log").insert({ actor: staff.id, action: "delete", entity: "media", entity_id: id, details: { path: m.path } });
  revalidatePath("/admin/midia");
  return { ok: true, message: "Excluído." };
}
