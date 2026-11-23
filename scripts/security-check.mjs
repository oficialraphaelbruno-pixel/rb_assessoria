// Verificação de segurança com a CHAVE PÚBLICA (o que qualquer visitante possui).
// Uso: node --env-file=.env.local scripts/security-check.mjs
// Nada aqui grava dados válidos: todas as tentativas de escrita devem FALHAR.
import { createClient } from "@supabase/supabase-js";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
let pass = 0, fail = 0;
const ok = (cond, msg) => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); };
// Garante que a rede funciona: sem isso, erros de conexão seriam contados como "bloqueado" (falso positivo).
{
  const { error } = await db.from("services").select("id").limit(1);
  if (error) { console.error("ERRO: não foi possível conectar ao Supabase (" + error.message + "). Testes abortados."); process.exit(2); }
}

const PRIVATE = ["leads", "lead_activities", "crm_clients", "client_history", "projects", "fin_categories", "fin_transactions",
  "bank_statement_lines", "chat_settings", "knowledge_items", "chat_conversations", "chat_messages", "notifications",
  "integrations", "rate_limits", "audit_log", "content_revisions", "documents", "profiles", "v_fin_transactions", "v_ai_usage_monthly"];
for (const t of PRIVATE) {
  const { data, error } = await db.from(t).select("*").limit(1);
  ok(error || (data ?? []).length === 0, `leitura anônima bloqueada: ${t}`);
}

for (const t of ["services", "plans", "faqs", "portfolio_clients", "testimonials"]) {
  const { data } = await db.from(t).select("status");
  ok((data ?? []).every((r) => r.status === "published"), `anônimo só vê publicados: ${t} (${(data ?? []).length} itens)`);
}
{
  const { error } = await db.from("site_settings").select("draft").limit(1);
  ok(!!error, "rascunhos (site_settings.draft) invisíveis para anônimos");
}

const writes = [
  ["insert leads", () => db.from("leads").insert({ name: "x", email: "x@x.com" })],
  ["insert crm_clients", () => db.from("crm_clients").insert({ name: "x" })],
  ["insert fin_transactions", () => db.from("fin_transactions").insert({ kind: "receita", description: "x", amount_cents: 1, due_date: "2026-01-01" })],
  ["update site_settings", () => db.from("site_settings").update({ label: "hack" }).eq("key", "hero").select()],
  ["update services", () => db.from("services").update({ title: "hack" }).eq("slug", "sites").select()],
  ["delete faqs", () => db.from("faqs").delete().neq("id", "00000000-0000-0000-0000-000000000000").select()],
  ["update profiles (escalar papel)", () => db.from("profiles").update({ role: "admin" }).neq("id", "00000000-0000-0000-0000-000000000000").select()],
  ["insert chat_settings", () => db.from("chat_settings").update({ enabled: true }).eq("id", 1).select()],
];
for (const [name, fn] of writes) {
  const { data, error } = await fn();
  ok(error || (Array.isArray(data) && data.length === 0), `escrita anônima bloqueada: ${name}`);
}

for (const [fn, args] of [["search_knowledge", { p_query: "preço" }], ["hit_rate_limit", { p_bucket: "x", p_limit: 1, p_window_seconds: 60 }], ["request_ip_hash", {}], ["handle_new_user", {}], ["current_role_name", {}]]) {
  const { error } = await db.rpc(fn, args);
  ok(!!error, `função interna não executável por anônimos: ${fn}`);
}
{
  const { data } = await db.rpc("is_admin");
  ok(data === false, "is_admin() retorna false para anônimo");
}

for (const [label, args] of [
  ["sem consentimento", { p_name: "Teste", p_email: "t@t.com", p_phone: "", p_company: "", p_service: "", p_message: "", p_consent: false }],
  ["e-mail inválido", { p_name: "Teste", p_email: "nao-e-email", p_phone: "", p_company: "", p_service: "", p_message: "", p_consent: true }],
  ["nome vazio", { p_name: "", p_email: "t@t.com", p_phone: "", p_company: "", p_service: "", p_message: "", p_consent: true }],
  ["mensagem gigante", { p_name: "Teste", p_email: "t@t.com", p_phone: "", p_company: "", p_service: "", p_message: "a".repeat(5000), p_consent: true }],
]) {
  const { error } = await db.rpc("submit_lead", args);
  ok(!!error, `formulário público rejeita: ${label}`);
}

const png = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" });
{
  const { error } = await db.storage.from("media").upload(`teste/${Date.now()}.png`, png);
  ok(!!error, "upload anônimo bloqueado no bucket media");
}
{
  const { error } = await db.storage.from("documents").upload(`teste/${Date.now()}.pdf`, png);
  ok(!!error, "upload anônimo bloqueado no bucket documents");
  const { data } = await db.storage.from("documents").list("", { limit: 5 });
  ok((data ?? []).length === 0, "listagem anônima do bucket privado documents vazia");
}
{
  const svg = new Blob(["<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>"], { type: "image/svg+xml" });
  const { error } = await db.storage.from("media").upload(`x/${Date.now()}.svg`, svg);
  ok(!!error, "SVG (vetor de XSS) recusado no bucket media");
}

console.log(`\n${pass} passaram, ${fail} falharam`);
process.exit(fail ? 1 : 0);
