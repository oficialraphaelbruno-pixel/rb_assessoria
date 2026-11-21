"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseBRLToCents } from "@/lib/utils";
import { parseCsv } from "@/lib/csv";
import { parseOfx, type StatementLine } from "@/lib/ofx";
import { UUID } from "./parse";
import type { ActionResult } from "./actions";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function addMonths(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, last));
  return target.toISOString().slice(0, 10);
}

function revalidateFinance() {
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/financeiro/lancamentos");
  revalidatePath("/admin");
}

/** Cria/edita lançamento. Nunca marca como pago aqui: baixa é uma ação explícita (confirmPayment). */
export async function saveTransaction(id: string | null, _prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const staff = await requireAdmin();
  const kind = String(fd.get("kind"));
  const description = String(fd.get("description") || "").trim().slice(0, 300);
  const amount = parseBRLToCents(String(fd.get("amount") || ""));
  const due = String(fd.get("due_date") || "");
  const recurrence = String(fd.get("recurrence") || "nenhuma");
  const months = Math.min(Math.max(Number(fd.get("months") || 1), 1), 36);
  const category = String(fd.get("category_id") || "");
  const client = String(fd.get("client_id") || "");
  const expenseType = String(fd.get("expense_type") || "");

  if (!["receita", "despesa"].includes(kind)) return { ok: false, error: "Tipo inválido." };
  if (!description) return { ok: false, error: "Informe a descrição." };
  if (!amount || amount <= 0) return { ok: false, error: "Informe um valor maior que zero." };
  if (!DATE.test(due)) return { ok: false, error: "Informe o vencimento." };
  if (!["nenhuma", "mensal"].includes(recurrence)) return { ok: false, error: "Recorrência inválida." };
  if (category && !UUID.test(category)) return { ok: false, error: "Categoria inválida." };
  if (client && !UUID.test(client)) return { ok: false, error: "Cliente inválido." };

  const base = {
    kind, description, amount_cents: amount, category_id: category || null, client_id: client || null,
    expense_type: kind === "despesa" && ["fixa", "variavel"].includes(expenseType) ? expenseType : null,
    payment_method: String(fd.get("payment_method") || "").slice(0, 60) || null,
    notes: String(fd.get("notes") || "").slice(0, 2000) || null,
  };
  const db = await createClient();
  if (id) {
    if (!UUID.test(id)) return { ok: false, error: "Lançamento inválido." };
    const { error } = await db.from("fin_transactions").update({ ...base, due_date: due }).eq("id", id);
    if (error) return { ok: false, error: "Não foi possível salvar." };
    await db.from("audit_log").insert({ actor: staff.id, action: "update", entity: "fin_transactions", entity_id: id, details: { amount, due } });
    revalidateFinance();
    return { ok: true, id, message: "Lançamento atualizado." };
  }
  const group = recurrence === "mensal" ? crypto.randomUUID() : null;
  const count = recurrence === "mensal" ? months : 1;
  const rows = Array.from({ length: count }, (_, i) => ({
    ...base, due_date: addMonths(due, i), status: "previsto", recurrence, recurrence_group: group,
    description: count > 1 ? `${description} (${i + 1}/${count})` : description, created_by: staff.id,
  }));
  const { error } = await db.from("fin_transactions").insert(rows);
  if (error) return { ok: false, error: "Não foi possível salvar." };
  await db.from("audit_log").insert({ actor: staff.id, action: "create", entity: "fin_transactions", details: { count, amount, kind } });
  revalidateFinance();
  return { ok: true, message: count > 1 ? `${count} lançamentos mensais criados.` : "Lançamento criado." };
}

/** Baixa manual: o administrador confirma data e valor efetivamente pagos/recebidos. */
export async function confirmPayment(id: string, _prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Lançamento inválido." };
  const paidAt = String(fd.get("paid_at") || "");
  const amount = parseBRLToCents(String(fd.get("paid_amount") || ""));
  if (!DATE.test(paidAt)) return { ok: false, error: "Informe a data do pagamento." };
  if (!amount || amount <= 0) return { ok: false, error: "Informe o valor pago." };
  if (fd.get("confirm") !== "on") return { ok: false, error: "Marque a confirmação de que o valor foi efetivamente pago/recebido." };
  const db = await createClient();
  const { error } = await db.from("fin_transactions").update({
    status: "pago", paid_at: paidAt, paid_amount_cents: amount, confirmed_by: staff.id,
    payment_method: String(fd.get("payment_method") || "").slice(0, 60) || null,
  }).eq("id", id);
  if (error) return { ok: false, error: "Não foi possível registrar o pagamento." };
  await db.from("audit_log").insert({ actor: staff.id, action: "confirm_payment", entity: "fin_transactions", entity_id: id, details: { paidAt, amount } });
  revalidateFinance();
  return { ok: true, message: "Pagamento registrado." };
}

