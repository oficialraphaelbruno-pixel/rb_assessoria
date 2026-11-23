import "server-only";
import ExcelJS from "exceljs";
import readXlsxFile from "read-excel-file/node";
import { parseCsv } from "@/lib/csv";
import { parseBRLToCents } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Modelos de planilha (Leads e Clientes CRM)                          */
/* As mesmas colunas são usadas na exportação, então dá para exportar, */
/* editar no Excel e importar de volta.                                */
/* ------------------------------------------------------------------ */

export type SheetKind = "leads" | "clientes";

interface Column {
  key: string;
  header: string;
  width: number;
  help: string;
  required?: boolean;
  options?: string[];
  aliases?: string[];
}

export const LEAD_TYPES: Record<string, string> = { "Clube / escolinha": "clube", "Empresa / profissional": "empresa", Outro: "outro" };
export const LEAD_SOURCES: Record<string, string> = {
  Site: "site", Instagram: "instagram", WhatsApp: "whatsapp", Indicação: "indicacao", Evento: "evento", "Meta Ads": "meta_ads",
  "Google Ads": "google_ads", ManyChat: "manychat", "E-mail": "email", Chatbot: "chatbot", Outro: "outro",
};
export const LEAD_STAGES: Record<string, string> = {
  "Novo lead": "novo", "Contato iniciado": "contato", Qualificado: "qualificado", "Proposta enviada": "proposta",
  Negociação: "negociacao", "Cliente fechado": "fechado", Perdido: "perdido",
};
export const CLIENT_STATUS: Record<string, string> = { Ativo: "ativo", Pausado: "pausado", Encerrado: "encerrado", Prospect: "prospect" };
const YES_NO = ["Sim", "Não"];

export const COLUMNS: Record<SheetKind, Column[]> = {
  leads: [
    { key: "name", header: "Nome do contato", width: 26, required: true, help: "Nome da pessoa responsável.", aliases: ["nome", "contato", "responsavel"] },
    { key: "company", header: "Empresa / equipe", width: 28, help: "Nome da empresa, clube ou escolinha.", aliases: ["empresa", "equipe", "escola", "escolinha", "clube", "time"] },
    { key: "email", header: "E-mail", width: 30, help: "Informe e-mail ou WhatsApp (pelo menos um).", aliases: ["email", "e mail"] },
    { key: "phone", header: "WhatsApp", width: 18, help: "Com DDD. Ex.: (31) 99999-9999.", aliases: ["whatsapp", "telefone", "celular", "fone", "contato telefone"] },
    { key: "city", header: "Cidade / UF", width: 20, help: "Ex.: Belo Horizonte/MG.", aliases: ["cidade", "cidade uf", "municipio"] },
    { key: "audience", header: "Tipo", width: 22, help: "Clube / escolinha, Empresa / profissional ou Outro. Em branco: o sistema classifica.", options: Object.keys(LEAD_TYPES), aliases: ["tipo", "publico", "segmento"] },
    { key: "service", header: "Serviço de interesse", width: 30, help: "Ex.: Site para clube, Social Media, Sistema de agendamento.", aliases: ["servico", "servico desejado", "interesse"] },
    { key: "source", header: "Origem", width: 16, help: "Onde o contato surgiu.", options: Object.keys(LEAD_SOURCES), aliases: ["origem", "fonte", "canal"] },
    { key: "stage", header: "Etapa do funil", width: 18, help: "Em branco: Novo lead.", options: Object.keys(LEAD_STAGES), aliases: ["etapa", "etapa do funil", "status", "fase"] },
    { key: "estimated_value", header: "Valor estimado (R$)", width: 18, help: "Valor mensal ou do projeto. Ex.: 1.500,00", aliases: ["valor", "valor estimado"] },
    { key: "next_followup_at", header: "Próximo retorno", width: 16, help: "Data para recontato (DD/MM/AAAA). Aparece no dashboard.", aliases: ["proximo retorno", "retorno", "follow up", "followup"] },
    { key: "notes", header: "Observações", width: 40, help: "Anotações internas.", aliases: ["observacoes", "obs", "notas", "mensagem"] },
    { key: "consent", header: "Autorizou contato?", width: 18, help: "Sim se a pessoa autorizou ser contatada/ter os dados guardados.", options: YES_NO, aliases: ["autorizou contato", "consentimento", "autorizou"] },
    { key: "marketing", header: "Aceita e-mails de marketing?", width: 26, help: "Só marque Sim com autorização expressa (LGPD). Quem tiver Sim entra no Resend.", options: YES_NO, aliases: ["aceita e mails de marketing", "aceita marketing", "marketing", "aceita e mails"] },
  ],
  clientes: [
    { key: "name", header: "Nome", width: 26, required: true, help: "Nome do cliente ou responsável.", aliases: ["nome", "cliente", "responsavel"] },
    { key: "company", header: "Empresa / equipe", width: 28, help: "Nome da empresa, clube ou escolinha.", aliases: ["empresa", "equipe", "escola", "clube"] },
    { key: "email", header: "E-mail", width: 30, help: "", aliases: ["email", "e mail"] },
    { key: "phone", header: "Telefone / WhatsApp", width: 20, help: "Com DDD.", aliases: ["telefone", "whatsapp", "celular", "telefone whatsapp"] },
    { key: "city", header: "Cidade / UF", width: 20, help: "Ex.: Belo Horizonte/MG.", aliases: ["cidade", "cidade uf"] },
    { key: "service", header: "Serviço contratado", width: 30, help: "Ex.: Social Media, Site, Sistema de agendamento.", aliases: ["servico", "servico contratado"] },
    { key: "monthly_value", header: "Valor mensal (R$)", width: 18, help: "Ex.: 1.200,00 (0 se for projeto avulso).", aliases: ["valor mensal", "mensal", "valor"] },
    { key: "start_date", header: "Data de início", width: 16, help: "DD/MM/AAAA.", aliases: ["inicio", "data de inicio", "data inicio"] },
    { key: "due_day", header: "Dia de vencimento", width: 16, help: "Número de 1 a 31.", aliases: ["vencimento", "dia de vencimento", "dia vencimento"] },
    { key: "status", header: "Status", width: 14, help: "Em branco: Ativo.", options: Object.keys(CLIENT_STATUS), aliases: ["status", "situacao"] },
    { key: "notes", header: "Observações", width: 40, help: "", aliases: ["observacoes", "obs", "notas"] },
  ],
};

