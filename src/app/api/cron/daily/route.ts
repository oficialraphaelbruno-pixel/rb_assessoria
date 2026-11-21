import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { sendAdminEmail } from "@/lib/notify";

export const dynamic = "force-dynamic";

/** Rotina diária (Vercel Cron): alerta de vencimentos de hoje/amanhã e recebimentos atrasados. */
export async function GET(req: Request) {
  if (!env.cronSecret || req.headers.get("authorization") !== `Bearer ${env.cronSecret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "server_not_configured" }, { status: 503 });
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  const tomorrow = new Date(Date.parse(today) + 864e5).toISOString().slice(0, 10);
  const [{ data: due }, { data: overdue }] = await Promise.all([
    admin.from("fin_transactions").select("id, kind, description, amount_cents, due_date").eq("status", "previsto").gte("due_date", today).lte("due_date", tomorrow),
    admin.from("fin_transactions").select("id").eq("status", "previsto").eq("kind", "receita").lt("due_date", today),
  ]);
  const notes = (due ?? []).map((t) => ({
    kind: "vencimento", title: `${t.kind === "receita" ? "A receber" : "A pagar"} ${t.due_date === today ? "hoje" : "amanhã"}: ${t.description}`,
    body: (t.amount_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), link: `/admin/financeiro/lancamentos/${t.id}`,
  }));
  if (overdue?.length) notes.push({ kind: "vencimento", title: `${overdue.length} recebimento(s) em atraso`, body: "Verifique a inadimplência no financeiro.", link: "/admin/financeiro" });
  if (notes.length) {
    await admin.from("notifications").insert(notes);
    await sendAdminEmail("Resumo diário — RB Assessoria", Object.fromEntries(notes.map((n, i) => [String(i + 1), `${n.title} — ${n.body}`])), "/admin/notificacoes");
  }
  return NextResponse.json({ ok: true, notifications: notes.length });
}