export async function revertPayment(id: string): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Lançamento inválido." };
  const db = await createClient();
  await db.from("fin_transactions").update({ status: "previsto", paid_at: null, paid_amount_cents: null, confirmed_by: null }).eq("id", id);
  await db.from("audit_log").insert({ actor: staff.id, action: "revert_payment", entity: "fin_transactions", entity_id: id });
  revalidateFinance();
  return { ok: true, message: "Baixa desfeita." };
}

export async function cancelTransaction(id: string): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Lançamento inválido." };
  const db = await createClient();
  await db.from("fin_transactions").update({ status: "cancelado" }).eq("id", id);
  await db.from("audit_log").insert({ actor: staff.id, action: "cancel", entity: "fin_transactions", entity_id: id });
  revalidateFinance();
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!UUID.test(id)) return { ok: false, error: "Lançamento inválido." };
  const db = await createClient();
  const { data: before } = await db.from("fin_transactions").select("*").eq("id", id).maybeSingle();
  await db.from("fin_transactions").delete().eq("id", id);
  await db.from("audit_log").insert({ actor: staff.id, action: "delete", entity: "fin_transactions", entity_id: id, details: { snapshot: before } });
  revalidateFinance();
  return { ok: true };
}

/** Gera as mensalidades do mês para clientes ativos que ainda não têm lançamento no mês. */
export async function generateMonthlyInvoices(month: string): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!/^\d{4}-\d{2}$/.test(month)) return { ok: false, error: "Mês inválido." };
  const db = await createClient();
  const [y, m] = month.split("-").map(Number);
  const start = `${month}-01`;
  const end = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  const [{ data: clients }, { data: existing }, { data: cat }] = await Promise.all([
    db.from("crm_clients").select("id, name, service, monthly_value_cents, due_day").eq("status", "ativo").gt("monthly_value_cents", 0),
    db.from("fin_transactions").select("client_id").eq("kind", "receita").gte("due_date", start).lte("due_date", end).not("client_id", "is", null).neq("status", "cancelado"),
    db.from("fin_categories").select("id").eq("kind", "receita").eq("name", "Mensalidade de clientes").maybeSingle(),
  ]);
  const has = new Set((existing ?? []).map((e) => e.client_id));
  const lastDay = Number(end.slice(8));
  const rows = (clients ?? []).filter((c) => !has.has(c.id)).map((c) => ({
    kind: "receita", description: `Mensalidade ${String(m).padStart(2, "0")}/${y} — ${c.name}${c.service ? ` (${c.service})` : ""}`,
    amount_cents: c.monthly_value_cents, client_id: c.id, category_id: cat?.id ?? null, status: "previsto", recurrence: "mensal",
    due_date: `${month}-${String(Math.min(c.due_day ?? 10, lastDay)).padStart(2, "0")}`, created_by: staff.id,
  }));
  if (!rows.length) return { ok: true, message: "Todas as mensalidades do mês já estão lançadas." };
  const { error } = await db.from("fin_transactions").insert(rows);
  if (error) return { ok: false, error: "Não foi possível gerar." };
  await db.from("audit_log").insert({ actor: staff.id, action: "generate_invoices", entity: "fin_transactions", details: { month, count: rows.length } });
  revalidateFinance();
  return { ok: true, message: `${rows.length} mensalidade(s) lançada(s) como “previsto”.` };
}

/* ------------------------------------------------------------------ */
/* Importação de extrato (OFX ou CSV) — somente leitura do arquivo,    */
/* sem qualquer conexão bancária ou movimentação de dinheiro.          */
/* ------------------------------------------------------------------ */

