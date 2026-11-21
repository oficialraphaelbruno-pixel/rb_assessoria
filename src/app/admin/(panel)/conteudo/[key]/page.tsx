import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { SettingForm } from "@/components/admin/setting-form";
import { ActionButton } from "@/components/admin/action-button";
import { discardSettingDraft, restoreSettingRevision } from "@/lib/admin/actions";
import { DEFAULT_SETTINGS, SETTINGS_SCHEMA, type SettingKey } from "@/lib/settings-defaults";

const PREVIEW: Record<string, string> = { founder: "/quem-esta-por-tras-da-rb", clubs: "/clubes-e-escolinhas", privacy: "/privacidade", contact: "/contato" };

export default async function EditSetting({ params }: { params: Promise<{ key: string }> }) {
  await requireStaff();
  const { key } = await params;
  const def = SETTINGS_SCHEMA.find((d) => d.key === key);
  if (!def) notFound();
  const db = await createClient();
  const [{ data: row }, { data: revisions }] = await Promise.all([
    db.from("site_settings").select("*").eq("key", key).maybeSingle(),
    db.from("content_revisions").select("id, created_at").eq("entity", "site_settings").eq("entity_id", key).order("created_at", { ascending: false }).limit(15),
  ]);
  const values = { ...(DEFAULT_SETTINGS[key as SettingKey] ?? {}), ...((row?.draft as object) ?? {}) } as Record<string, unknown>;
  const pending = row && JSON.stringify(row.draft) !== JSON.stringify(row.published);
  const previewPath = PREVIEW[key] ?? "/";

  return (
    <>
      <PageHeader title={def.label} back={{ href: "/admin/conteudo", label: "Conteúdo do site" }}
        description={def.description ?? (pending ? "Há alterações em rascunho ainda não publicadas." : "O conteúdo publicado está igual ao rascunho.")}
        actions={<>
          <a href={`/api/preview/enable?path=${encodeURIComponent(previewPath)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost px-4 py-2 text-xs"><Eye className="h-3.5 w-3.5" /> Pré-visualizar rascunho</a>
          {pending && <ActionButton action={discardSettingDraft.bind(null, key)} confirm="Descartar o rascunho e voltar ao conteúdo publicado?">Descartar rascunho</ActionButton>}
        </>} />
      <div className="grid gap-6 xl:grid-cols-4">
        <Panel className="xl:col-span-3"><SettingForm settingKey={key} fields={def.fields} values={values} /></Panel>
        <Panel title="Histórico de versões">
          <ul className="space-y-2 text-sm">
            {(revisions ?? []).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2">
                <span className="text-mist-600">{new Date(r.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                <ActionButton action={restoreSettingRevision.bind(null, key, r.id)} confirm="Restaurar esta versão como rascunho?" className="px-2.5 py-1">Restaurar</ActionButton>
              </li>
            ))}
            {!revisions?.length && <li className="text-mist-600">Nenhuma versão salva ainda.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
