"use client";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { updateLeadStage } from "@/lib/admin/crm-actions";
import { STAGES, SOURCE_LABEL } from "@/lib/admin/crm-constants";
import { cn, formatBRL } from "@/lib/utils";

export interface BoardLead { id: string; name: string; company: string | null; service: string | null; source: string; stage: string; created_at: string; estimated_value_cents: number | null }

/** Funil em colunas com arrastar-e-soltar (desktop) e seletor de etapa (mobile/teclado). */
export function LeadBoard({ leads }: { leads: BoardLead[] }) {
  const [, start] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useOptimistic(leads, (state, { id, stage }: { id: string; stage: string }) => state.map((l) => (l.id === id ? { ...l, stage } : l)));
  const move = (id: string, stage: string) => start(async () => { setOptimistic({ id, stage }); await updateLeadStage(id, stage); });

  return (
    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
      {STAGES.map((st) => {
        const items = optimistic.filter((l) => l.stage === st.value);
        const total = items.reduce((s, l) => s + (l.estimated_value_cents ?? 0), 0);
        return (
          <section key={st.value} aria-label={st.label}
            onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragId) move(dragId, st.value); setDragId(null); }}
            className={cn("flex w-72 shrink-0 flex-col rounded-2xl border border-mist-200 bg-white/70", st.value === "fechado" && "border-emerald-200 bg-emerald-50/40", st.value === "perdido" && "bg-mist-100/60")}>
            <header className="flex items-center justify-between border-b border-mist-200 px-4 py-3">
              <h2 className="text-sm font-bold text-navy-800">{st.label}</h2>
              <span className="rounded-full bg-mist-100 px-2 text-xs font-semibold text-mist-600">{items.length}</span>
            </header>
            {total > 0 && <p className="px-4 pt-2 text-xs text-mist-600">Potencial: {formatBRL(total)}</p>}
            <ul className="flex-1 space-y-2 p-3">
              {items.map((l) => (
                <li key={l.id} draggable onDragStart={() => setDragId(l.id)} className="cursor-grab rounded-xl border border-mist-200 bg-white p-3 shadow-sm active:cursor-grabbing">
                  <Link href={`/admin/leads/${l.id}`} className="block font-semibold text-navy-800 hover:text-teal-600">{l.name}</Link>
                  {l.company && <p className="text-xs text-mist-600">{l.company}</p>}
                  {l.service && <p className="mt-1 line-clamp-1 text-xs text-mist-600">{l.service}</p>}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-turq-50 px-2 py-0.5 text-[11px] font-medium text-teal-600">{SOURCE_LABEL[l.source] ?? l.source}</span>
                    <select value={l.stage} onChange={(e) => move(l.id, e.target.value)} className="rounded-md border border-mist-200 bg-white px-1.5 py-0.5 text-[11px]" aria-label={`Etapa de ${l.name}`}>
                      {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <p className="mt-1.5 text-[11px] text-mist-400">{new Date(l.created_at).toLocaleDateString("pt-BR")}</p>
                </li>
              ))}
              {!items.length && <li className="rounded-xl border border-dashed border-mist-200 p-4 text-center text-xs text-mist-400">Arraste leads para cá</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
