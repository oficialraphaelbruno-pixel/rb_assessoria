"use client";
import { useActionState } from "react";
import { Loader2, Save, Send } from "lucide-react";
import type { FieldDef } from "@/lib/admin/fields";
import { saveSetting } from "@/lib/admin/actions";
import { FieldInput } from "./field-input";
import { Feedback } from "./resource-form";
import { cn } from "@/lib/utils";

export function SettingForm({ settingKey, fields, values }: { settingKey: string; fields: FieldDef[]; values: Record<string, unknown> }) {
  const [draftState, saveDraft, savingDraft] = useActionState(saveSetting.bind(null, settingKey, false), null);
  const [pubState, publish, publishing] = useActionState(saveSetting.bind(null, settingKey, true), null);
  const state = pubState && (!draftState || publishing || !savingDraft) ? pubState : draftState;
  return (
    <form className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={cn((["textarea", "items", "list", "markdown"].includes(f.type) || f.span === 2) && "md:col-span-2")}>
            <FieldInput f={f} value={values[f.name]} />
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 -mx-6 flex flex-col gap-3 border-t border-mist-200 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center">
        <button formAction={saveDraft} disabled={savingDraft || publishing} className="btn-ghost">
          {savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar rascunho
        </button>
        <button formAction={publish} disabled={savingDraft || publishing} className="btn-dark"
          onClick={(e) => { if (!window.confirm("Publicar estas alterações no site agora?")) e.preventDefault(); }}>
          {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publicar
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
