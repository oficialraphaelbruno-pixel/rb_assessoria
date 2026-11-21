import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createLead } from "@/lib/leads";
import { ipHash, sameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

const schema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  visitorId: z.string().min(8).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  name: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(5).max(200),
  interest: z.string().trim().max(200).optional().default(""),
  consent: z.literal(true),
});

export async function POST(req: Request) {
  if (!(await sameOrigin())) return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Preencha nome, contato e autorize o uso dos dados." }, { status: 422 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Use o formulário de contato." }, { status: 503 });
  const d = parsed.data;
  const hash = await ipHash();
  const { data: ok } = await admin.rpc("hit_rate_limit", { p_bucket: `chatlead:${hash}`, p_limit: 5, p_window_seconds: 3600 });
  if (ok === false) return NextResponse.json({ error: "Muitas tentativas. Tente mais tarde." }, { status: 429 });

  const isEmail = d.contact.includes("@");
  let transcript = "";
  if (d.conversationId) {
    const { data: conv } = await admin.from("chat_conversations").select("id").eq("id", d.conversationId).eq("visitor_id", d.visitorId).maybeSingle();
    if (conv) {
      const { data: msgs } = await admin.from("chat_messages").select("role, content").eq("conversation_id", conv.id).order("created_at").limit(20);
      transcript = (msgs ?? []).map((m) => `${m.role === "user" ? "Visitante" : "Bot"}: ${m.content}`).join("\n").slice(0, 3500);
    } else d.conversationId = null;
  }
  const leadId = await createLead(admin, {
    name: d.name, email: isEmail ? d.contact.toLowerCase() : "", phone: isEmail ? "" : d.contact, company: "",
    service: d.interest, message: transcript ? `Conversa no chat:\n${transcript}` : "", source: "chatbot",
    landing_page: "", utm: {}, consent: true, ip_hash: hash,
  });
  if (d.conversationId) await admin.from("chat_conversations").update({ lead_id: leadId }).eq("id", d.conversationId);
  return NextResponse.json({ ok: true });
}
