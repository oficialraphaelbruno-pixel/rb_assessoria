"use client";
import { useActionState } from "react";
import { Loader2, Upload } from "lucide-react";
import { importStatement } from "@/lib/admin/finance-actions";
import { Feedback } from "./resource-form";

export function ImportForm() {
  const [state, action, pending] = useActionState(importStatement, null);
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input type="file" name="file" accept=".ofx,.csv,.txt" required className="input py-2" aria-label="Arquivo de extrato" />
      <button disabled={pending} className="btn-dark shrink-0">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Importar</button>
      <Feedback state={state} />
    </form>
  );
}
