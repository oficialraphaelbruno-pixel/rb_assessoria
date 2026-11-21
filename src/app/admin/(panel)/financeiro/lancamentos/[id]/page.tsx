import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel, StatusBadge } from "@/components/admin/page-header";
import { ActionButton } from "@/components/admin/action-button";
import { PaymentForm, TransactionForm } from "@/components/admin/finance-forms";
import { cancelTransaction, deleteTransaction, revertPayment } from "@/lib/admin/finance-actions";
import { formatBRL, formatDate } from "@/lib/utils";

export default async function TransactionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await createClient();
  const [{ data: t }, { data: cats }, { data: clients }] = await Promise.all([
    db.from("v_fin_transactions").select("*").eq("id", id).maybeSingle(),
    db.from("fin_categories").select("id, name, kind").order("name"), db.from("crm_clients").select("id, name").order("name"),
  ]);
  if (!t) notFound();
  return (
    <>
      <PageHeader title={t.description} back={{ href: "/admin/financeiro/lancamentos", label: "Lançamentos" }}
        description={`${t.kind === "receita" ? "Conta a receber" : "Conta a pagar"} · ${formatBRL(t.amount_cents)} · vence ${formatDate(t.due_date)}`}
        actions={<>
          <StatusBadge value={t.effective_status} />
          {t.status === "pago" && <ActionButton action={revertPayment.bind(null, id)} confirm="Desfazer a baixa deste lançamento?">Desfazer baixa</ActionButton>}
          {t.status === "previsto" && <ActionButton action={cancelTransaction.bind(null, id)} confirm="Cancelar este lançamento?">Cancelar</ActionButton>}
          <ActionButton variant="danger" action={deleteTransaction.bind(null, id)} redirectTo="/admin/financeiro/lancamentos" confirm="Excluir definitivamente este lançamento?">Excluir</ActionButton>
        </>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Editar lançamento" className="lg:col-span-2">
          <TransactionForm values={t} categories={(cats ?? []).map((c) => ({ value: c.id, label: c.name, kind: c.kind }))} clients={(clients ?? []).map((c) => ({ value: c.id, label: c.name }))} />
        </Panel>
        <Panel title={t.status === "pago" ? "Pagamento registrado" : "Registrar pagamento"}>
          {t.status === "pago" ? (
            <dl className="space-y-2 text-sm">
              <div><dt className="text-xs text-mist-400">Data</dt><dd>{formatDate(t.paid_at)}</dd></div>
              <div><dt className="text-xs text-mist-400">Valor efetivo</dt><dd>{formatBRL(t.paid_amount_cents)}</dd></div>
              {t.payment_method && <div><dt className="text-xs text-mist-400">Forma</dt><dd>{t.payment_method}</dd></div>}
              {t.bank_line_id && <div className="text-xs text-mist-600">Conciliado com extrato importado.</div>}
            </dl>
          ) : t.status === "cancelado" ? <p className="text-sm text-mist-600">Lançamento cancelado.</p> : <PaymentForm id={id} amount={t.amount_cents} kind={t.kind} />}
        </Panel>
      </div>
    </>
  );
}
