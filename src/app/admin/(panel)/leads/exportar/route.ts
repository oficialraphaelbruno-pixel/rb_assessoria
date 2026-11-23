import { getStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";
import { SOURCES, STAGES } from "@/lib/admin/crm-constants";
import { buildTemplate, COLUMNS, leadToSheetRow } from "@/lib/spreadsheet";

/**
 * Planilha de leads no MESMO formato do modelo de importação (Excel por padrão; ?formato=csv para CSV).
 * Filtros: tipo, etapa, origem, marketing=1, de/ate (AAAA-MM-DD).
 */
export async function GET(req: Request) {
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") return new Response("Não autorizado", { status: 401 });
  const sp = new URL(req.url).searchParams;
  const db = await createClient();
  let q = db.from("leads").select("*").order("created_at", { ascending: false }).limit(5000);
  const tipo = sp.get("tipo"), etapa = sp.get("etapa"), origem = sp.get("origem");
  if (tipo && ["clube", "empresa", "outro"].includes(tipo)) q = q.eq("audience", tipo);
  if (etapa && STAGES.some((s) => s.value === etapa)) q = q.eq("stage", etapa);
  if (origem && SOURCES.includes(origem)) q = q.eq("source", origem);
  if (sp.get("marketing") === "1") q = q.eq("marketing_consent", true);
  const de = sp.get("de"), ate = sp.get("ate");
  if (de && /^\d{4}-\d{2}-\d{2}$/.test(de)) q = q.gte("created_at", de);
  if (ate && /^\d{4}-\d{2}-\d{2}$/.test(ate)) q = q.lte("created_at", ate + "T23:59:59");
  const { data } = await q;
  const rows = (data ?? []).map((l) => leadToSheetRow({ ...l, notes: [l.message, l.notes].filter(Boolean).join(" | ") || null }));
  await db.from("audit_log").insert({ actor: staff.id, action: "export", entity: "leads", details: { count: rows.length, tipo, etapa, origem } });
  const base = `contatos-${tipo ?? "todos"}-${new Date().toISOString().slice(0, 10)}`;
  if (sp.get("formato") === "csv") {
    const csv = toCsv(rows as Record<string, unknown>[], COLUMNS.leads.map((c) => [c.key, c.header] as [string, string]));
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${base}.csv"` } });
  }
  const buf = await buildTemplate("leads", rows as unknown as Record<string, string>[]);
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${base}.xlsx"` } });
}
