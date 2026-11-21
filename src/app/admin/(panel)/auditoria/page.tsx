import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";

export default async function AuditPage() {
  await requireAdmin();
  const db = await createClient();
  const [{ data }, { data: users }] = await Promise.all([
    db.from("audit_log").select("*").order("created_at", { ascending: false }).limit(300),
    db.from("profiles").select("id, email"),
  ]);
  const email = Object.fromEntries((users ?? []).map((u) => [u.id, u.email]));
  return (
    <>
      <PageHeader title="Auditoria" description="Registro das ações administrativas (criação, edição, publicação, exclusão, baixas financeiras, exportações e downloads)." />
      <Panel>
        <div className="-mx-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-y border-mist-200 bg-mist-50 text-xs uppercase text-mist-600"><tr><th className="px-6 py-3">Quando</th><th className="px-6 py-3">Quem</th><th className="px-6 py-3">Ação</th><th className="px-6 py-3">Registro</th></tr></thead>
            <tbody className="divide-y divide-mist-100">
              {(data ?? []).map((a) => (
                <tr key={a.id}><td className="whitespace-nowrap px-6 py-2">{new Date(a.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</td><td className="px-6 py-2">{email[a.actor] ?? "—"}</td><td className="px-6 py-2">{a.action}</td><td className="px-6 py-2 text-mist-600">{a.entity}{a.entity_id ? ` · ${String(a.entity_id).slice(0, 8)}` : ""}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
