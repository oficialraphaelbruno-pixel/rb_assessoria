"use client";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { updateLead } from "@/lib/admin/crm-actions";
import { STAGES, SOURCES, SOURCE_LABEL } from "@/lib/admin/crm-constants";
import { Feedback } from "./resource-form";

export interface LeadRow { id: string; name: string; company: string | null; email: string | null; phone: string | null; service: string | null; source: string; stage: string; estimated_value_cents: number | null; notes: string | null; lost_reason: string | null; audience: string }

export function LeadEditForm({ lead }: { lead: LeadRow }) {
  const [state, action, pending] = useActionState(updateLead.bind(null, lead.id), null);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div><label className="label" htmlFor="l-name">Nome</label><input id="l-name" name="name" defaultValue={lead.name} required className="input" /></div>
      <div><label className="label" htmlFor="l-company">Empresa</label><input id="l-company" name="company" defaultValue={lead.company ?? ""} className="input" /></div>
      <div><label className="label" htmlFor="l-email">E-mail</label><input id="l-email" name="email" type="email" defaultValue={lead.email ?? ""} className="input" /></div>
      <div><label className="label" htmlFor="l-phone">WhatsApp</label><input id="l-phone" name="phone" defaultValue={lead.phone ?? ""} className="input" /></div>
      <div><label className="label" htmlFor="l-service">Serviço</label><input id="l-service" name="service" defaultValue={lead.service ?? ""} className="input" /></div>
      <div><label className="label" htmlFor="l-value">Valor estimado (R$/mês)</label><input id="l-value" name="estimated_value" inputMode="decimal" defaultValue={lead.estimated_value_cents != null ? (lead.estimated_value_cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""} className="input" /></div>
      <div><label className="label" htmlFor="l-stage">Etapa</label><select id="l-stage" name="stage" defaultValue={lead.stage} className="input">{STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
      <div><label className="label" htmlFor="l-source">Origem</label><select id="l-source" name="source" defaultValue={lead.source} className="input">{SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}</select></div>
      <div><label className="label" htmlFor="l-aud">Tipo de público</label><select id="l-aud" name="audience" defaultValue={lead.audience} className="input"><option value="clube">Clube / escolinha</option><option value="empresa">Empresa / profissional</option><option value="outro">Outro</option></select></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="l-notes">Observações internas</label><textarea id="l-notes" name="notes" rows={4} defaultValue={lead.notes ?? ""} className="input" /></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="l-lost">Motivo da perda (se perdido)</label><input id="l-lost" name="lost_reason" defaultValue={lead.lost_reason ?? ""} className="input" /></div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="btn-dark">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Salvar</button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
