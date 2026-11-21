import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";

export default async function ConversationsPage({ searchParams }: { searchParams: Promise<{ fila?: string }> }) {
  await requireAdmin();
  const { fila } = await searchParams;
  const db = await createClient();
  let q = db.from("chat_conversations").select("id, created_at, last_message_at, message_count, needs_human, handoff_reason, lead_id, cost_usd, page, visitor_id").order("last_message_at", { ascending: false }).limit(200);
  if (fila) q = q.eq("needs_human", true);
  const { data } = await q;
  return (
    <>
      <PageHeader title="Conversas" back={{ href: "/admin/chatbot", label: "Chatbot" }} description="Histórico do atendimento automático. Corrija respostas e atenda a fila de casos que dependem de decisão humana."
        actions={<div className="flex gap-1"><Link href="/admin/chatbot/conversas" className={`rounded-lg px-3 py-2 text-sm ${!fila ? "bg-navy-800 text-white" : "bg-white"}`}>Todas</Link><Link href="?fila=1" className={`rounded-lg px-3 py-2 text-sm ${fila ? "bg-navy-800 text-white" : "bg-white"}`}>Fila humana</Link></div>} />
      <Panel>
        <ul className="divide-y divide-mist-100">
          {(data ?? []).map((c) => (
            <li key={c.id}>
              <Link href={`/admin/chatbot/conversas/${c.id}`} className="flex flex-col gap-1 py-3 hover:bg-mist-50/60 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="font-medium">{new Date(c.last_message_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                  <span className="ml-2 text-xs text-mist-600">{c.message_count} mensagens · {c.page ?? "—"}{c.visitor_id.startsWith("teste-painel") ? " · teste do painel" : ""}</span>
                </span>
                <span className="flex gap-2 text-xs">
                  {c.needs_human && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">Aguardando humano</span>}
                  {c.lead_id && <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">Virou lead</span>}
                  <span className="text-mist-400">US$ {Number(c.cost_usd).toFixed(4)}</span>
                </span>
              </Link>
            </li>
          ))}
          {!data?.length && <li className="py-10 text-center text-sm text-mist-600">Nenhuma conversa.</li>}
        </ul>
      </Panel>
    </>
  );
}
