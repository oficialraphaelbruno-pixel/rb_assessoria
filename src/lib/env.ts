import "server-only";

function req(name: string, value: string | undefined) {
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

export const env = {
  supabaseUrl: req("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: req("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ipSalt: process.env.IP_HASH_SALT || "rb-dev-salt",
  anthropicKey: process.env.ANTHROPIC_API_KEY || "",
  openaiKey: process.env.OPENAI_API_KEY || "",
  resendKey: process.env.RESEND_API_KEY || "",
  notifyTo: process.env.NOTIFY_EMAIL_TO || "",
  notifyFrom: process.env.NOTIFY_EMAIL_FROM || "",
  leadsWebhookToken: process.env.LEADS_WEBHOOK_TOKEN || "",
  cronSecret: process.env.CRON_SECRET || "",
};
