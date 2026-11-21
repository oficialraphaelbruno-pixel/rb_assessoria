import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Plus, Search } from "lucide-react";
import { getResource } from "@/lib/admin/resources";
import { deleteResource, saveResource, setResourceStatus } from "@/lib/admin/actions";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ResourceForm } from "./resource-form";
import { ActionButton } from "./action-button";
import { PageHeader, Panel, StatusBadge } from "./page-header";
import type { RelationOption } from "./field-input";
import { formatBRL, formatDate } from "@/lib/utils";

type SP = Record<string, string | undefined>;

async function guard(key: string) {
  const r = getResource(key);
  if (r.adminOnly) await requireAdmin(); else await requireStaff();
  return r;
}

export async function ResourceListView({ resourceKey, searchParams }: { resourceKey: string; searchParams: SP }) {
  const r = await guard(resourceKey);
  const db = await createClient();
  const q = (searchParams.q ?? "").trim().slice(0, 80);
  let query = db.from(r.table).select("*");
  for (const f of r.filters ?? []) {
    const v = searchParams[f.name];
    if (v && f.options.some((o) => o.value === v)) query = query.eq(f.name, v);
  }
  if (q) {
    const safe = q.replace(/[%,()*]/g, " ");
    query = query.or(r.searchColumns.map((c) => `${c}.ilike.%${safe}%`).join(","));
  }
  for (const o of r.orderBy) query = query.order(o.column, { ascending: o.ascending, nullsFirst: false });
  const { data: rows, error } = await query.limit(500);

  // nomes das relações exibidas na tabela
  const relLabels: Record<string, Record<string, string>> = {};
  for (const col of r.columns.filter((c) => c.format === "relation")) {
    const f = r.fields.find((x) => x.name === col.name);
    if (!f?.relation) continue;
    const ids = [...new Set((rows ?? []).map((x) => x[col.name]).filter(Boolean))];
    if (!ids.length) continue;
    const { data } = await db.from(f.relation.table).select(`id, ${f.relation.labelColumn}` as "*").in("id", ids);
    relLabels[col.name] = Object.fromEntries(((data ?? []) as unknown as Record<string, string>[]).map((d) => [d.id, d[f.relation!.labelColumn]]));
  }

  const cell = (row: Record<string, unknown>, c: (typeof r.columns)[number]) => {
    const v = row[c.name];
    switch (c.format) {
      case "money": return formatBRL(v as number | null);
      case "date": return formatDate(v as string);
      case "status": return <StatusBadge value={String(v)} />;
      case "badge": return v ? <StatusBadge value={String(v)} /> : "—";
      case "boolean": return v ? "Sim" : "Não";
      case "relation": return relLabels[c.name]?.[v as string] ?? "—";
      // eslint-disable-next-line @next/next/no-img-element
      case "image": return v ? <img src={String(v)} alt="" className="h-9 w-9 rounded-lg border border-mist-200 object-contain" /> : <span className="block h-9 w-9 rounded-lg bg-mist-100" />;
      default: return v == null || v === "" ? "—" : String(v);
    }
  };

  return (
    <>
      <PageHeader title={r.plural} description={r.description}
        actions={<Link href={`${r.path}/novo`} className="btn-dark px-4 py-2.5"><Plus className="h-4 w-4" /> Novo {r.label.toLowerCase()}</Link>} />
      <Panel>
        <form className="mb-4 flex flex-col gap-3 sm:flex-row" role="search">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" aria-hidden />
            <input name="q" defaultValue={q} placeholder="Buscar…" className="input pl-9" aria-label={`Buscar ${r.plural}`} />
          </div>
          {r.filters?.map((f) => (
            <select key={f.name} name={f.name} defaultValue={searchParams[f.name] ?? ""} className="input sm:w-48" aria-label={f.label}>
              <option value="">{f.label}: todos</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          <button className="btn-ghost px-4 py-2">Filtrar</button>
        </form>
        {error && <p className="text-sm text-red-600">Erro ao carregar dados.</p>}
        <div className="-mx-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-y border-mist-200 bg-mist-50 text-xs uppercase tracking-wider text-mist-600">
              <tr>{r.columns.map((c) => <th key={c.name} className="px-6 py-3 font-semibold">{c.label}</th>)}<th className="px-6 py-3 text-right font-semibold">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {(rows ?? []).map((row) => (
                <tr key={row.id} className="hover:bg-mist-50/60">
                  {r.columns.map((c, i) => (
                    <td key={c.name} className="px-6 py-3">
                      {i === 0 || c.name === r.titleField ? <Link href={`${r.path}/${row.id}`} className="font-medium text-navy-800 hover:text-teal-600">{cell(row, c)}</Link> : cell(row, c)}
                    </td>
                  ))}
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-2">
                      {r.publishable && (row.status === "published"
                        ? <ActionButton action={setResourceStatus.bind(null, r.key, row.id, "draft")}>Ocultar</ActionButton>
                        : <ActionButton variant="primary" action={setResourceStatus.bind(null, r.key, row.id, "published")} confirm={`Publicar “${row[r.titleField]}” no site?`}>Publicar</ActionButton>)}
                      <Link href={`${r.path}/${row.id}`} className="btn-ghost px-4 py-2 text-xs">Editar</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows?.length && <tr><td colSpan={r.columns.length + 1} className="px-6 py-12 text-center text-mist-600">Nenhum registro encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

export async function ResourceEditView({ resourceKey, id, children }: { resourceKey: string; id: string; children?: React.ReactNode }) {
  const r = await guard(resourceKey);
  const db = await createClient();
  const isNew = id === "novo";
  let values: Record<string, unknown> = { status: "draft", active: true, show_on_home: true, has_page: true };
  if (!isNew) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    const { data } = await db.from(r.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    values = data;
  }
  const relations: Record<string, RelationOption[]> = {};
  for (const f of r.fields.filter((x) => x.type === "relation" && x.relation)) {
    const { data } = await db.from(f.relation!.table).select(`id, ${f.relation!.labelColumn}` as "*").order(f.relation!.labelColumn).limit(500);
    relations[f.name] = ((data ?? []) as unknown as Record<string, string>[]).map((d) => ({ value: d.id, label: d[f.relation!.labelColumn] }));
  }
  const title = isNew ? `Novo ${r.label.toLowerCase()}` : String(values[r.titleField] ?? r.label);
  const preview = !isNew && r.previewPath ? r.previewPath.replace("{slug}", String(values.slug ?? "")) : null;

  return (
    <>
      <PageHeader title={title} back={{ href: r.path, label: r.plural }}
        description={r.publishable && !isNew ? (values.status === "published" ? "Publicado — visível no site." : "Rascunho — oculto do site até ser publicado.") : undefined}
        actions={!isNew && (
          <>
            {preview && <a href={`/api/preview/enable?path=${encodeURIComponent(preview)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost px-4 py-2 text-xs"><Eye className="h-3.5 w-3.5" /> Pré-visualizar</a>}
            {r.publishable && (values.status === "published"
              ? <ActionButton action={setResourceStatus.bind(null, r.key, id, "draft")}>Ocultar do site</ActionButton>
              : <ActionButton variant="primary" action={setResourceStatus.bind(null, r.key, id, "published")} confirm="Publicar no site agora?">Publicar</ActionButton>)}
            <ActionButton variant="danger" action={deleteResource.bind(null, r.key, id)} confirm={`Excluir “${title}” definitivamente? Esta ação não pode ser desfeita.`} redirectTo={r.path}>Excluir</ActionButton>
          </>
        )} />
      <Panel>
        <ResourceForm action={saveResource.bind(null, r.key, isNew ? null : id)} fields={r.fields} values={values} relations={relations} redirectBase={r.path} />
      </Panel>
      {children}
    </>
  );
}