const SHEET_NAME: Record<SheetKind, string> = { leads: "Leads", clientes: "Clientes" };
const NAVY = "FF0D3845";
const TURQ = "FF34B4B2";

/** Gera o modelo .xlsx com cabeçalho, listas suspensas e aba de instruções. */
export async function buildTemplate(kind: SheetKind, rows: Record<string, string | number | null>[] = []) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "RB Assessoria & Comunicação";
  const cols = COLUMNS[kind];
  const ws = wb.addWorksheet(SHEET_NAME[kind], { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = cols.map((c) => ({ header: c.header + (c.required ? " *" : ""), key: c.key, width: c.width }));
  const head = ws.getRow(1);
  head.height = 30;
  head.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.border = { bottom: { style: "medium", color: { argb: TURQ } } };
  });
  rows.forEach((r) => ws.addRow(r));
  const lastRow = Math.max(rows.length + 1, 1000);
  cols.forEach((c, i) => {
    const col = ws.getColumn(i + 1);
    if (c.options) {
      for (let r = 2; r <= lastRow; r++) {
        ws.getCell(r, i + 1).dataValidation = {
          type: "list", allowBlank: true, formulae: [`"${c.options.join(",")}"`],
          showErrorMessage: true, errorTitle: "Valor inválido", error: `Use: ${c.options.join(", ")}`,
        };
      }
    }
    col.alignment = { vertical: "top", wrapText: c.key === "notes" };
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };

  const help = wb.addWorksheet("Instruções");
  help.columns = [{ header: "Coluna", key: "c", width: 30 }, { header: "Obrigatória", key: "o", width: 12 }, { header: "Como preencher", key: "h", width: 70 }, { header: "Valores aceitos", key: "v", width: 60 }];
  help.getRow(1).eachCell((cell) => { cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } }; });
  cols.forEach((c) => help.addRow({ c: c.header, o: c.required ? "Sim" : (kind === "leads" && (c.key === "email" || c.key === "phone") ? "E-mail ou WhatsApp" : "Não"), h: c.help, v: c.options?.join(" · ") ?? "" }));
  help.addRow({});
  [
    `Preencha a aba “${SHEET_NAME[kind]}” a partir da linha 2 (uma linha por ${kind === "leads" ? "contato" : "cliente"}). Não altere os títulos da linha 1.`,
    "Salve como .xlsx (Excel) ou .csv e envie no painel em “Importar planilha”. Primeiro clique em “Validar” para conferir; depois em “Importar”.",
    kind === "leads"
      ? "Contatos já existentes (mesmo e-mail ou WhatsApp) são ignorados ou atualizados, conforme a opção escolhida na importação."
      : "Clientes já existentes (mesmo e-mail, telefone ou nome) são ignorados ou atualizados, conforme a opção escolhida na importação.",
    "LGPD: só importe contatos obtidos de forma legítima. “Aceita e-mails de marketing” = Sim apenas com autorização expressa da pessoa.",
  ].forEach((t) => { const r = help.addRow({ c: t }); help.mergeCells(r.number, 1, r.number, 4); r.getCell(1).alignment = { wrapText: true }; r.height = 32; });
  return Buffer.from(await wb.xlsx.writeBuffer());
}

