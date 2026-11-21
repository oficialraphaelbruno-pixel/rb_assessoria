import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createLead } from "@/lib/leads";
import { env } from "@/lib/env";
import { SOURCES } from "@/lib/admin/crm-constants";

export const dynamic = "force-dynamic";

const schema = z.object({
  source: z.enum(SOURCES as [string, ...string[]]),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(200).optional().default(""),
  phone: z.string().trim().max(30).optional().default(""),
  company: z.string().trim().max(160).optional().default(""),
  service: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().max(4000).optional().default(""),
  consent: z.boolean().optional().default(false),
  utm: z.record(z.string().max(40), z.string().max(200)).optional().default({}),
});

function authorized(req: Request) {
  if (!env.leadsWebhookToken) return false;
  const got = Buffer.from((req.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""));
  const want = Buffer.from(env.leadsWebhookToken);
  return got.length === want.length && timingSafeEqual(got, want);
}

/** Entrada de leads de canais externos (ManyChat, anúncios, automações). */
export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "server_not_configured" }, { status: 503 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues.map((i) => i.path.join(".")) }, { status: 422 });
  const d = parsed.data;
  const { data: integ } = await admin.from("integrations").select("enabled").eq("key", d.source === "meta_ads" ? "meta_ads" : d.source).maybeSingle();
  if (integ && !integ.enabled) return NextResponse.json({ error: "source_disabled" }, { status: 403 });
  const id = await createLead(admin, { ...d, email: d.email.toLowerCase(), landing_page: "", ip_hash: undefined });
  return NextResponse.json({ ok: true, id });
}
