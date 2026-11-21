"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { ActionResult } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

/** Botão que executa uma server action, com confirmação opcional para ações destrutivas. */
export function ActionButton({ action, confirm, children, className, redirectTo, variant = "ghost" }: {
  action: () => Promise<ActionResult>; confirm?: string; children: React.ReactNode; className?: string; redirectTo?: string;
  variant?: "ghost" | "danger" | "dark" | "primary";
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<ActionResult | null>(null);
  const router = useRouter();
  const styles = { ghost: "btn-ghost", danger: "btn border border-red-200 text-red-600 hover:bg-red-50", dark: "btn-dark", primary: "btn-primary" }[variant];
  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" disabled={pending} className={cn(styles, "px-4 py-2 text-xs", className)} onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          const r = await action();
          setMsg(r);
          if (r.ok && redirectTo) router.push(redirectTo);
          else router.refresh();
        });
      }}>
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{children}
      </button>
      {msg && !msg.ok && <span role="alert" className="text-xs text-red-600">{msg.error}</span>}
    </span>
  );
}
