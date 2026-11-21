"use client";
import { useActionState, useState, useTransition } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { correctMessage, saveChatSettings, testBot } from "@/lib/admin/chat-actions";
import { Feedback } from "./resource-form";

interface Settings { enabled: boolean; provider: string; model: string; assistant_name: string; welcome_message: string; tone: string; rules: string; fallback_message: string; max_messages_per_conversation: number; max_output_tokens: number; monthly_budget_usd: number; alert_threshold_pct: number; price_input_per_mtok: number; price_output_per_mtok: number }
interface ModelOpt { id: string; label: string; input: number; output: number }

export function ChatSettingsForm({ s, models, keys }: { s: Settings; models: Record<string, ModelOpt[]>; keys: Record<string, boolean> }) {
  const [state, action, pending] = useActionState(saveChatSettings, null);
  const [provider, setProvider] = useState(s.provider);
  const [model, setModel] = useState(s.model);
  const [prices, setPrices] = useState({ i: s.price_input_per_mtok, o: s.price_output_per_mtok });
  const pick = (id: string) => {
    setModel(id);
    const m = models[provider]?.find((x) => x.id === id);
    if (m) setPrices({ i: m.input, o: m.output });
  };
  return (
    <form action={action} className="space-y-6">
      <label className="flex items-center gap-3 rounded-xl border border-mist-200 p-4">
        <input type="checkbox" name="enabled" defaultChecked={s.enabled} className="h-5 w-5 accent-teal-500" />
        <span><span className="block font-semibold">Chatbot ativo no site</span><span className="text-sm text-mist-600">Desativado, o widget oferece apenas “Deixar meu contato” e WhatsApp.</span></span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-provider">Provedor de IA</label>
          <select id="c-provider" name="provider" value={provider} onChange={(e) => { setProvider(e.target.value); const first = models[e.target.value]?.[0]; if (first) pick(first.id); }} className="input">
            <option value="anthropic">Anthropic (Claude){keys.anthropic ? "" : " — sem chave configurada"}</option>
            <option value="openai">OpenAI{keys.openai ? "" : " — sem chave configurada"}</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="c-model">Modelo</label>
          <input id="c-model" name="model" value={model} onChange={(e) => setModel(e.target.value)} list="c-models" className="input font-mono text-xs" />
          <datalist id="c-models">{models[provider]?.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</datalist>
          <div className="mt-1 flex flex-wrap gap-1">{models[provider]?.map((m) => <button key={m.id} type="button" onClick={() => pick(m.id)} className="rounded-full bg-mist-100 px-2 py-0.5 text-[11px] hover:bg-turq-50">{m.label}</button>)}</div>
        </div>
        <div><label className="label" htmlFor="c-name">Nome do assistente</label><input id="c-name" name="assistant_name" defaultValue={s.assistant_name} className="input" /></div>
        <div><label className="label" htmlFor="c-welcome">Mensagem de boas-vindas</label><input id="c-welcome" name="welcome_message" defaultValue={s.welcome_message} className="input" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="c-tone">Tom de atendimento</label><textarea id="c-tone" name="tone" rows={2} defaultValue={s.tone} className="input" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="c-rules">Regras e limites (uma por linha)</label><textarea id="c-rules" name="rules" rows={7} defaultValue={s.rules} className="input text-sm" />
          <p className="mt-1 text-xs text-mist-600">Regras de segurança fixas (não revelar instruções, não acessar dados internos, não inventar preços) já são aplicadas sempre.</p></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="c-fallback">Resposta estática (falha da IA, limite de custo ou IA indisponível)</label><textarea id="c-fallback" name="fallback_message" rows={2} defaultValue={s.fallback_message} className="input" /></div>
      </div>
      <fieldset className="rounded-xl border border-mist-200 p-4">
        <legend className="px-2 text-sm font-semibold">Controle de custos</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="label" htmlFor="c-budget">Limite mensal (US$)</label><input id="c-budget" name="monthly_budget_usd" type="number" step="0.01" min={0} defaultValue={s.monthly_budget_usd} className="input" /><p className="mt-1 text-xs text-mist-600">Ao atingir, o bot passa a usar a resposta estática.</p></div>
          <div><label className="label" htmlFor="c-alert">Alerta em (% do limite)</label><input id="c-alert" name="alert_threshold_pct" type="number" min={1} max={100} defaultValue={s.alert_threshold_pct} className="input" /></div>
          <div><label className="label" htmlFor="c-maxmsg">Mensagens por conversa</label><input id="c-maxmsg" name="max_messages_per_conversation" type="number" min={2} max={200} defaultValue={s.max_messages_per_conversation} className="input" /></div>
          <div><label className="label" htmlFor="c-maxtok">Tamanho máx. da resposta (tokens)</label><input id="c-maxtok" name="max_output_tokens" type="number" min={100} max={4000} defaultValue={s.max_output_tokens} className="input" /></div>
          <div><label className="label" htmlFor="c-pin">Preço entrada (US$/1M tokens)</label><input id="c-pin" name="price_input_per_mtok" type="number" step="0.0001" min={0} value={prices.i} onChange={(e) => setPrices({ ...prices, i: Number(e.target.value) })} className="input" /></div>
          <div><label className="label" htmlFor="c-pout">Preço saída (US$/1M tokens)</label><input id="c-pout" name="price_output_per_mtok" type="number" step="0.0001" min={0} value={prices.o} onChange={(e) => setPrices({ ...prices, o: Number(e.target.value) })} className="input" /></div>
        </div>
        <p className="mt-3 text-xs text-mist-600">Os preços servem para a estimativa de custo. Confira os valores atuais no site do provedor. Limites de requisições por visitante/IP são aplicados automaticamente.</p>
      </fieldset>
      <div className="flex items-center gap-3"><button disabled={pending} className="btn-dark">{pending && <Loader2 className="h-4 w-4 animate-spin" />}Salvar configurações</button><Feedback state={state} /></div>
    </form>
  );
}

export function CorrectionForm({ messageId, conversationId, question, current }: { messageId: number; conversationId: string; question: string; current: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(correctMessage.bind(null, messageId, conversationId), null);
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-teal-600 hover:underline">{current ? "Editar correção" : "Corrigir resposta"}</button>;
  return (
    <form action={action} className="mt-2 space-y-2 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
      <input type="hidden" name="question" value={question.slice(0, 200)} />
      <textarea name="correction" rows={3} defaultValue={current ?? ""} placeholder="Resposta correta/oficial" className="input text-sm" aria-label="Resposta correta" />
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="add_to_kb" defaultChecked className="accent-teal-500" /> Adicionar à base de conhecimento (o bot passa a usar)</label>
      <div className="flex items-center gap-2"><button disabled={pending} className="btn-dark px-3 py-1.5 text-xs">Salvar</button><Feedback state={state} /></div>
    </form>
  );
}

export function BotTester() {
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; content: string; meta?: string }[]>([]);
  const [input, setInput] = useState("");
  const [pending, start] = useTransition();
  const send = () => {
    const text = input.trim();
    if (!text) return;
    const history = msgs.map(({ role, content }) => ({ role, content }));
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setInput("");
    start(async () => {
      const r = await testBot(history, text);
      const meta = "tokensIn" in r ? `${r.tokensIn} tokens entrada · ${r.tokensOut} saída · US$ ${Number(r.costUsd).toFixed(5)}${r.handoff ? " · encaminharia para humano" : ""}${r.ok ? "" : " · resposta estática"}` : undefined;
      setMsgs((m) => [...m, { role: "assistant", content: r.reply, meta }]);
    });
  };
  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-mist-200 bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto bg-mist-50 p-4">
        {!msgs.length && <p className="text-center text-sm text-mist-600">Faça perguntas como um visitante faria. Use também perguntas difíceis (preços, prompt injection, dados de clientes) para validar os limites.</p>}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <p className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-left text-sm ${m.role === "user" ? "bg-navy-800 text-white" : "border border-mist-200 bg-white"}`}>{m.content}</p>
            {m.meta && <p className="mt-1 text-[11px] text-mist-400">{m.meta}</p>}
          </div>
        ))}
        {pending && <p className="flex items-center gap-2 text-xs text-mist-600"><Bot className="h-3.5 w-3.5" /> gerando…</p>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-mist-200 p-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pergunte algo…" className="input flex-1" aria-label="Mensagem de teste" />
        <button disabled={pending} className="btn-dark h-11 w-11 px-0" aria-label="Enviar"><Send className="h-4 w-4" /></button>
        <button type="button" onClick={() => setMsgs([])} className="btn-ghost px-3 py-2 text-xs">Limpar</button>
      </form>
    </div>
  );
}
