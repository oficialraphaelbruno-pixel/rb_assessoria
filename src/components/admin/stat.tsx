import { cn } from "@/lib/utils";

export function Stat({ label, value, hint, tone = "default" }: { label: string; value: string; hint?: string; tone?: "default" | "good" | "bad" | "dark" }) {
  return (
    <div className={cn("rounded-2xl border p-5", tone === "dark" ? "border-navy-800 bg-navy-800 text-white" : "border-mist-200 bg-white")}>
      <p className={cn("text-xs font-medium uppercase tracking-wider", tone === "dark" ? "text-white/60" : "text-mist-600")}>{label}</p>
      <p className={cn("mt-2 font-display text-2xl font-bold", tone === "good" && "text-emerald-700", tone === "bad" && "text-red-600", tone === "default" && "text-navy-800")}>{value}</p>
      {hint && <p className={cn("mt-1 text-xs", tone === "dark" ? "text-white/60" : "text-mist-600")}>{hint}</p>}
    </div>
  );
}
