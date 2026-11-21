"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Save, TriangleAlert } from "lucide-react";
import type { FieldDef } from "@/lib/admin/fields";
import type { ActionResult } from "@/lib/admin/actions";
import { FieldInput, type RelationOption } from "./field-input";
import { cn } from "@/lib/utils";

export function Feedback({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm", state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
      {state.ok ? <CheckCircle2 className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
      {state.ok ? state.message : state.error}
    </p>
  );
}

/** Formulário genérico do painel ligado a uma server action. */
export function ResourceForm({ action, fields, values, relations = {}, redirectBase, submitLabel = "Salvar" }: {
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  fields: FieldDef[]; values: Record<string, unknown>; relations?: Record<string, RelationOption[]>;
  redirectBase?: string; submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const router = useRouter();
  useEffect(() => {
    if (state?.ok && redirectBase && state.id && !values.id) router.replace(`${redirectBase}/${state.id}`);
  }, [state, redirectBase, router, values.id]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={cn((f.span === 2 || ["items", "gallery", "links", "list", "markdown"].includes(f.type)) && "md:col-span-2")}>
            <FieldInput f={f} value={values[f.name]} relationOptions={relations[f.name]} />
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 -mx-6 flex flex-col gap-3 border-t border-mist-200 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className="btn-dark">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {submitLabel}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
