"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p1 = String(fd.get("p1")), p2 = String(fd.get("p2"));
    if (p1.length < 10) return setError("Use pelo menos 10 caracteres.");
    if (p1 !== p2) return setError("As senhas não conferem.");
    const { error } = await createClient().auth.updateUser({ password: p1 });
    if (error) return setError("Não foi possível alterar a senha. Solicite um novo link.");
    router.replace("/admin");
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-card">
        <h1 className="text-lg font-bold text-navy-800">Definir nova senha</h1>
        <div><label htmlFor="p1" className="label">Nova senha</label><input id="p1" name="p1" type="password" required autoComplete="new-password" className="input" /></div>
        <div><label htmlFor="p2" className="label">Repita a senha</label><input id="p2" name="p2" type="password" required autoComplete="new-password" className="input" /></div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-dark w-full">Salvar senha</button>
      </form>
    </main>
  );
}
