import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Cliente com chave secreta (ignora RLS). Uso exclusivo em rotas de
 * servidor que precisam escrever dados de visitantes (chatbot, webhooks).
 * Retorna null se a chave não estiver configurada.
 */
export function createAdminClient() {
  if (!env.supabaseServiceKey) return null;
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}
