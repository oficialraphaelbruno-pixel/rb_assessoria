"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, FileSpreadsheet, Loader2, TriangleAlert, Upload } from "lucide-react";
import { importSpreadsheet, type ImportResult } from "@/lib/admin/import-actions";

export function ImportPanel({ kind, templateHref, backHref }: { kind: "leads" | "clientes"; templateHref: string; backHref: string }) {
  const [state, action, pending] = useActionState(importSpreadsheet.bind(null, kind), null as ImportResult | null);
  const [fileName, setFileName] = useState("");
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <form action={action} className="space-y-4 rounded-2xl border border-mist-200 bg-white p-6">
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-mist-200 p-8 text-center hover:border-turq-400">
            <FileSpreadsheet className="h-10 w-10 text-turq-400" aria-hidden />
            <span className="font-medium">{fileName || "Clique para escolher a planilha (.xlsx ou .csv)"}</span>
            <span className="text-xs text-mist-600">Até 2.000 linhas · 5 MB</span>
            <input type="file" name="file" accept=".xlsx,.csv" required className="sr-only" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
          </label>
          <fieldset>
            <legend className="label">Se o {kind === "leads" ? "contato" : "cliente"} já existir no sistema</legend>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="radio" name="duplicates" value="ignorar" defaultChecked className="accent-teal-500" /> Ignorar (manter o que já está cadastrado)</label>
              <label className="flex items-center gap-2"><input type="radio" name="duplicates" value="atualizar" className="accent-teal-500" /> Atualizar com os dados da planilha</label>
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-3">
            <button name="mode" value="validar" disabled={pending} className="btn-ghost">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} 1. Validar planilha</button>
            <button name="mode" value="importar" disabled={pending} className="btn-dark" onClick={(e) => { if (!window.confirm("Importar os registros válidos agora?")) e.preventDefault(); }}>
              <Upload className="h-4 w-4" /> 2. Importar
            </button>
          </div>
        </form>

        {state && (
          <section aria-live="polite" className="rounded-2xl border border-mist-200 bg-white p-6">
            {state.error ? (
              <p role="alert" className="flex items-center gap-2 text-sm text-red-600"><TriangleAlert className="h-4 w-4" />{state.error}</p>
            ) : (
              <>
                <p className={`flex items-center gap-2 font-medium ${state.imported ? "text-emerald-700" : "text-navy-800"}`}><CheckCircle2 className="h-5 w-5" />{state.message}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div className="rounded-xl bg-mist-50 p-3"><dt className="text-xs text-mist-600">Linhas lidas</dt><dd className="text-lg font-bold">{state.total}</dd></div>
                  <div className="rounded-xl bg-mist-50 p-3"><dt className="text-xs text-mist-600">Válidas</dt><dd className="text-lg font-bold">{state.valid}</dd></div>
                  <div className="rounded-xl bg-mist-50 p-3"><dt className="text-xs text-mist-600">Já existentes</dt><dd className="text-lg font-bold">{state.duplicates?.length ?? 0}</dd></div>
                  <div className="rounded-xl bg-mist-50 p-3"><dt className="text-xs text-mist-600">Com erro</dt><dd className="text-lg font-bold">{state.errors?.length ?? 0}</dd></div>
                </dl>
                {!!state.unknownHeaders?.length && <p className="mt-4 text-xs text-amber-700">Colunas não reconhecidas (ignoradas): {state.unknownHeaders.join(", ")}</p>}
                {!!state.errors?.length && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold">Linhas com erro</h3>
                    <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto text-sm">{state.errors.map((e, i) => <li key={i} className="rounded bg-red-50 px-3 py-1.5 text-red-700">Linha {e.row}: {e.message}</li>)}</ul>
                  </div>
                )}
                {!!state.duplicates?.length && !state.imported && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold">Já cadastrados</h3>
                    <p className="mt-1 text-xs text-mist-600">{state.duplicates.slice(0, 30).map((d) => `${d.name} (linha ${d.row})`).join(" · ")}{state.duplicates.length > 30 ? " …" : ""}</p>
                  </div>
                )}
                {state.imported && <Link href={backHref} className="btn-dark mt-4">Ver {kind === "leads" ? "leads" : "clientes"}</Link>}
              </>
            )}
          </section>
        )}
      </div>
      <aside className="space-y-4">
        <div className="rounded-2xl bg-navy-800 p-6 text-white">
          <h2 className="font-bold">Modelo da planilha</h2>
          <p className="mt-2 text-sm text-white/70">Baixe, preencha a partir da linha 2 e envie aqui. O modelo tem listas para escolher Tipo, Origem, Etapa e Status, e uma aba de instruções.</p>
          <a href={templateHref} className="btn-primary mt-4 w-full"><Download className="h-4 w-4" /> Baixar modelo (.xlsx)</a>
        </div>
        <div className="rounded-2xl border border-mist-200 bg-white p-6 text-sm text-mist-600">
          <h2 className="font-bold text-navy-800">Dicas</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>A planilha exportada pelo painel tem as mesmas colunas: dá para exportar, editar no Excel e importar de volta.</li>
            <li>Sempre clique em <strong>Validar</strong> antes de importar.</li>
            {kind === "leads" && <li>“Aceita e-mails de marketing” = Sim só com autorização expressa. Esses contatos vão para o Resend.</li>}
          </ul>
        </div>
      </aside>
    </div>
  );
}
