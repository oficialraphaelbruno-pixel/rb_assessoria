import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-900 px-4">
      <div className="grid-tech pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-teal-500/20 blur-[120px]" aria-hidden />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <Image src="/brand/logo-rb.png" alt="RB Assessoria & Comunicação" width={1682} height={362} className="mx-auto h-10 w-auto" priority />
        <h1 className="mt-6 text-center text-lg font-bold text-navy-800">Painel administrativo</h1>
        <p className="mt-1 text-center text-sm text-mist-600">Acesso restrito à equipe da RB.</p>
        <LoginForm />
      </div>
    </main>
  );
}
