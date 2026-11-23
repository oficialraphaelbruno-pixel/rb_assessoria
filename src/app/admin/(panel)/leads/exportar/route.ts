import { getStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";
import { SOURCES, SOURCE_LABEL, STAGES } from "@/lib/admin/crm-constants";
import { AUDIENCE_LABEL } from "@/lib/resend";

/** Planilha com os dados do formulário do site (abre direto no Excel/Google Planilhas). Filtros: tipo, etapa, origem, marketing, período. */
export async function GET(req: Request) {
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") return new Response("Não autorizado", { status: 401 });
  const sp = new URL(req.url).searchParams;
  const db = await createClient();
  let q = db.from("leads").select("created_at, name, company, email, phone, service, message, audience, source, stage, estimated_value_cents, consent, marketing_consent, landing_page, utm, notes").order("created_at", { ascending: false }).limit(5000);
  const tipo = sp.get("tipo"), etapa = sp.get("etapa"), origem = sp.get("origem");
  if (tipo && tipo in AUDIENCE_LABEL) q = q.eq("audience", tipo);
  if (etapa && STAGES.some((s) => s.value === etapa)) q = q.eq("stage", etapa);
  if (origem && SOURCES.includes(origem)) q = q.eq("source", origem);
  if (sp.get("marketing") === "1") q = q.eq("marketing_consent", true);
  const de = sp.get("de"), ate = sp.get("ate");
  if (de && /^\d{4}-\d{2}-\d{2}$/.test(de)) q = q.gte("created_at", de);
  if (ate && /^\d{4}-\d{2}-\d{2}$/.test(ate)) q = q.lte("created_at", ate + "T23:59:59");
  const { data } = await q;
  const rows = (data ?? []).map((l) => {
    const utm = (l.utm ?? {}) as Record<string, string>;
    return {
      ...l,
      data: new Date(l.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      tipo: AUDIENCE_LABEL[l.audience] ?? l.audience,
      origem: SOURCE_LABEL[l.source] ?? l.source,
      etapa: STAGES.find((s) => s.value === l.stage)?.label ?? l.stage,
      whatsapp_link: l.phone ? `https://wa.me/${(l.phone.replace(/\D/g, "").length <= 11 ? "55" : "") + l.phone.replace(/\D/g, "")}` : "",
      valor: l.estimated_value_cents != null ? (l.estimated_value_cents / 100).toFixed(2).replace(".", ",") : "",
      aceita_marketing: l.marketing_consent ? "Sim" : "Não",
      campanha: utm.utm_campaign ?? "", fonte_utm: utm.utm_source ?? "",
    };
  });
  const csv = toCsv(rows, [
    ["data", "Data"], ["name", "Nome"], ["company", "Empresa / equipe"], ["email", "E-mail"], ["phone", "WhatsApp"], ["whatsapp_link", "Link WhatsApp"],
    ["service", "Serviço desejado"], ["message", "Mensagem"], ["tipo", "Tipo"], ["origem", "Origem"], ["fonte_utm", "Fonte (UTM)"], ["campanha", "Campanha (UTM)"],
    ["etapa", "Etapa do funil"], ["valor", "Valor estimado"], ["aceita_marketing", "Aceita e-mails de marketing"], ["notes", "Observações"],
  ]);
  await db.from("audit_log").insert({ actor: staff.id, action: "export", entity: "leads", details: { count: rows.length, tipo, etapa, origem } });
  const name = `contatos-${tipo ?? "todos"}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"` } });
}
