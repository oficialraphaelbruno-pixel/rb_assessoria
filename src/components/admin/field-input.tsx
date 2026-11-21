"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, ImageIcon, Plus, Trash2, X } from "lucide-react";
import type { FieldDef } from "@/lib/admin/fields";
import { MediaPicker } from "./media-picker";
import { cn, slugify } from "@/lib/utils";

type Value = unknown;
export interface RelationOption { value: string; label: string }

function Help({ text }: { text?: string }) {
  return text ? <p className="mt-1 text-xs text-mist-600">{text}</p> : null;
}

function move<T>(arr: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

function RowTools({ onUp, onDown, onRemove }: { onUp: () => void; onDown: () => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 gap-1">
      <button type="button" onClick={onUp} className="rounded p-1.5 text-mist-600 hover:bg-mist-100" aria-label="Mover para cima"><ArrowUp className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={onDown} className="rounded p-1.5 text-mist-600 hover:bg-mist-100" aria-label="Mover para baixo"><ArrowDown className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={onRemove} className="rounded p-1.5 text-red-500 hover:bg-red-50" aria-label="Remover"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}

function ImageField({ f, value }: { f: FieldDef; value: string }) {
  const [url, setUrl] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  return (
    <div>
      <input type="hidden" name={f.name} value={url} />
      <div className="flex items-start gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-mist-200 bg-mist-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url ? <img src={url} alt="" className="h-full w-full object-contain" /> : <ImageIcon className="h-6 w-6 text-mist-400" aria-hidden />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setOpen(true)} className="btn-dark px-4 py-2 text-xs">Escolher / enviar imagem</button>
            {url && <button type="button" onClick={() => setUrl("")} className="btn-ghost px-4 py-2 text-xs"><X className="h-3.5 w-3.5" /> Remover</button>}
          </div>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="ou cole um link https://" className="input py-2 text-xs" aria-label={`${f.label} — link`} />
        </div>
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(m) => setUrl(m.url)} />
    </div>
  );
}

function ListField({ f, value }: { f: FieldDef; value: string[] }) {
  const [items, setItems] = useState<string[]>(Array.isArray(value) ? value : []);
  return (
    <div>
      <input type="hidden" name={f.name} value={JSON.stringify(items)} />
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={it} onChange={(e) => setItems(items.map((x, j) => (j === i ? e.target.value : x)))} className="input py-2" aria-label={`${f.label} ${i + 1}`} />
            <RowTools onUp={() => setItems(move(items, i, -1))} onDown={() => setItems(move(items, i, 1))} onRemove={() => setItems(items.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setItems([...items, ""])} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline"><Plus className="h-4 w-4" /> Adicionar item</button>
    </div>
  );
}

function ItemsField({ f, value }: { f: FieldDef; value: Record<string, string>[] }) {
  const sub = f.fields ?? [];
  const blank = () => Object.fromEntries(sub.map((s) => [s.name, ""]));
  const [items, setItems] = useState<Record<string, string>[]>(Array.isArray(value) ? value : []);
  const set = (i: number, k: string, v: string) => setItems(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div>
      <input type="hidden" name={f.name} value={JSON.stringify(items)} />
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-mist-200 bg-mist-50/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-mist-600">#{i + 1}</span>
              <RowTools onUp={() => setItems(move(items, i, -1))} onDown={() => setItems(move(items, i, 1))} onRemove={() => setItems(items.filter((_, j) => j !== i))} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {sub.map((s) => (
                <label key={s.name} className={cn("block", s.type === "textarea" && "sm:col-span-2")}>
                  <span className="mb-1 block text-xs font-medium text-mist-600">{s.label}</span>
                  {s.type === "textarea"
                    ? <textarea value={it[s.name] ?? ""} onChange={(e) => set(i, s.name, e.target.value)} rows={2} className="input py-2" />
                    : <input value={it[s.name] ?? ""} onChange={(e) => set(i, s.name, e.target.value)} className="input py-2" />}
                  {s.help && <span className="mt-0.5 block text-[11px] text-mist-400">{s.help}</span>}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setItems([...items, blank()])} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline"><Plus className="h-4 w-4" /> Adicionar</button>
    </div>
  );
}

function GalleryField({ f, value }: { f: FieldDef; value: { url: string; alt?: string }[] }) {
  const [items, setItems] = useState<{ url: string; alt?: string }[]>(Array.isArray(value) ? value : []);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <input type="hidden" name={f.name} value={JSON.stringify(items)} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((g, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-mist-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.url} alt={g.alt ?? ""} className="aspect-square w-full bg-mist-50 object-cover" />
            <div className="space-y-1 p-2">
              <input value={g.alt ?? ""} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} placeholder="Texto alternativo" className="input py-1.5 text-xs" aria-label={`Texto alternativo da imagem ${i + 1}`} />
              <RowTools onUp={() => setItems(move(items, i, -1))} onDown={() => setItems(move(items, i, 1))} onRemove={() => setItems(items.filter((_, j) => j !== i))} />
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setOpen(true)} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-mist-200 text-sm text-mist-600 hover:border-turq-400 hover:text-teal-600">
          <Plus className="h-6 w-6" /> Adicionar imagem
        </button>
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(m) => setItems([...items, { url: m.url, alt: m.alt }])} />
    </div>
  );
}

function LinksField({ f, value }: { f: FieldDef; value: { label: string; url: string }[] }) {
  const [items, setItems] = useState<{ label: string; url: string }[]>(Array.isArray(value) ? value : []);
  const set = (i: number, k: "label" | "url", v: string) => setItems(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div>
      <input type="hidden" name={f.name} value={JSON.stringify(items)} />
      <div className="space-y-2">
        {items.map((l, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input value={l.label} onChange={(e) => set(i, "label", e.target.value)} placeholder="Nome do link" className="input py-2 sm:w-48" aria-label="Nome do link" />
            <input value={l.url} onChange={(e) => set(i, "url", e.target.value)} placeholder="https://" className="input py-2" aria-label="Endereço do link" />
            <RowTools onUp={() => setItems(move(items, i, -1))} onDown={() => setItems(move(items, i, 1))} onRemove={() => setItems(items.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setItems([...items, { label: "", url: "" }])} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline"><Plus className="h-4 w-4" /> Adicionar link</button>
    </div>
  );
}

function moneyDisplay(cents: unknown) {
  return typeof cents === "number" ? (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "";
}

export function FieldInput({ f, value, relationOptions }: { f: FieldDef; value: Value; relationOptions?: RelationOption[] }) {
  const id = `f-${f.name}`;
  const [slug, setSlug] = useState(typeof value === "string" ? value : "");

  let control: React.ReactNode;
  switch (f.type) {
    case "textarea":
      control = <textarea id={id} name={f.name} defaultValue={(value as string) ?? ""} rows={4} required={f.required} className="input" placeholder={f.placeholder} />;
      break;
    case "markdown":
      control = <textarea id={id} name={f.name} defaultValue={(value as string) ?? ""} rows={16} className="input font-mono text-xs" />;
      break;
    case "boolean":
      return (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-mist-200 px-4 py-3">
          <input type="checkbox" name={f.name} defaultChecked={!!value} className="h-4 w-4 accent-teal-500" />
          <span className="text-sm font-medium">{f.label}</span>
          {f.help && <span className="text-xs text-mist-600">— {f.help}</span>}
        </label>
      );
    case "number":
      control = <input id={id} name={f.name} type="number" inputMode="numeric" defaultValue={value == null ? "" : String(value)} required={f.required} className="input" />;
      break;
    case "money":
      control = (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-mist-400">R$</span>
          <input id={id} name={f.name} inputMode="decimal" defaultValue={moneyDisplay(value)} placeholder="0,00" required={f.required} className="input pl-10" />
        </div>
      );
      break;
    case "date":
      control = <input id={id} name={f.name} type="date" defaultValue={(value as string) ?? ""} required={f.required} className="input" />;
      break;
    case "select":
      control = (
        <select id={id} name={f.name} defaultValue={(value as string) ?? f.options?.[0]?.value ?? ""} required={f.required} className="input">
          {!f.required && <option value="">—</option>}
          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case "relation":
      control = (
        <select id={id} name={f.name} defaultValue={(value as string) ?? ""} className="input">
          <option value="">— nenhum —</option>
          {relationOptions?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case "slug":
      control = (
        <div className="flex gap-2">
          <input id={id} name={f.name} value={slug} onChange={(e) => setSlug(slugify(e.target.value))} required={f.required} className="input font-mono text-xs" />
          {f.from && (
            <button type="button" className="btn-ghost shrink-0 px-3 py-2 text-xs" onClick={(e) => {
              const form = (e.currentTarget as HTMLButtonElement).form;
              const src = form?.elements.namedItem(f.from!) as HTMLInputElement | null;
              if (src?.value) setSlug(slugify(src.value));
            }}>Gerar</button>
          )}
        </div>
      );
      break;
    case "image": control = <ImageField f={f} value={(value as string) ?? ""} />; break;
    case "list": control = <ListField f={f} value={value as string[]} />; break;
    case "items": control = <ItemsField f={f} value={value as Record<string, string>[]} />; break;
    case "gallery": control = <GalleryField f={f} value={value as { url: string }[]} />; break;
    case "links": control = <LinksField f={f} value={value as { label: string; url: string }[]} />; break;
    default:
      control = <input id={id} name={f.name} type={f.type === "email" ? "email" : f.type === "url" ? "url" : "text"} defaultValue={(value as string) ?? ""} required={f.required} placeholder={f.placeholder} className="input" />;
  }

  const labelFor = ["image", "list", "items", "gallery", "links"].includes(f.type) ? undefined : id;
  return (
    <div>
      {labelFor ? <label htmlFor={labelFor} className="label">{f.label}{f.required && " *"}</label> : <p className="label">{f.label}{f.required && " *"}</p>}
      {control}
      <Help text={f.help} />
    </div>
  );
}
