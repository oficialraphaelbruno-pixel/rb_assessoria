import { getStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") return new Response("Não autorizado", { status: 401 });
  const db = await createClient();
  const { data } = await db.from("crm_clients").select("name, company, phone, email, service, monthly_value_cents, start_date, due_day, status, notes").order("name");
  const rows = (data ?? []).map((c) => ({ ...c, mensal: (c.monthly_value_cents / 100).toFixed(2).replace(".", ","), whatsapp_link: c.phone ? `https://wa.me/${(c.phone.replace(/\D/g, "").length <= 11 ? "55" : "") + c.phone.replace(/\D/g, "")}` : "" }));
  const csv = toCsv(rows, [["name", "Nome"], ["company", "Empresa"], ["email", "E-mail"], ["phone", "Telefone"], ["whatsapp_link", "Link WhatsApp"], ["service", "Serviço"],
    ["mensal", "Valor mensal"], ["start_date", "Início"], ["due_day", "Dia de vencimento"], ["status", "Status"], ["notes", "Observações"]]);
  await db.from("audit_log").insert({ actor: staff.id, action: "export", entity: "crm_clients", details: { count: rows.length } });
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="clientes-crm-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