function parseCsvStatement(text: string): StatementLine[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const head = rows[0].map((h) => h.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim());
  const iDate = head.findIndex((h) => /^data/.test(h));
  const iDesc = head.findIndex((h) => /(descri|historico|lancamento|detalhe)/.test(h));
  const iVal = head.findIndex((h) => /^valor/.test(h));
  if (iDate < 0 || iVal < 0) throw new Error("CSV sem colunas reconhecidas. Use colunas “Data”, “Descrição” e “Valor”.");
  return rows.slice(1).map((r) => {
    const raw = (r[iDate] || "").trim();
    const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/) ;
    const date = m ? `${m[3]}-${m[2]}-${m[1]}` : raw.slice(0, 10);
    const cents = parseBRLToCents(r[iVal] || "");
    return { date, description: (r[iDesc] || "Lançamento").trim().slice(0, 300), amountCents: cents ?? 0, fitId: null };
  }).filter((l) => DATE.test(l.date) && l.amountCents !== 0).map((l, _i, all) => {
    // id sintético para evitar reimportar as mesmas linhas (inclui ocorrência para lançamentos idênticos)
    const key = `${l.date}|${l.amountCents}|${l.description}`;
    const n = all.filter((x) => `${x.date}|${x.amountCents}|${x.description}` === key).indexOf(l);
    return { ...l, fitId: `csv:${key}|${n}`.slice(0, 300) };
  });
}

export async function importStatement(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const staff = await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { ok: false, error: "Selecione um arquivo." };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "Arquivo maior que 5 MB." };
  const text = await file.text();
  let lines: StatementLine[];
  try {
    lines = /<OFX>|OFXHEADER/i.test(text) ? parseOfx(text) : parseCsvStatement(text);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  if (!lines.length) return { ok: false, error: "Nenhuma movimentação encontrada no arquivo." };
  const batch = crypto.randomUUID();
  const db = await createClient();
  const rows = lines.map((l) => ({ import_batch: batch, bank: "btg", posted_at: l.date, description: l.description, amount_cents: l.amountCents, fit_id: l.fitId }));
  const { error, count } = await db.from("bank_statement_lines").upsert(rows, { onConflict: "bank,fit_id", ignoreDuplicates: true, count: "exact" });
  if (error) return { ok: false, error: "Não foi possível importar." };
  await db.from("audit_log").insert({ actor: staff.id, action: "import_statement", entity: "bank_statement_lines", details: { batch, lines: lines.length } });
  revalidatePath("/admin/financeiro/importar");
  return { ok: true, message: `${count ?? lines.length} linha(s) importada(s) para conciliação. Duplicadas foram ignoradas.` };
}

/** Concilia uma linha de extrato: vincula a um lançamento previsto (dando baixa) ou cria um novo já pago. */
export async function reconcileLine(lineId: string, _prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const staff = await requireAdmin();
  if (!UUID.test(lineId)) return { ok: false, error: "Linha inválida." };
  const db = await createClient();
  const { data: line } = await db.from("bank_statement_lines").select("*").eq("id", lineId).single();
  if (!line || line.status !== "pendente") return { ok: false, error: "Linha já tratada." };
  const mode = String(fd.get("mode"));
  if (mode === "ignorar") {
    await db.from("bank_statement_lines").update({ status: "ignorado" }).eq("id", lineId);
  } else if (mode === "vincular") {
    const txId = String(fd.get("transaction_id") || "");
    if (!UUID.test(txId)) return { ok: false, error: "Escolha o lançamento." };
    const { error } = await db.from("fin_transactions").update({
      status: "pago", paid_at: line.posted_at, paid_amount_cents: Math.abs(line.amount_cents), confirmed_by: staff.id, bank_line_id: lineId,
    }).eq("id", txId).eq("status", "previsto");
    if (error) return { ok: false, error: "Não foi possível vincular." };
    await db.from("bank_statement_lines").update({ status: "conciliado", transaction_id: txId }).eq("id", lineId);
  } else if (mode === "criar") {
    const category = String(fd.get("category_id") || "");
    const { data: tx, error } = await db.from("fin_transactions").insert({
      kind: line.amount_cents > 0 ? "receita" : "despesa", description: line.description, amount_cents: Math.abs(line.amount_cents),
      due_date: line.posted_at, status: "pago", paid_at: line.posted_at, paid_amount_cents: Math.abs(line.amount_cents),
      confirmed_by: staff.id, category_id: UUID.test(category) ? category : null, bank_line_id: lineId, created_by: staff.id,
    }).select("id").single();
    if (error) return { ok: false, error: "Não foi possível criar o lançamento." };
    await db.from("bank_statement_lines").update({ status: "conciliado", transaction_id: tx.id }).eq("id", lineId);
  } else return { ok: false, error: "Ação inválida." };
  await db.from("audit_log").insert({ actor: staff.id, action: `reconcile_${mode}`, entity: "bank_statement_lines", entity_id: lineId });
  revalidatePath("/admin/financeiro/importar");
  revalidateFinance();
  return { ok: true, message: "Linha conciliada." };
}
