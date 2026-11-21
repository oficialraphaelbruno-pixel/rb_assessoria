import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { ImportForm } from "@/components/admin/import-form";
import { ReconcileForm } from "@/components/admin/finance-forms";
import { formatBRL, formatDate } from "@/lib/utils";

export default async function ImportPage() {
  await requireAdmin();
  const db = await createClient();
  const [{ data: lines }, { data: open }, { data: cats }] = await Promise.all([
    db.from("bank_statement_lines").select("*").eq("status", "pendente").order("posted_at", { ascending: false }).limit(200),
    db.from("fin_transactions").select("id, kind, description, amount_cents, due_date").eq("status", "previsto").order("due_date").limit(500),
    db.from("fin_categories").select("id, name, kind").order("name"),
  ]);
  const catOpts = (cats ?? []).map((c) => ({ value: c.id, label: c.name, kind: c.kind }));
  return (
    <>
      <PageHeader title="Importar extrato" description="Importe o extrato exportado do internet banking (OFX ou CSV) e concilie com os lançamentos. Nada é pago ou transferido por aqui: o sistema apenas lê o arquivo." />
      <Panel title="1. Enviar arquivo" className="mb-6">
        <ImportForm />
        <p className="mt-3 text-xs text-mist-600">No BTG Empresas, exporte o extrato em <strong>OFX</strong> (recomendado) ou CSV. Para CSV, as colunas precisam se chamar “Data”, “Descrição” e “Valor” (negativo = saída). Linhas já importadas são ignoradas.</p>
      </Panel>
      <Panel title={`2. Conciliar (${lines?.length ?? 0} pendentes)`}>
        <ul className="divide-y divide-mist-100">
          {(lines ?? []).map((l) => {
            const kind = l.amount_cents > 0 ? "receita" : "despesa";
            const abs = Math.abs(l.amount_cents);
            const candidates = (open ?? []).filter((t) => t.kind === kind)
              .sort((a, b) => Math.abs(a.amount_cents - abs) - Math.abs(b.amount_cents - abs)).slice(0, 8)
              .map((t) => ({ value: t.id, label: `${formatDate(t.due_date)} · ${t.description} · ${formatBRL(t.amount_cents)}` }));
            return (
              <li key={l.id} className="flex flex-col gap-2 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{l.description}</p>
                  <p className="text-xs text-mist-600">{formatDate(l.posted_at)} · <span className={l.amount_cents > 0 ? "text-emerald-700" : "text-red-600"}>{l.amount_cents > 0 ? "+" : "−"} {formatBRL(abs)}</span></p>
                </div>
                <ReconcileForm lineId={l.id} amount={l.amount_cents} candidates={candidates} categories={catOpts} />
              </li>
            );
          })}
          {!lines?.length && <li className="py-8 text-center text-sm text-mist-600">Nenhuma linha pendente.</li>}
        </ul>
      </Panel>
    </>
  );
}
