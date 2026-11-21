import { getStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") return new Response("Não autorizado", { status: 401 });
  const db = await createClient();
  const { data } = await db.from("leads").select("created_at, name, company, email, phone, service, source, stage, estimated_value_cents, landing_page, utm").order("created_at", { ascending: false });
  const rows = (data ?? []).map((l) => ({ ...l, estimated_value: l.estimated_value_cents != null ? (l.estimated_value_cents / 100).toFixed(2).replace(".", ",") : "", utm: JSON.stringify(l.utm ?? {}) }));
  const csv = toCsv(rows, [
    ["created_at", "Data"], ["name", "Nome"], ["company", "Empresa"], ["email", "E-mail"], ["phone", "WhatsApp"], ["service", "Serviço"],
    ["source", "Origem"], ["stage", "Etapa"], ["estimated_value", "Valor estimado"], ["landing_page", "Página de entrada"], ["utm", "UTM"],
  ]);
  await db.from("audit_log").insert({ actor: staff.id, action: "export", entity: "leads", details: { count: rows.length } });
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
