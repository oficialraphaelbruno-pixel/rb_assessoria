"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { documentLink, registerDocument } from "@/lib/admin/system-actions";
import { slugify } from "@/lib/utils";

const KINDS = [["contrato", "Contrato"], ["proposta", "Proposta"], ["briefing", "Briefing"], ["nota_fiscal", "Nota fiscal"], ["extrato", "Extrato"], ["outro", "Outro"]];

export function DocumentUpload({ clients }: { clients: { value: string; label: string }[] }) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  return (
    <form ref={ref} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const file = fd.get("file") as File;
      if (!file?.size) return setMsg("Selecione um arquivo.");
      if (file.size > 20 * 1024 * 1024) return setMsg("Máximo de 20 MB.");
      setBusy(true); setMsg("");
      const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${fd.get("kind")}/${new Date().getFullYear()}/${crypto.randomUUID().slice(0, 8)}-${slugify(file.name.replace(/\.[^.]+$/, "")) || "arquivo"}.${ext}`;
      const { error } = await createClient().storage.from("documents").upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (error) { setBusy(false); return setMsg(error.message.includes("mime") ? "Tipo de arquivo não permitido." : "Falha no envio."); }
      const r = await registerDocument({ name: file.name, path, kind: String(fd.get("kind")), client_id: (fd.get("client_id") as string) || null, size: file.size, mime: file.type, notes: String(fd.get("notes") || "") });
      setBusy(false); setMsg(r.ok ? "Documento enviado." : r.error ?? "Erro");
      if (r.ok) { ref.current?.reset(); router.refresh(); }
    }}>
      <input type="file" name="file" required accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.csv,.ofx,.txt" className="input py-2 lg:col-span-2" aria-label="Arquivo" />
      <select name="kind" className="input" aria-label="Tipo">{KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <select name="client_id" className="input" aria-label="Cliente"><option value="">Sem cliente</option>{clients.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
      <button disabled={busy} className="btn-dark">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Enviar</button>
      <input name="notes" placeholder="Observações (opcional)" className="input sm:col-span-2 lg:col-span-5" aria-label="Observações" />
      {msg && <p role="status" className="text-sm text-mist-600 sm:col-span-2 lg:col-span-5">{msg}</p>}
    </form>
  );
}

export function DownloadButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} className="btn-ghost px-3 py-1.5 text-xs" onClick={() => start(async () => {
      const r = await documentLink(id);
      if (r.url) window.open(r.url, "_blank", "noopener,noreferrer"); else alert(r.error);
    })}>{pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}Baixar</button>
  );
}
