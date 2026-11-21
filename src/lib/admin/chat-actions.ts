"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReply, loadChatSettings } from "@/lib/ai/engine";
import { PROVIDERS } from "@/lib/ai/providers";
import { UUID } from "./parse";
import type { ActionResult } from "./actions";

const num = (fd: FormData, k: string) => Number(String(fd.get(k) ?? "").replace(",", "."));

export async function saveChatSettings(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const staff = await requireAdmin();
  const provider = String(fd.get("provider"));
  if (!(provider in PROVIDERS)) return { ok: false, error: "Provedor inválido." };
  const row = {
    enabled: fd.get("enabled") === "on",
    provider,
    model: String(fd.get("model") || "").trim().slice(0, 80),
    assistant_name: String(fd.get("assistant_name") || "Assistente RB").slice(0, 60),
    welcome_message: String(fd.get("welcome_message") || "").slice(0, 500),
    tone: String(fd.get("tone") || "").slice(0, 1500),
    rules: String(fd.get("rules") || "").slice(0, 6000),
    fallback_message: String(fd.get("fallback_message") || "").slice(0, 500),
    max_messages_per_conversation: Math.round(num(fd, "max_messages_per_conversation")),
    max_output_tokens: Math.round(num(fd, "max_output_tokens")),
    monthly_budget_usd: num(fd, "monthly_budget_usd"),
    alert_threshold_pct: Math.round(num(fd, "alert_threshold_pct")),
    price_input_per_mtok: num(fd, "price_input_per_mtok"),
    price_output_per_mtok: num(fd, "price_output_per_mtok"),
    updated_at: new Date().toISOString(),
  };
  if (!/^[a-z0-9.\-]+$/i.test(row.model)) return { ok: false, error: "Modelo inválido." };
  if (Object.values(row).some((v) => typeof v === "number" && !Number.isFinite(v))) return { ok: false, error: "Verifique os campos numéricos." };
  const db = await createClient();
  const { error } = await db.from("chat_settings").update(row).eq("id", 1);
  if (error) return { ok: false, error: error.message.includes("check") ? "Algum limite está fora do intervalo permitido." : "Não foi possível salvar." };
  await db.from("audit_log").insert({ actor: staff.id, action: "update", entity: "chat_settings", entity_id: "1", details: { enabled: row.enabled, provider, model: row.model } });
  revalidatePath("/admin/chatbot");
  return { ok: true, message: row.enabled ? "Configurações salvas. Chatbot ativo." : "Configurações salvas. Chatbot desativado (o site mostra contato/WhatsApp)." };
}

/** Marca resposta incorreta e, opcionalmente, cria um item oficial na base de conhecimento. */
export async function correctMessage(messageId: number, conversationId: string, _prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const staff = await requireAdmin();
  const correction = String(fd.get("correction") || "").trim().slice(0, 4000);
  if (!Number.isInteger(messageId) || !UUID.test(conversationId)) return { ok: false, error: "Mensagem inválida." };
  const db = await createClient();
  await db.from("chat_messages").update({ flagged: true, correction: correction || null }).eq("id", messageId);
  if (correction && fd.get("add_to_kb") === "on") {
    const title = String(fd.get("question") || "Correção de resposta").trim().slice(0, 200);
    await db.from("knowledge_items").insert({ title, content: correction, category: "faq", source_document: `Correção da conversa ${conversationId.slice(0, 8)}` });
  }
  await db.from("audit_log").insert({ actor: staff.id, action: "correct_reply", entity: "chat_messages", entity_id: String(messageId) });
  revalidatePath(`/admin/chatbot/conversas/${conversationId}`);
  return { ok: true, message: correction && fd.get("add_to_kb") === "on" ? "Correção salva e adicionada à base de conhecimento." : "Resposta marcada." };
}

export async function resolveHandoff(conversationId: string): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!UUID.test(conversationId)) return { ok: false, error: "Conversa inválida." };
  const db = await createClient();
  await db.from("chat_conversations").update({ needs_human: false, handoff_resolved_at: new Date().toISOString(), status: "encerrada" }).eq("id", conversationId);
  await db.from("audit_log").insert({ actor: staff.id, action: "resolve_handoff", entity: "chat_conversations", entity_id: conversationId });
  revalidatePath("/admin/chatbot/conversas");
  return { ok: true, message: "Atendimento marcado como resolvido." };
}

export async function deleteConversation(conversationId: string): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!UUID.test(conversationId)) return { ok: false, error: "Conversa inválida." };
  const db = await createClient();
  await db.from("chat_conversations").delete().eq("id", conversationId);
  await db.from("audit_log").insert({ actor: staff.id, action: "delete", entity: "chat_conversations", entity_id: conversationId });
  revalidatePath("/admin/chatbot/conversas");
  return { ok: true };
}

/** Teste do bot pelo painel: usa a configuração atual (mesmo se desativado). O custo é registrado. */
export async function testBot(history: { role: "user" | "assistant"; content: string }[], message: string) {
  const staff = await requireAdmin();
  const admin = createAdminClient();
  if (!admin) return { ok: false, reply: "Configure SUPABASE_SERVICE_ROLE_KEY no servidor para testar o bot." };
  const s = await loadChatSettings(admin);
  if (!s) return { ok: false, reply: "Configuração não encontrada." };
  const clean = history.slice(-12).map((h) => ({ role: h.role === "assistant" ? "assistant" as const : "user" as const, content: String(h.content).slice(0, 1500) }));
  const r = await generateReply(admin, s, clean, message.slice(0, 1500));
  // registra consumo do teste para o controle de custos
  const { data: conv } = await admin.from("chat_conversations").insert({ visitor_id: `teste-painel-${staff.id.slice(0, 8)}`, page: "/admin/chatbot/testar", status: "encerrada", message_count: 1, tokens_in: r.tokensIn, tokens_out: r.tokensOut, cost_usd: r.costUsd }).select("id").single();
  if (conv) await admin.from("chat_messages").insert([
    { conversation_id: conv.id, role: "user", content: message.slice(0, 1500) },
    { conversation_id: conv.id, role: "assistant", content: r.reply, provider: r.provider ?? null, model: r.model ?? null, tokens_in: r.tokensIn, tokens_out: r.tokensOut, cost_usd: r.costUsd, is_fallback: r.isFallback },
  ]);
  return { ok: !r.isFallback, reply: r.reply, handoff: r.handoff, tokensIn: r.tokensIn, tokensOut: r.tokensOut, costUsd: r.costUsd };
}
