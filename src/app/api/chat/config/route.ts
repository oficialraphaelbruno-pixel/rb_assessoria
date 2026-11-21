import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadChatSettings } from "@/lib/ai/engine";

export const revalidate = 60;

/** Dados públicos do widget (nunca expõe regras, tom ou configuração interna). */
export async function GET() {
  const admin = createAdminClient();
  const s = admin ? await loadChatSettings(admin) : null;
  return NextResponse.json({
    enabled: !!s?.enabled,
    assistantName: s?.assistant_name ?? "Assistente RB",
    welcome: s?.welcome_message ?? "Olá! Como podemos ajudar?",
  });
}
