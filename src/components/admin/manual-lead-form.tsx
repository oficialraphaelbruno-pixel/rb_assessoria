"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createManualLead } from "@/lib/admin/crm-actions";
import { SOURCES, SOURCE_LABEL } from "@/lib/admin/crm-constants";
import { Feedback } from "./resource-form";

export function ManualLeadForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createManualLead, null);
  const router = useRouter();
  useEffect(() => { if (state?.ok && state.id) router.push(`/admin/leads/${state.id}`); }, [state, router]);
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="btn-dark px-4 py-2.5"><Plus className="h-4 w-4" /> Novo lead</button>;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4" role="dialog" aria-modal="true" aria-label="Novo lead">
      <form action={action} className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold">Cadastrar lead manualmente</h2>
        <input name="name" required placeholder="Nome *" className="input" aria-label="Nome" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="phone" placeholder="WhatsApp" className="input" aria-label="WhatsApp" />
          <input name="email" type="email" placeholder="E-mail" className="input" aria-label="E-mail" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="company" placeholder="Empresa / equipe" className="input" aria-label="Empresa ou equipe" />
          <input name="city" placeholder="Cidade / UF" className="input" aria-label="Cidade" />
        </div>
        <input name="service" placeholder="Serviço de interesse" className="input" aria-label="Serviço" />
        <select name="source" className="input" aria-label="Origem" defaultValue="instagram">{SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}</select>
        <textarea name="message" rows={3} placeholder="Observações" className="input" aria-label="Observações" />
        <label className="flex items-center gap-2 text-sm text-mist-600"><input type="checkbox" name="consent" className="accent-teal-500" /> O contato autorizou o uso dos dados</label>
        <Feedback state={state} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost px-4 py-2">Cancelar</button>
          <button disabled={pending} className="btn-dark px-4 py-2">Salvar</button>
        </div>
      </form>
    </div>
  );
}
