import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { ActionButton } from "@/components/admin/action-button";
import { markNotificationsRead } from "@/lib/admin/crm-actions";

export default async function NotificationsPage() {
  await requireAdmin();
  const db = await createClient();
  const { data } = await db.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
  return (
    <>
      <PageHeader title="Notificações" description="Novos leads, conversas aguardando atendimento, alertas de consumo da IA e vencimentos."
        actions={<ActionButton action={markNotificationsRead}>Marcar todas como lidas</ActionButton>} />
      <Panel>
        <ul className="divide-y divide-mist-100">
          {(data ?? []).map((n) => (
            <li key={n.id} className="flex items-start gap-3 py-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-mist-200" : "bg-turq-400"}`} aria-label={n.read_at ? "lida" : "não lida"} />
              <div className="min-w-0 flex-1">
                {n.link ? <Link href={n.link} className="font-medium hover:text-teal-600">{n.title}</Link> : <p className="font-medium">{n.title}</p>}
                {n.body && <p className="text-sm text-mist-600">{n.body}</p>}
              </div>
              <time className="shrink-0 text-xs text-mist-400">{new Date(n.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</time>
            </li>
          ))}
          {!data?.length && <li className="py-10 text-center text-sm text-mist-600">Nenhuma notificação.</li>}
        </ul>
      </Panel>
    </>
  );
}
