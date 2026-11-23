import { NextResponse } from "next/server";
import { createClient as createAnon } from "@supabase/supabase-js";
import { leadSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createLead } from "@/lib/leads";
import { ipHash, sameOrigin } from "@/lib/security";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  rate_limited: "Muitas tentativas. Tente novamente em alguns minutos.",
  consent_required: "É necessário autorizar o uso dos dados.",
};

export async function POST(req: Request) {
  if (!(await sameOrigin())) return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requisição inválida." }, { status: 400 }); }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return NextResponse.json({ error: "Verifique os campos destacados.", fieldErrors }, { status: 422 });
  }
  const data = parsed.data;
  if (data.website) return NextResponse.json({ ok: true }); // honeypot: finge sucesso para bots

  const admin = createAdminClient();
  try {
    if (admin) {
      const hash = await ipHash();
      const { data: allowed } = await admin.rpc("hit_rate_limit", { p_bucket: `lead:${hash}`, p_limit: 5, p_window_seconds: 3600 });
      if (allowed === false) return NextResponse.json({ error: ERRORS.rate_limited }, { status: 429 });
      await createLead(admin, { ...data, ip_hash: hash });
    } else {
      // Sem chave secreta: usa a RPC pública (validação e rate limit no banco).
      const anon = createAnon(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false } });
      const { error } = await anon.rpc("submit_lead", {
        p_name: data.name, p_email: data.email, p_phone: data.phone, p_company: data.company, p_service: data.service,
        p_message: data.message, p_consent: true, p_source: data.source, p_utm: data.utm, p_landing_page: data.landing_page, p_marketing: data.marketing,
      });
      if (error) {
        const code = Object.keys(ERRORS).find((k) => error.message.includes(k));
        return NextResponse.json({ error: code ? ERRORS[code] : "Não foi possível enviar agora." }, { status: code === "rate_limited" ? 429 : 400 });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[contact] falha ao salvar lead", e);
    return NextResponse.json({ error: "Não foi possível enviar agora. Tente pelo WhatsApp." }, { status: 500 });
  }
}