/* ------------------------------------------------------------------ */
/* Leitura                                                             */
/* ------------------------------------------------------------------ */

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\(.*?\)|\*/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export async function readUpload(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || name.endsWith(".txt") || file.type === "text/csv") return parseCsv(await file.text());
  if (!name.endsWith(".xlsx")) throw new Error("Formato não suportado. Envie .xlsx (Excel) ou .csv.");
  let sheets;
  try {
    sheets = await readXlsxFile(Buffer.from(await file.arrayBuffer()));
  } catch {
    throw new Error("Não foi possível ler o arquivo Excel. Salve novamente como .xlsx ou exporte como .csv.");
  }
  const sheet = sheets.find((s) => /lead|cliente/i.test(s.sheet)) ?? sheets.find((s) => !/instru/i.test(s.sheet)) ?? sheets[0];
  if (!sheet) throw new Error("Planilha vazia.");
  const text = (v: unknown) => (v == null ? "" : v instanceof Date ? v.toISOString().slice(0, 10) : String(v)).trim();
  return sheet.data.map((row) => row.map(text)).filter((r) => r.some(Boolean));
}

function parseDate(s: string): string | null | "invalid" {
  const v = s.trim();
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    const d = `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    return Number.isNaN(Date.parse(d)) ? "invalid" : d;
  }
  if (/^\d{5}$/.test(v)) { // número serial do Excel
    const d = new Date(Date.UTC(1899, 11, 30) + Number(v) * 864e5);
    return d.toISOString().slice(0, 10);
  }
  return "invalid";
}

const yes = (s: string) => /^(sim|s|yes|y|x|true|1)$/i.test(s.trim());
const pick = (map: Record<string, string>, s: string) => {
  const n = norm(s);
  if (!n) return null;
  const hit = Object.entries(map).find(([label, value]) => norm(label) === n || value === n || norm(label).startsWith(n));
  return hit ? hit[1] : undefined;
};

export interface RowError { row: number; message: string }
export interface ParsedSheet<T> { rows: { line: number; data: T }[]; errors: RowError[]; unknownHeaders: string[] }

export interface LeadRow {
  name: string; company: string | null; email: string | null; phone: string | null; city: string | null; audience: string | null;
  service: string | null; source: string; stage: string; estimated_value_cents: number | null; next_followup_at: string | null;
  notes: string | null; consent: boolean; marketing_consent: boolean;
}
export interface ClientRow {
  name: string; company: string | null; email: string | null; phone: string | null; city: string | null; service: string | null;
  monthly_value_cents: number; start_date: string | null; due_day: number | null; status: string; notes: string | null;
}

function mapHeaders(kind: SheetKind, header: string[]) {
  const cols = COLUMNS[kind];
  const index: Record<string, number> = {};
  const unknown: string[] = [];
  header.forEach((h, i) => {
    const n = norm(h);
    if (!n) return;
    const col = cols.find((c) => norm(c.header) === n || c.aliases?.some((a) => norm(a) === n));
    if (col && index[col.key] === undefined) index[col.key] = i; else unknown.push(h);
  });
  return { index, unknown };
}

export function parseSheet(kind: "leads", table: string[][]): ParsedSheet<LeadRow>;
export function parseSheet(kind: "clientes", table: string[][]): ParsedSheet<ClientRow>;
export function parseSheet(kind: SheetKind, table: string[][]): ParsedSheet<LeadRow | ClientRow> {
  const headerAt = table.findIndex((r) => r.some((c) => /^nome/.test(norm(c))));
  if (headerAt < 0) throw new Error("Não encontrei a linha de títulos (coluna “Nome”). Use o modelo da planilha.");
  const { index, unknown } = mapHeaders(kind, table[headerAt]);
  const get = (r: string[], k: string) => (index[k] === undefined ? "" : (r[index[k]] ?? "").trim());
  const rows: { line: number; data: LeadRow | ClientRow }[] = [];
  const errors: RowError[] = [];
  const clip = (s: string, n: number) => (s ? s.slice(0, n) : null);

  table.slice(headerAt + 1).forEach((r, i) => {
    const line = headerAt + 2 + i;
    if (!r.some((c) => c.trim())) return;
    const problems: string[] = [];
    const name = get(r, "name");
    if (name.length < 2) problems.push("nome ausente");
    const email = get(r, "email").toLowerCase();
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) problems.push(`e-mail inválido (${email})`);
    const phone = get(r, "phone");
    if (phone && phone.replace(/\D/g, "").length < 10) problems.push(`telefone inválido (${phone})`);

    if (kind === "leads") {
      if (!email && !phone) problems.push("informe e-mail ou WhatsApp");
      const audience = pick(LEAD_TYPES, get(r, "audience"));
      const source = pick(LEAD_SOURCES, get(r, "source"));
      const stage = pick(LEAD_STAGES, get(r, "stage"));
      if (audience === undefined) problems.push(`tipo desconhecido (${get(r, "audience")})`);
      if (source === undefined) problems.push(`origem desconhecida (${get(r, "source")})`);
      if (stage === undefined) problems.push(`etapa desconhecida (${get(r, "stage")})`);
      const value = get(r, "estimated_value");
      const cents = value ? parseBRLToCents(value) : null;
      if (value && (cents == null || cents < 0)) problems.push(`valor inválido (${value})`);
      const follow = parseDate(get(r, "next_followup_at"));
      if (follow === "invalid") problems.push(`data de retorno inválida (${get(r, "next_followup_at")})`);
      const marketing = yes(get(r, "marketing"));
      if (marketing && !email) problems.push("“aceita e-mails” = Sim exige e-mail");
      if (problems.length) { errors.push({ row: line, message: problems.join("; ") }); return; }
      rows.push({ line, data: {
        name: name.slice(0, 120), company: clip(get(r, "company"), 160), email: email || null, phone: clip(phone, 30), city: clip(get(r, "city"), 80),
        audience: audience ?? null, service: clip(get(r, "service"), 120), source: source ?? "outro", stage: stage ?? "novo",
        estimated_value_cents: cents, next_followup_at: (follow as string | null), notes: clip(get(r, "notes"), 4000),
        consent: yes(get(r, "consent")), marketing_consent: marketing,
      } });
    } else {
      const status = pick(CLIENT_STATUS, get(r, "status"));
      if (status === undefined) problems.push(`status desconhecido (${get(r, "status")})`);
      const value = get(r, "monthly_value");
      const cents = value ? parseBRLToCents(value) : 0;
      if (cents == null || cents < 0) problems.push(`valor mensal inválido (${value})`);
      const start = parseDate(get(r, "start_date"));
      if (start === "invalid") problems.push(`data de início inválida (${get(r, "start_date")})`);
      const dayRaw = get(r, "due_day");
      const day = dayRaw ? Number(dayRaw) : null;
      if (dayRaw && (!Number.isInteger(day) || day! < 1 || day! > 31)) problems.push(`dia de vencimento inválido (${dayRaw})`);
      if (problems.length) { errors.push({ row: line, message: problems.join("; ") }); return; }
      rows.push({ line, data: {
        name: name.slice(0, 120), company: clip(get(r, "company"), 160), email: email || null, phone: clip(phone, 30), city: clip(get(r, "city"), 80),
        service: clip(get(r, "service"), 120), monthly_value_cents: cents ?? 0, start_date: start as string | null, due_day: day,
        status: status ?? "ativo", notes: clip(get(r, "notes"), 4000),
      } });
    }
  });
  return { rows, errors, unknownHeaders: unknown };
}

/** Linhas para exportação no mesmo formato do modelo. */
export function leadToSheetRow(l: Record<string, unknown>) {
  const label = (map: Record<string, string>, v: unknown) => Object.entries(map).find(([, x]) => x === v)?.[0] ?? "";
  const br = (d: unknown) => (typeof d === "string" && d ? d.slice(0, 10).split("-").reverse().join("/") : "");
  return {
    name: l.name, company: l.company ?? "", email: l.email ?? "", phone: l.phone ?? "", city: l.city ?? "",
    audience: label(LEAD_TYPES, l.audience), service: l.service ?? "", source: label(LEAD_SOURCES, l.source), stage: label(LEAD_STAGES, l.stage),
    estimated_value: l.estimated_value_cents != null ? (Number(l.estimated_value_cents) / 100).toFixed(2).replace(".", ",") : "",
    next_followup_at: br(l.next_followup_at), notes: l.notes ?? (l.message ?? ""), consent: l.consent ? "Sim" : "Não", marketing: l.marketing_consent ? "Sim" : "Não",
  };
}

export function clientToSheetRow(c: Record<string, unknown>) {
  const label = Object.entries(CLIENT_STATUS).find(([, x]) => x === c.status)?.[0] ?? "";
  return {
    name: c.name, company: c.company ?? "", email: c.email ?? "", phone: c.phone ?? "", city: c.city ?? "", service: c.service ?? "",
    monthly_value: (Number(c.monthly_value_cents ?? 0) / 100).toFixed(2).replace(".", ","),
    start_date: typeof c.start_date === "string" ? c.start_date.split("-").reverse().join("/") : "", due_day: c.due_day ?? "", status: label, notes: c.notes ?? "",
  };
}
