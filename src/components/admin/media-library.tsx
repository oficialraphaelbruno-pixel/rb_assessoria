"use client";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Search, Trash2, Upload, X } from "lucide-react";
import { uploadImage, type MediaRow } from "./upload";
import { deleteMedia, updateMedia } from "@/lib/admin/media-actions";

const kb = (b: number | null) => (b == null ? "" : b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export function MediaLibrary({ initial }: { initial: MediaRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [category, setCategory] = useState("geral");
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [sel, setSel] = useState<MediaRow | null>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const categories = useMemo(() => [...new Set(items.map((i) => i.category))].sort(), [items]);
  const list = items.filter((m) => (!cat || m.category === cat) && (!q || `${m.name} ${m.alt}`.toLowerCase().includes(q.toLowerCase())));

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    for (const file of Array.from(files)) {
      setUploading((n) => n + 1);
      try { const m = await uploadImage(file, { category }); setItems((x) => [m, ...x]); }
      catch (e) { setError(`${file.name}: ${(e as Error).message}`); }
      finally { setUploading((n) => n - 1); }
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="space-y-4 lg:col-span-3">
        <div className="flex flex-col gap-3 rounded-2xl border border-mist-200 bg-white p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" className="input pl-9" aria-label="Buscar mídia" />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="input sm:w-44" aria-label="Filtrar categoria">
            <option value="">Todas as categorias</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-mist-200 bg-white p-6 text-center sm:flex-row sm:text-left">
          <Upload className="h-8 w-8 text-turq-400" aria-hidden />
          <div className="flex-1 text-sm text-mist-600">Arraste imagens aqui ou clique em enviar. As imagens são otimizadas automaticamente (WebP, até 2000px).</div>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoria" className="input sm:w-40" aria-label="Categoria do envio" list="media-cats" />
          <datalist id="media-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => onFiles(e.target.files)} />
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-dark px-4 py-2.5">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Enviar</button>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {list.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => { setSel(m); setMsg(""); }} className={`block w-full overflow-hidden rounded-xl border bg-white text-left transition hover:shadow-glow ${sel?.id === m.id ? "border-turq-400 ring-2 ring-turq-400/30" : "border-mist-200"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt || m.name} loading="lazy" className="aspect-square w-full bg-mist-50 object-cover" />
                <span className="block truncate px-2 pt-1.5 text-xs font-medium">{m.name}</span>
                <span className="block px-2 pb-1.5 text-[11px] text-mist-400">{m.category} · {kb(m.size_bytes)}{!m.alt && " · sem alt"}</span>
              </button>
            </li>
          ))}
          {!list.length && <li className="col-span-full py-12 text-center text-sm text-mist-600">Nenhuma imagem.</li>}
        </ul>
      </div>
      <aside className="lg:sticky lg:top-6 lg:self-start">
        {sel ? (
          <form key={sel.id} className="space-y-3 rounded-2xl border border-mist-200 bg-white p-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = { name: String(fd.get("name")), alt: String(fd.get("alt")), category: String(fd.get("category")) };
            start(async () => {
              const r = await updateMedia(sel.id, data);
              setMsg(r.ok ? "Salvo." : r.error ?? "Erro");
              if (r.ok) setItems((x) => x.map((i) => (i.id === sel.id ? { ...i, ...data } : i)));
            });
          }}>
            <div className="flex items-center justify-between"><h2 className="font-bold">Detalhes</h2><button type="button" onClick={() => setSel(null)} aria-label="Fechar"><X className="h-4 w-4" /></button></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sel.url} alt={sel.alt} className="w-full rounded-lg bg-mist-50 object-contain" />
            <p className="text-xs text-mist-600">{sel.width}×{sel.height}px · {kb(sel.size_bytes)}</p>
            <label className="block"><span className="label">Nome</span><input name="name" defaultValue={sel.name} className="input py-2" /></label>
            <label className="block"><span className="label">Texto alternativo (acessibilidade)</span><textarea name="alt" defaultValue={sel.alt} rows={2} className="input py-2" placeholder="Descreva a imagem" /></label>
            <label className="block"><span className="label">Categoria</span><input name="category" defaultValue={sel.category} className="input py-2" list="media-cats" /></label>
            <div className="flex flex-wrap gap-2">
              <button disabled={pending} className="btn-dark px-4 py-2 text-xs">Salvar</button>
              <button type="button" className="btn-ghost px-4 py-2 text-xs" onClick={() => { navigator.clipboard.writeText(sel.url); setMsg("Link copiado."); }}><Copy className="h-3.5 w-3.5" />Copiar link</button>
              <button type="button" disabled={pending} className="btn border border-red-200 px-4 py-2 text-xs text-red-600 hover:bg-red-50" onClick={() => {
                if (!window.confirm("Excluir esta imagem?")) return;
                start(async () => {
                  let r = await deleteMedia(sel.id);
                  if (!r.ok && r.usage?.length && window.confirm(`${r.error}\n\nExcluir mesmo assim? As páginas ficarão sem a imagem.`)) r = await deleteMedia(sel.id, true);
                  if (r.ok) { setItems((x) => x.filter((i) => i.id !== sel.id)); setSel(null); } else setMsg(r.error ?? "Erro");
                });
              }}><Trash2 className="h-3.5 w-3.5" />Excluir</button>
            </div>
            {msg && <p role="status" className="text-xs text-mist-600">{msg}</p>}
          </form>
        ) : <p className="rounded-2xl border border-dashed border-mist-200 p-6 text-center text-sm text-mist-600">Selecione uma imagem para editar nome, texto alternativo e categoria.</p>}
      </aside>
    </div>
  );
}
