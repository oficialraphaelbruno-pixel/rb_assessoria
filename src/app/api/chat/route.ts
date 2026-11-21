import { NextResponse } from "next/server";
import { chatSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReply, loadChatSettings, monthSpendUsd } from "@/lib/ai/engine";
import { ipHash, sameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const STATIC_FALLBACK =
  "No momento o atendimento automático está indisponível. Você pode deixar seu contato pelo formulário ou falar com a equipe pelo WhatsApp.";

export async function POST(req: Request) {
  if (!(await sameOrigin())) return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  const parsed = chatSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });
  const { visitorId, message, page } = parsed.data;
  let { conversationId } = parsed.data;

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ reply: STATIC_FALLBACK, fallback: true, conversationId: null });

  const settings = await loadChatSettings(admin);
  if (!settings?.enabled) return NextResponse.json({ reply: settings?.fallback_message || STATIC_FALLBACK, fallback: true, conversationId: null });

  // Rate limiting: por IP (curto prazo) e por visitante (diário)
  const hash = await ipHash();
  const [{ data: okIp }, { data: okVisitor }] = await Promise.all([
    admin.rpc("hit_rate_limit", { p_bucket: `chat-ip:${hash}`, p_limit: 30, p_window_seconds: 600 }),
    admin.rpc("hit_rate_limit", { p_bucket: `chat-v:${visitorId}`, p_limit: 80, p_window_seconds: 86400 }),
  ]);
  if (okIp === false || okVisitor === false) {
    return NextResponse.json({ error: "Você enviou muitas mensagens. Aguarde alguns minutos ou fale pelo WhatsApp." }, { status: 429 });
  }

  // Conversa: só reaproveita se pertencer ao mesmo visitante
  let conv: { id: string; message_count: number; needs_human: boolean; tokens_in: number; tokens_out: number; cost_usd: number } | null = null;
  if (conversationId) {
    const { data } = await admin.from("chat_conversations").select("id, message_count, needs_human, tokens_in, tokens_out, cost_usd")
      .eq("id", conversationId).eq("visitor_id", visitorId).maybeSingle();
    conv = data;
  }
  if (!conv) {
    const { data, error } = await admin.from("chat_conversations")
      .insert({ visitor_id: visitorId, ip_hash: hash, page: page ?? null })
      .select("id, message_count, needs_human, tokens_in, tokens_out, cost_usd").single();
    if (error) return NextResponse.json({ reply: settings.fallback_message, fallback: true, conversationId: null });
    conv = data;
  }
  conversationId = conv.id;

  if (conv.message_count >= settings.max_messages_per_conversation) {
    return NextResponse.json({
      conversationId, limitReached: true,
      reply: "Chegamos ao limite desta conversa automática. Para continuar, deixe seu contato ou fale com a equipe pelo WhatsApp. 🙂",
    });
  }

  // Orçamento mensal
  const spent = await monthSpendUsd(admin);
  const overBudget = settings.monthly_budget_usd > 0 && spent >= settings.monthly_budget_usd;

  await admin.from("chat_messages").insert({ conversation_id: conversationId, role: "user", content: message });

  const { data: historyRows } = await admin.from("chat_messages").select("role, content")
    .eq("conversation_id", conversationId).in("role", ["user", "assistant"]).order("created_at", { ascending: false }).limit(13);
  const history = (historyRows ?? []).reverse().slice(0, -1) as { role: "user" | "assistant"; content: string }[];

  const result = overBudget
    ? { reply: settings.fallback_message, handoff: true, isFallback: true, tokensIn: 0, tokensOut: 0, costUsd: 0, provider: undefined, model: undefined }
    : await generateReply(admin, settings, history, message);

  await admin.from("chat_messages").insert({
    conversation_id: conversationId, role: "assistant", content: result.reply, provider: result.provider ?? null,
    model: result.model ?? null, tokens_in: result.tokensIn, tokens_out: result.tokensOut, cost_usd: result.costUsd, is_fallback: result.isFallback,
  });

  const becameHandoff = result.handoff && !conv.needs_human;
  await admin.from("chat_conversations").update({
    message_count: conv.message_count + 1,
    tokens_in: conv.tokens_in + result.tokensIn,
    tokens_out: conv.tokens_out + result.tokensOut,
    cost_usd: Number(conv.cost_usd) + result.costUsd,
    last_message_at: new Date().toISOString(),
    ...(becameHandoff ? { needs_human: true, handoff_reason: result.isFallback ? "Falha/indisponibilidade da IA" : "Solicitação que exige atendimento humano" } : {}),
  }).eq("id", conversationId);

  if (becameHandoff) {
    await admin.from("notifications").insert({ kind: "chat_handoff", title: "Conversa aguardando atendimento humano", body: message.slice(0, 140), link: `/admin/chatbot/conversas/${conversationId}` });
  }
  // Alertas de consumo (uma vez por limiar por mês)
  const newSpent = spent + result.costUsd;
  if (settings.monthly_budget_usd > 0) {
    const pct = (newSpent / settings.monthly_budget_usd) * 100;
    const prevPct = (spent / settings.monthly_budget_usd) * 100;
    if ((prevPct < settings.alert_threshold_pct && pct >= settings.alert_threshold_pct) || (prevPct < 100 && pct >= 100)) {
      await admin.from("notifications").insert({ kind: "budget", title: `Chatbot atingiu ${Math.floor(pct)}% do limite mensal`, body: `Gasto estimado: US$ ${newSpent.toFixed(4)} de US$ ${settings.monthly_budget_usd.toFixed(2)}`, link: "/admin/chatbot" });
    }
  }

  return NextResponse.json({ conversationId, reply: result.reply, handoff: result.handoff, fallback: result.isFallback });
}
