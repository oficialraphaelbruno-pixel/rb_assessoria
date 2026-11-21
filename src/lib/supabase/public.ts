import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export const CONTENT_TAG = "content";

/**
 * Cliente anônimo para páginas públicas. As respostas ficam em cache
 * (tag "content") e são invalidadas pelo painel ao publicar — o site
 * atualiza sem novo deploy.
 */
export function createPublicClient() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { tags: [CONTENT_TAG], revalidate: 3600 } }),
    },
  });
}
