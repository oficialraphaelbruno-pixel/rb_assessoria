"use client";
import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { ActionResult } from "@/lib/admin/actions";
import { Feedback } from "./resource-form";

export function HistoryForm({ action, withKind }: { action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>; withKind?: boolean }) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={formAction} className="space-y-2">
      {withKind && (
        <select name="kind" className="input py-2" aria-label="Tipo de registro">
          <option value="nota">Anotação</option><option value="ligacao">Ligação</option><option value="whatsapp">WhatsApp</option>
          <option value="email">E-mail</option><option value="reuniao">Reunião</option><option value="proposta">Proposta</option>
        </select>
      )}
      <textarea name="content" rows={3} required placeholder="Descreva o contato, combinado ou próximo passo…" className="input" aria-label="Registro" />
      <div className="flex items-center gap-3">
        <button className="btn-dark px-4 py-2 text-xs" disabled={pending}>{pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Adicionar ao histórico</button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
