"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Loader2, MessageCircle, Send, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "assistant"; content: string }
interface Config { enabled: boolean; assistantName: string; welcome: string }

function visitorId() {
  try {
    let id = localStorage.getItem("rb_vid");
    if (!id) { id = crypto.randomUUID().replace(/-/g, ""); localStorage.setItem("rb_vid", id); }
    return id;
  } catch { return "anon" + Math.random().toString(36).slice(2, 14); }
}

export function ChatWidget({ whatsappHref }: { whatsappHref: string | null }) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showLead, setShowLead] = useState(false);
  const [leadState, setLeadState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [leadError, setLeadError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || config) return;
    fetch("/api/chat/config").then((r) => r.json()).then((c: Config) => {
      setConfig(c);
      setMsgs([{ role: "assistant", content: c.enabled ? c.welcome : "Olá! No momento o atendimento automático está desligado. Deixe seu contato ou fale com a equipe pelo WhatsApp." }]);
    }).catch(() => setConfig({ enabled: false, assistantName: "Assistente RB", welcome: "" }));
    try { setConversationId(sessionStorage.getItem("rb_conv")); } catch { /* noop */ }
  }, [open, config]);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy, showLead]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setMsgs((m) => [...m, { role: "user", content }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, visitorId: visitorId(), message: content, page: location.pathname }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.conversationId) {
        setConversationId(json.conversationId);
        try { sessionStorage.setItem("rb_conv", json.conversationId); } catch { /* noop */ }
      }
      setMsgs((m) => [...m, { role: "assistant", content: json.reply ?? json.error ?? "Não consegui responder agora." }]);
      if (json.handoff || json.limitReached) setShowLead(true);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Falha de conexão. Tente novamente ou fale pelo WhatsApp." }]);
    } finally {
      setBusy(false);
    }
  }

  async function submitLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLeadState("sending"); setLeadError("");
    const res = await fetch("/api/chat/lead", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, visitorId: visitorId(), name: fd.get("name"), contact: fd.get("contact"), interest: fd.get("interest"), consent: fd.get("consent") === "on" }),
    }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) { setLeadState("done"); setMsgs((m) => [...m, { role: "assistant", content: "Obrigado! Seu contato foi enviado para a equipe da RB, que vai retornar em breve." }]); setShowLead(false); }
    else { setLeadState("error"); setLeadError(json.error ?? "Não foi possível enviar. Use o formulário de contato."); }
  }

  const quick = ["Quais serviços vocês oferecem?", "Quero um orçamento", "Vocês fazem sites para clubes?"];

  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="rb-chat"
        aria-label={open ? "Fechar atendimento" : "Abrir atendimento"}
        className="fixed bottom-3 right-3 z-50 inline-flex h-14 w-14 md:bottom-5 md:right-5 items-center justify-center rounded-full bg-navy-800 text-white shadow-glow transition hover:scale-105 hover:bg-navy-700">
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-turq-400" aria-hidden />}
      </button>

      {open && (
        <section id="rb-chat" role="dialog" aria-label="Atendimento RB" aria-modal="false"
          className="fixed inset-x-3 bottom-20 z-50 flex md:bottom-24 max-h-[min(640px,calc(100dvh-8rem))] flex-col overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[380px]">
          <header className="flex items-center gap-3 bg-navy-800 px-4 py-3 text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-turq-400/20 text-turq-300"><Bot className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{config?.assistantName ?? "Assistente RB"}</p>
              <p className="text-xs text-white/60">{config?.enabled ? "Assistente virtual · responde na hora" : "Atendimento RB"}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="rounded-full p-1.5 hover:bg-white/10"><X className="h-4 w-4" /></button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-mist-50 px-4 py-4" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex gap-2", m.role === "user" && "justify-end")}>
                {m.role === "assistant" && <Bot className="mt-1 h-4 w-4 shrink-0 text-teal-500" aria-hidden />}
                <p className={cn("max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user" ? "rounded-br-sm bg-navy-800 text-white" : "rounded-bl-sm border border-mist-200 bg-white text-navy-800")}>
                  <span className="sr-only">{m.role === "user" ? "Você: " : "Assistente: "}</span>{m.content}
                </p>
              </div>
            ))}
            {busy && <div className="flex items-center gap-2 text-xs text-mist-600"><Loader2 className="h-3.5 w-3.5 animate-spin" /> digitando…</div>}

            {msgs.length <= 1 && config?.enabled && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quick.map((q) => <button key={q} type="button" onClick={() => send(q)} className="rounded-full border border-turq-300 bg-white px-3 py-1.5 text-xs text-teal-600 hover:bg-turq-50">{q}</button>)}
              </div>
            )}

            {showLead && leadState !== "done" && (
              <form onSubmit={submitLead} className="space-y-2 rounded-xl border border-mist-200 bg-white p-3">
                <p className="text-sm font-semibold">Deixe seu contato para a equipe da RB</p>
                <input name="name" required minLength={2} placeholder="Seu nome" className="input py-2" aria-label="Seu nome" />
                <input name="contact" required minLength={5} placeholder="WhatsApp ou e-mail" className="input py-2" aria-label="WhatsApp ou e-mail" />
                <input name="interest" placeholder="Serviço de interesse (opcional)" className="input py-2" aria-label="Serviço de interesse" />
                <label className="flex items-start gap-2 text-xs text-mist-600">
                  <input type="checkbox" name="consent" required className="mt-0.5 accent-teal-500" />
                  <span>Autorizo o uso destes dados para retorno, conforme a <Link href="/privacidade" className="underline">Política de Privacidade</Link>.</span>
                </label>
                {leadError && <p role="alert" className="text-xs text-red-500">{leadError}</p>}
                <button type="submit" disabled={leadState === "sending"} className="btn-primary w-full py-2">{leadState === "sending" ? "Enviando…" : "Enviar contato"}</button>
              </form>
            )}
          </div>

          <div className="border-t border-mist-200 bg-white p-3">
            <div className="mb-2 flex gap-2">
              {leadState !== "done" && (
                <button type="button" onClick={() => setShowLead((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full bg-mist-100 px-3 py-1.5 text-xs font-medium hover:bg-turq-50">
                  <UserRound className="h-3.5 w-3.5" /> Deixar meu contato
                </button>
              )}
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-mist-100 px-3 py-1.5 text-xs font-medium hover:bg-turq-50">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              )}
            </div>
            {config?.enabled && (
              <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
                <label htmlFor="rb-chat-input" className="sr-only">Sua mensagem</label>
                <input id="rb-chat-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={1500}
                  placeholder="Escreva sua dúvida…" className="input flex-1" autoComplete="off" />
                <button type="submit" disabled={busy || !input.trim()} aria-label="Enviar" className="btn-dark h-11 w-11 shrink-0 px-0"><Send className="h-4 w-4" /></button>
              </form>
            )}
            <p className="mt-2 text-[11px] leading-snug text-mist-400">Assistente com IA: pode cometer erros. Não envie dados sensíveis.</p>
          </div>
        </section>
      )}
    </>
  );
}
