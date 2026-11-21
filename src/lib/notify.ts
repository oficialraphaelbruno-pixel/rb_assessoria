import "server-only";
import { env } from "@/lib/env";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** E-mail opcional via Resend (só envia se RESEND_API_KEY e NOTIFY_EMAIL_TO estiverem configurados). */
export async function sendAdminEmail(subject: string, rows: Record<string, string | null | undefined>, link?: string) {
  if (!env.resendKey || !env.notifyTo || !env.notifyFrom) return { skipped: true };
  const body = Object.entries(rows).filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#52676e">${esc(k)}</td><td style="padding:4px 0;color:#0d3845">${esc(String(v))}</td></tr>`).join("");
  const html = `<div style="font-family:Arial,sans-serif"><h2 style="color:#0d3845">${esc(subject)}</h2><table>${body}</table>${
    link ? `<p><a href="${esc(env.siteUrl + link)}" style="color:#13a09b">Abrir no painel</a></p>` : ""}</div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.notifyFrom, to: env.notifyTo.split(",").map((s) => s.trim()), subject, html }),
      cache: "no-store",
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
