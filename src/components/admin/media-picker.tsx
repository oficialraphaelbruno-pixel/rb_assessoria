"use client";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Search, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, type MediaRow } from "./upload";

/** Modal da biblioteca de mídia: escolher imagem existente ou enviar nova. */
export function MediaPicker({ open, onClose, onSelect, category }: { open: boolean; onClose: () => void; onSelect: (m: { url: string; alt: string }) => void; category?: string }) {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    createClient().from("media").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => { setItems((data as MediaRow[]) ?? []); setLoading(false); });
  }, [open]);

  if (!open) return null;
  const filtered = items.filter((m) => !q || m.name.toLowerCase().includes(q.toLowerCase()) || m.category.includes(q.toLowerCase()) || m.alt.toLowerCase().includes(q.toLowerCase()));

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true); setError("");
    try {
      const m = await uploadImage(files[0], { category });
      onSelect({ url: m.url, alt: m.alt });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/60 p-4" role="dialog" aria-modal="true" aria-label="Biblioteca de mídia">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-mist-200 p-4">
          <ImagePlus className="h-5 w-5 text-teal-500" aria-hidden />
          <h2 className="flex-1 font-bold">Biblioteca de mídia</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-mist-100" aria-label="Fechar"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-col gap-3 border-b border-mist-200 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, categoria ou texto alternativo" className="input pl-9" aria-label="Buscar imagens" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFiles(e.target.files)} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-dark py-2.5">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Enviar nova imagem
          </button>
        </div>
        {error && <p role="alert" className="px-4 pt-3 text-sm text-red-600">{error}</p>}
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-5">
          {loading && <p className="col-span-full text-sm text-mist-600">Carregando…</p>}
          {!loading && !filtered.length && <p className="col-span-full py-10 text-center text-sm text-mist-600">Nenhuma imagem. Envie a primeira!</p>}
          {filtered.map((m) => (
            <button key={m.id} type="button" onClick={() => { onSelect({ url: m.url, alt: m.alt }); onClose(); }}
              className="group overflow-hidden rounded-xl border border-mist-200 text-left transition hover:border-turq-400 hover:shadow-glow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt || m.name} loading="lazy" className="aspect-square w-full bg-mist-50 object-cover" />
              <span className="block truncate px-2 py-1.5 text-xs text-mist-600">{m.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
