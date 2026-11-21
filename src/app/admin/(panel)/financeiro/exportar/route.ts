import { getStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";
import { monthRange } from "@/lib/finance";

export async function GET(req: Request) {
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") return new Response("Não autorizado", { status: 401 });
  const mes = new URL(req.url).searchParams.get("mes");
  const db = await createClient();
  let q = db.from("v_fin_transactions").select("*").order("due_date");
  if (mes && /^\d{4}-\d{2}$/.test(mes)) { const r = monthRange(mes); q = q.gte("due_date", r.start).lte("due_date", r.end); }
  const { data } = await q;
  const money = (c: number | null) => (c == null ? "" : (c / 100).toFixed(2).replace(".", ","));
  const rows = (data ?? []).map((t) => ({ ...t, valor: money(t.amount_cents), valor_pago: money(t.paid_amount_cents) }));
  const csv = toCsv(rows, [["due_date", "Vencimento"], ["kind", "Tipo"], ["description", "Descrição"], ["category_name", "Categoria"], ["client_name", "Cliente"],
    ["valor", "Valor"], ["effective_status", "Status"], ["paid_at", "Data pagamento"], ["valor_pago", "Valor pago"], ["expense_type", "Despesa fixa/variável"], ["payment_method", "Forma"], ["notes", "Observações"]]);
  await db.from("audit_log").insert({ actor: staff.id, action: "export", entity: "fin_transactions", details: { mes } });
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="financeiro-${mes ?? "completo"}.csv"` } });
}
