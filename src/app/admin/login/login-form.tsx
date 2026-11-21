"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    setBusy(true); setError(""); setInfo("");
    const supabase = createClient();
    if (mode === "reset") {
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/admin/auth/callback?next=/admin/redefinir-senha` });
      setInfo("Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.");
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: String(fd.get("password") || "") });
    setBusy(false);
    if (error) { setError("E-mail ou senha inválidos."); return; }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      {mode === "login" && (
        <div>
          <label htmlFor="password" className="label">Senha</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" minLength={8} className="input" />
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {info && <p role="status" className="text-sm text-emerald-700">{info}</p>}
      <button type="submit" disabled={busy} className="btn-dark w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} {mode === "login" ? "Entrar" : "Enviar link de redefinição"}
      </button>
      <button type="button" onClick={() => { setMode(mode === "login" ? "reset" : "login"); setError(""); setInfo(""); }} className="w-full text-center text-sm text-teal-600 hover:underline">
        {mode === "login" ? "Esqueci minha senha" : "Voltar para o login"}
      </button>
    </form>
  );
}
