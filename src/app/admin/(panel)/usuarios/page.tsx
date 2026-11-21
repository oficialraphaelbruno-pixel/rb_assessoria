import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { ActionButton } from "@/components/admin/action-button";
import { setUserRole } from "@/lib/admin/system-actions";

const ROLE = { admin: "Administrador", editor: "Editor (só conteúdo do site)", pending: "Sem acesso" } as Record<string, string>;

export default async function UsersPage() {
  const me = await requireAdmin();
  const db = await createClient();
  const { data } = await db.from("profiles").select("*").order("created_at");
  return (
    <>
      <PageHeader title="Usuários" description="Novos usuários são criados no Supabase (Authentication → Users → Add user) e entram sem acesso. Defina o papel aqui. Cadastro público fica desativado." />
      <Panel>
        <ul className="divide-y divide-mist-100">
          {(data ?? []).map((p) => (
            <li key={p.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-medium">{p.email}{p.id === me.id && " (você)"}</p><p className="text-xs text-mist-600">{ROLE[p.role]}</p></div>
              {p.id !== me.id && (
                <div className="flex flex-wrap gap-2">
                  {p.role !== "admin" && <ActionButton action={setUserRole.bind(null, p.id, "admin")} confirm={`Tornar ${p.email} administrador (acesso total, inclusive financeiro)?`}>Tornar admin</ActionButton>}
                  {p.role !== "editor" && <ActionButton action={setUserRole.bind(null, p.id, "editor")}>Tornar editor</ActionButton>}
                  {p.role !== "pending" && <ActionButton variant="danger" action={setUserRole.bind(null, p.id, "pending")} confirm="Remover o acesso deste usuário?">Remover acesso</ActionButton>}
                </div>
              )}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
