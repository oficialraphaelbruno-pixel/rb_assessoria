"use client";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark" | "system";
import { THEME_KEY } from "./theme-script";

function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("admin-dark", dark);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    let saved: Mode = "system";
    try { saved = (localStorage.getItem(THEME_KEY) as Mode) || "system"; } catch { /* noop */ }
    setMode(saved);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { try { if ((localStorage.getItem(THEME_KEY) || "system") === "system") apply("system"); } catch { apply("system"); } };
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      document.documentElement.classList.remove("admin-dark"); // não vaza para o site público
    };
  }, []);

  const choose = (m: Mode) => {
    setMode(m);
    try { localStorage.setItem(THEME_KEY, m); } catch { /* noop */ }
    apply(m);
  };

  const opts: { m: Mode; label: string; Icon: typeof Sun }[] = [
    { m: "light", label: "Claro", Icon: Sun },
    { m: "dark", label: "Escuro", Icon: Moon },
    { m: "system", label: "Sistema", Icon: Monitor },
  ];
  return (
    <div role="radiogroup" aria-label="Tema do painel" className="flex rounded-lg bg-white/5 p-1">
      {opts.map(({ m, label, Icon }) => (
        <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => choose(m)} title={`Tema ${label.toLowerCase()}`}
          className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition", mode === m ? "bg-turq-400/20 text-turq-300" : "text-white/60 hover:text-white")}>
          <Icon className="h-3.5 w-3.5" aria-hidden />{label}
        </button>
      ))}
    </div>
  );
}
