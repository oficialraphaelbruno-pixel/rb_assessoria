import { getStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";
import { buildTemplate, clientToSheetRow, COLUMNS } from "@/lib/spreadsheet";

export async function GET(req: Request) {
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") return new Response("Não autorizado", { status: 401 });
  const db = await createClient();
  const { data } = await db.from("crm_clients").select("*").order("name");
  const rows = (data ?? []).map(clientToSheetRow);
  await db.from("audit_log").insert({ actor: staff.id, action: "export", entity: "crm_clients", details: { count: rows.length } });
  const base = `clientes-crm-${new Date().toISOString().slice(0, 10)}`;
  if (new URL(req.url).searchParams.get("formato") === "csv") {
    const csv = toCsv(rows as Record<string, unknown>[], COLUMNS.clientes.map((c) => [c.key, c.header] as [string, string]));
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${base}.csv"` } });
  }
  const buf = await buildTemplate("clientes", rows as unknown as Record<string, string>[]);
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${base}.xlsx"` } });
}
