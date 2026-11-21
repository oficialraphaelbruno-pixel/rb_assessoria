import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/page-header";
import { SETTINGS_SCHEMA } from "@/lib/settings-defaults";

export default async function ContentIndex() {
  await requireStaff();
  const db = await createClient();
  const { data } = await db.from("site_settings").select("key, draft, published, updated_at");
  const byKey = Object.fromEntries((data ?? []).map((r) => [r.key, r]));
  const groups = [...new Set(SETTINGS_SCHEMA.map((d) => d.group))];
  return (
    <>
      <PageHeader title="Conteúdo do site" description="Edite textos, imagens, botões, contatos, SEO e páginas institucionais. Salve como rascunho, pré-visualize e publique — o site atualiza sem novo deploy." />
      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-mist-600">{g}</h2>
            <ul className="divide-y divide-mist-100 overflow-hidden rounded-2xl border border-mist-200 bg-white">
              {SETTINGS_SCHEMA.filter((d) => d.group === g).map((d) => {
                const row = byKey[d.key];
                const pending = row && JSON.stringify(row.draft) !== JSON.stringify(row.published);
                return (
                  <li key={d.key}>
                    <Link href={`/admin/conteudo/${d.key}`} className="flex items-center gap-4 px-5 py-4 hover:bg-mist-50">
                      <span className="flex-1 font-medium text-navy-800">{d.label}</span>
                      {pending && <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">Rascunho não publicado</span>}
                      {row && <span className="hidden text-xs text-mist-400 sm:block">Atualizado {new Date(row.updated_at).toLocaleDateString("pt-BR")}</span>}
                      <ChevronRight className="h-4 w-4 text-mist-400" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
