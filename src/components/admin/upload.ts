"use client";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

const MAX_DIM = 2000;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const MAX_UPLOAD_MB = 8;

/** Redimensiona e converte para WebP no navegador (exceto GIF), reduzindo o peso antes do envio. */
async function optimize(file: File): Promise<{ blob: Blob; width: number; height: number; type: string; ext: string }> {
  if (file.type === "image/gif") {
    const bmp = await createImageBitmap(file);
    return { blob: file, width: bmp.width, height: bmp.height, type: file.type, ext: "gif" };
  }
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Falha ao converter imagem"))), "image/webp", 0.86));
  // se a conversão piorar (raro), mantém o original
  return blob.size < file.size || scale < 1 ? { blob, width: w, height: h, type: "image/webp", ext: "webp" } : { blob: file, width: bmp.width, height: bmp.height, type: file.type, ext: file.name.split(".").pop() || "img" };
}

export interface MediaRow { id: string; url: string; name: string; alt: string; category: string; path: string; width: number | null; height: number | null; size_bytes: number | null; created_at: string }

export async function uploadImage(file: File, opts: { category?: string; alt?: string } = {}): Promise<MediaRow> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Formato não suportado. Use JPG, PNG, WebP, AVIF ou GIF.");
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024 * 3) throw new Error("Arquivo muito grande.");
  const { blob, width, height, type, ext } = await optimize(file);
  if (blob.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`A imagem otimizada passou de ${MAX_UPLOAD_MB} MB.`);
  const category = slugify(opts.category || "geral") || "geral";
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "imagem";
  const path = `${category}/${new Date().getFullYear()}/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;
  const supabase = createClient();
  const { error: upErr } = await supabase.storage.from("media").upload(path, blob, { contentType: type, cacheControl: "31536000", upsert: false });
  if (upErr) throw new Error(upErr.message.includes("row-level") ? "Sem permissão para enviar arquivos." : "Falha no envio do arquivo.");
  const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("media").insert({
    path, url: pub.publicUrl, name: file.name.slice(0, 200), category, alt: opts.alt ?? "", mime: type, size_bytes: blob.size, width, height, created_by: user?.id,
  }).select("*").single();
  if (error) throw new Error("Arquivo enviado, mas não foi possível registrar na biblioteca.");
  return data as MediaRow;
}
