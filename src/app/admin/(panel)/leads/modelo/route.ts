import { getStaff } from "@/lib/auth";
import { buildTemplate } from "@/lib/spreadsheet";

export async function GET() {
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") return new Response("Não autorizado", { status: 401 });
  const buf = await buildTemplate("leads");
  return new Response(new Uint8Array(buf), { headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": 'attachment; filename="modelo-leads-rb.xlsx"',
  } });
}
