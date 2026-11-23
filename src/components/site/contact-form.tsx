"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { readAttribution } from "./attribution";
import { cn } from "@/lib/utils";

export function ContactForm({ services, defaultService, source = "site", dark = false, buttonLabel = "Enviar solicitação" }: {
  services: string[]; defaultService?: string; source?: string; dark?: boolean; buttonLabel?: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const attribution = readAttribution();
    setState("sending"); setError(""); setFieldErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"), company: fd.get("company"), email: fd.get("email"), phone: fd.get("phone"),
          service: fd.get("service"), message: fd.get("message"), consent: fd.get("consent") === "on", marketing: fd.get("marketing") === "on",
          website: fd.get("website"), source, ...attribution,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFieldErrors(json.fieldErrors ?? {});
        setError(json.error ?? "Não foi possível enviar.");
        setState("error");
        return;
      }
      form.reset();
      setState("done");
      // evento de conversão para GA4/Meta, se instalados
      const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
      w.gtag?.("event", "generate_lead", { source });
      w.fbq?.("track", "Lead");
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className={cn("rounded-xl2 p-8 text-center", dark ? "card-dark text-white" : "card")}>
        <CheckCircle2 className="mx-auto h-12 w-12 text-turq-400" aria-hidden />
        <h3 className="mt-4 text-xl font-bold">Recebemos sua mensagem!</h3>
        <p className={cn("mt-2", dark ? "text-white/70" : "text-mist-600")}>A equipe da RB vai analisar e retornar pelo contato informado.</p>
        <button type="button" onClick={() => setState("idle")} className="btn-ghost mt-6">Enviar outra mensagem</button>
      </div>
    );
  }

  const lbl = cn("label", dark && "text-white/90");
  const inp = cn("input", dark && "border-white/15 bg-white/5 text-white placeholder:text-white/40");
  const err = (k: string) => fieldErrors[k] && <p id={`${k}-err`} className="mt-1 text-xs text-red-500">{fieldErrors[k]}</p>;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2" aria-describedby={error ? "form-error" : undefined}>
      <div>
        <label htmlFor="cf-name" className={lbl}>Nome *</label>
        <input id="cf-name" name="name" required autoComplete="name" className={inp} aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "name-err" : undefined} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="cf-company" className={lbl}>Empresa ou projeto</label>
        <input id="cf-company" name="company" autoComplete="organization" className={inp} />
      </div>
      <div>
        <label htmlFor="cf-email" className={lbl}>E-mail *</label>
        <input id="cf-email" name="email" type="email" required autoComplete="email" className={inp} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? "email-err" : undefined} />
        {err("email")}
      </div>
      <div>
        <label htmlFor="cf-phone" className={lbl}>WhatsApp</label>
        <input id="cf-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(31) 90000-0000" className={inp} aria-invalid={!!fieldErrors.phone} aria-describedby={fieldErrors.phone ? "phone-err" : undefined} />
        {err("phone")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="cf-service" className={lbl}>Serviço desejado</label>
        <select id="cf-service" name="service" defaultValue={defaultService ?? ""} className={inp}>
          <option value="">Ainda não sei / quero orientação</option>
          {services.map((s) => <option key={s} value={s}>{s}</option>)}
          <option value="Outro">Outro</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="cf-message" className={lbl}>Mensagem</label>
        <textarea id="cf-message" name="message" rows={4} maxLength={4000} placeholder="Conte um pouco sobre seu negócio e seus objetivos." className={inp} />
      </div>
      {/* honeypot anti-spam (invisível para pessoas) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="cf-website">Site</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="sm:col-span-2">
        <label className={cn("flex items-start gap-3 text-sm", dark ? "text-white/70" : "text-mist-600")}>
          <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-teal-500" aria-invalid={!!fieldErrors.consent} />
          <span>Autorizo a RB Assessoria & Comunicação a usar meus dados para retornar este contato, conforme a{" "}
            <Link href="/privacidade" className="underline underline-offset-2 hover:text-teal-500">Política de Privacidade</Link>. *</span>
        </label>
        {err("consent")}
        <label className={cn("mt-3 flex items-start gap-3 text-sm", dark ? "text-white/70" : "text-mist-600")}>
          <input type="checkbox" name="marketing" className="mt-0.5 h-4 w-4 shrink-0 accent-teal-500" />
          <span>Quero receber por e-mail conteúdos, novidades e oportunidades da RB. Posso cancelar quando quiser. (opcional)</span>
        </label>
      </div>
      {error && <p id="form-error" role="alert" className="text-sm text-red-500 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className="btn-primary w-full sm:w-auto">
          {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          {state === "sending" ? "Enviando..." : buttonLabel}
        </button>
      </div>
    </form>
  );
}
