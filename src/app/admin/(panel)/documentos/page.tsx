import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { ActionButton } from "@/components/admin/action-button";
import { DocumentUpload, DownloadButton } from "@/components/admin/documents";
import { deleteDocument } from "@/lib/admin/system-actions";
import { formatDate } from "@/lib/utils";

export default async function DocumentsPage() {
  await requireAdmin();
  const db = await createClient();
  const [{ data: docs }, { data: clients }] = await Promise.all([
    db.from("documents").select("*, crm_clients(name)").order("created_at", { ascending: false }).limit(300),
    db.from("crm_clients").select("id, name").order("name"),
  ]);
  return (
    <>
      <PageHeader title="Central de documentos" description="Contratos, propostas e arquivos de clientes em armazenamento privado. Downloads usam links temporários e ficam registrados na auditoria." />
      <Panel title="Enviar documento" className="mb-6"><DocumentUpload clients={(clients ?? []).map((c) => ({ value: c.id, label: c.name }))} /></Panel>
      <Panel>
        <ul className="divide-y divide-mist-100">
          {(docs ?? []).map((d) => (
            <li key={d.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium">{d.name}</p>
                <p className="text-xs text-mist-600">{d.kind} · {(d.crm_clients as { name: string } | null)?.name ?? "sem cliente"} · {formatDate(d.created_at)}{d.notes ? ` · ${d.notes}` : ""}</p>
              </div>
              <div className="flex gap-2"><DownloadButton id={d.id} /><ActionButton variant="danger" action={deleteDocument.bind(null, d.id)} confirm={`Excluir “${d.name}”?`}>Excluir</ActionButton></div>
            </li>
          ))}
          {!docs?.length && <li className="py-10 text-center text-sm text-mist-600">Nenhum documento.</li>}
        </ul>
      </Panel>
    </>
  );
}
