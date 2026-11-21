"use client";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { confirmPayment, reconcileLine, saveTransaction } from "@/lib/admin/finance-actions";
import { Feedback } from "./resource-form";

export interface Opt { value: string; label: string; kind?: string }
interface TxValues { id?: string; kind?: string; description?: string; amount_cents?: number; due_date?: string; category_id?: string | null; client_id?: string | null; expense_type?: string | null; payment_method?: string | null; notes?: string | null }

const money = (c?: number | null) => (c == null ? "" : (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });

export function TransactionForm({ values = {}, categories, clients, onDone }: { values?: TxValues; categories: Opt[]; clients: Opt[]; onDone?: () => void }) {
  const [state, action, pending] = useActionState(saveTransaction.bind(null, values.id ?? null), null);
  const [kind, setKind] = useState(values.kind ?? "receita");
  const router = useRouter();
  useEffect(() => { if (state?.ok) { router.refresh(); onDone?.(); } }, [state, router, onDone]);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <fieldset className="sm:col-span-2">
        <legend className="label">Tipo</legend>
        <div className="flex gap-2">
          {[["receita", "Conta a receber"], ["despesa", "Conta a pagar"]].map(([v, l]) => (
            <label key={v} className={`flex-1 cursor-pointer rounded-xl border px-4 py-2.5 text-center text-sm font-medium ${kind === v ? "border-turq-400 bg-turq-50 text-teal-700" : "border-mist-200"}`}>
              <input type="radio" name="kind" value={v} checked={kind === v} onChange={() => setKind(v)} className="sr-only" />{l}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="sm:col-span-2"><label className="label" htmlFor="t-desc">Descrição *</label><input id="t-desc" name="description" required defaultValue={values.description ?? ""} className="input" /></div>
      <div><label className="label" htmlFor="t-amount">Valor (R$) *</label><input id="t-amount" name="amount" required inputMode="decimal" placeholder="0,00" defaultValue={money(values.amount_cents)} className="input" /></div>
      <div><label className="label" htmlFor="t-due">Vencimento *</label><input id="t-due" name="due_date" type="date" required defaultValue={values.due_date ?? today()} className="input" /></div>
      <div><label className="label" htmlFor="t-cat">Categoria</label>
        <select id="t-cat" name="category_id" defaultValue={values.category_id ?? ""} className="input"><option value="">—</option>{categories.filter((c) => c.kind === kind).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
      <div><label className="label" htmlFor="t-client">Cliente</label>
        <select id="t-client" name="client_id" defaultValue={values.client_id ?? ""} className="input"><option value="">—</option>{clients.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
      {kind === "despesa" && (
        <div><label className="label" htmlFor="t-type">Despesa</label>
          <select id="t-type" name="expense_type" defaultValue={values.expense_type ?? "variavel"} className="input"><option value="fixa">Fixa</option><option value="variavel">Variável</option></select></div>
      )}
      <div><label className="label" htmlFor="t-pm">Forma de pagamento</label><input id="t-pm" name="payment_method" placeholder="Pix, boleto, cartão…" defaultValue={values.payment_method ?? ""} className="input" /></div>
      {!values.id && (
        <div className="grid grid-cols-2 gap-3 sm:col-span-2">
          <div><label className="label" htmlFor="t-rec">Recorrência</label><select id="t-rec" name="recurrence" className="input"><option value="nenhuma">Única</option><option value="mensal">Mensal</option></select></div>
          <div><label className="label" htmlFor="t-months">Nº de meses (se mensal)</label><input id="t-months" name="months" type="number" min={1} max={36} defaultValue={12} className="input" /></div>
        </div>
      )}
      <div className="sm:col-span-2"><label className="label" htmlFor="t-notes">Observações</label><textarea id="t-notes" name="notes" rows={2} defaultValue={values.notes ?? ""} className="input" /></div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="btn-dark">{pending && <Loader2 className="h-4 w-4 animate-spin" />}Salvar lançamento</button>
        <Feedback state={state} />
      </div>
      <p className="text-xs text-mist-600 sm:col-span-2">O lançamento entra como “previsto”. Para registrar o pagamento, use “Dar baixa” após confirmar o recebimento/pagamento.</p>
    </form>
  );
}

export function NewTransactionButton({ categories, clients }: { categories: Opt[]; clients: Opt[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-dark px-4 py-2.5"><Plus className="h-4 w-4" /> Novo lançamento</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink-900/50 p-4" role="dialog" aria-modal="true" aria-label="Novo lançamento">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Novo lançamento</h2><button type="button" onClick={() => setOpen(false)} className="text-sm text-mist-600 hover:underline">Fechar</button></div>
            <TransactionForm categories={categories} clients={clients} onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export function PaymentForm({ id, amount, kind }: { id: string; amount: number; kind: string }) {
  const [state, action, pending] = useActionState(confirmPayment.bind(null, id), null);
  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label" htmlFor="p-date">Data do {kind === "receita" ? "recebimento" : "pagamento"}</label><input id="p-date" name="paid_at" type="date" required defaultValue={today()} className="input" /></div>
        <div><label className="label" htmlFor="p-amt">Valor efetivo (R$)</label><input id="p-amt" name="paid_amount" required inputMode="decimal" defaultValue={money(amount)} className="input" /></div>
      </div>
      <input name="payment_method" placeholder="Forma (Pix, boleto…)" className="input" aria-label="Forma de pagamento" />
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" required className="mt-0.5 accent-teal-500" /> Confirmo que este valor foi efetivamente {kind === "receita" ? "recebido na conta" : "pago"}.</label>
      <div className="flex items-center gap-3"><button disabled={pending} className="btn-primary">{pending && <Loader2 className="h-4 w-4 animate-spin" />}Dar baixa</button><Feedback state={state} /></div>
    </form>
  );
}

export function ReconcileForm({ lineId, amount, candidates, categories }: { lineId: string; amount: number; candidates: Opt[]; categories: Opt[] }) {
  const [state, action, pending] = useActionState(reconcileLine.bind(null, lineId), null);
  const [mode, setMode] = useState(candidates.length ? "vincular" : "criar");
  const kind = amount > 0 ? "receita" : "despesa";
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <select name="mode" value={mode} onChange={(e) => setMode(e.target.value)} className="input py-1.5 text-xs sm:w-40" aria-label="Ação">
        <option value="vincular" disabled={!candidates.length}>Vincular a previsto</option>
        <option value="criar">Criar lançamento pago</option>
        <option value="ignorar">Ignorar</option>
      </select>
      {mode === "vincular" && <select name="transaction_id" className="input py-1.5 text-xs" aria-label="Lançamento previsto">{candidates.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>}
      {mode === "criar" && <select name="category_id" className="input py-1.5 text-xs" aria-label="Categoria"><option value="">Sem categoria</option>{categories.filter((c) => c.kind === kind).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>}
      <button disabled={pending} className="btn-dark px-3 py-1.5 text-xs">{pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Aplicar"}</button>
      {state && !state.ok && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
