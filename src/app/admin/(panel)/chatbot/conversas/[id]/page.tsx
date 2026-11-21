import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { ActionButton } from "@/components/admin/action-button";
import { CorrectionForm } from "@/components/admin/chat-admin";
import { deleteConversation, resolveHandoff } from "@/lib/admin/chat-actions";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await createClient();
  const [{ data: c }, { data: msgs }] = await Promise.all([
    db.from("chat_conversations").select("*").eq("id", id).maybeSingle(),
    db.from("chat_messages").select("*").eq("conversation_id", id).order("created_at"),
  ]);
  if (!c) notFound();
  return (
    <>
      <PageHeader title="Conversa" back={{ href: "/admin/chatbot/conversas", label: "Conversas" }}
        description={`Iniciada em ${new Date(c.created_at).toLocaleString("pt-BR")} · ${c.message_count} mensagens · custo estimado US$ ${Number(c.cost_usd).toFixed(5)}`}
        actions={<>
          {c.lead_id && <Link href={`/admin/leads/${c.lead_id}`} className="btn-primary px-4 py-2 text-xs">Ver lead</Link>}
          {c.needs_human && <ActionButton variant="dark" action={resolveHandoff.bind(null, id)}>Marcar como atendido</ActionButton>}
          <ActionButton variant="danger" action={deleteConversation.bind(null, id)} redirectTo="/admin/chatbot/conversas" confirm="Excluir esta conversa?">Excluir</ActionButton>
        </>} />
      {c.needs_human && <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><strong>Aguardando atendimento humano:</strong> {c.handoff_reason}. {c.lead_id ? "O visitante deixou contato — veja o lead." : "O visitante ainda não deixou contato."}</div>}
      <Panel>
        <ol className="space-y-4">
          {(msgs ?? []).map((m, i) => (
            <li key={m.id} className={m.role === "user" ? "text-right" : ""}>
              <p className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-left text-sm ${m.role === "user" ? "bg-navy-800 text-white" : m.flagged ? "border border-amber-300 bg-amber-50" : "border border-mist-200 bg-white"}`}>{m.content}</p>
              <p className="mt-1 text-[11px] text-mist-400">{new Date(m.created_at).toLocaleTimeString("pt-BR")}{m.role === "assistant" && ` · ${m.model ?? "estática"}${m.is_fallback ? " · resposta estática" : ""}${m.cost_usd ? ` · US$ ${Number(m.cost_usd).toFixed(5)}` : ""}`}</p>
              {m.role === "assistant" && (
                <div>
                  {m.correction && <p className="mt-1 inline-block max-w-[85%] rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">Correção: {m.correction}</p>}
                  <div><CorrectionForm messageId={m.id} conversationId={id} question={msgs?.[i - 1]?.content ?? ""} current={m.correction} /></div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </Panel>
    </>
  );
}
