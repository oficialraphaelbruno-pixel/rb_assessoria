import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { env } from "@/lib/env";

export async function clientIp() {
  const h = await headers();
  return (h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
}

export async function ipHash() {
  return createHash("sha256").update(`${env.ipSalt}:${await clientIp()}`).digest("hex");
}

/** Bloqueia POSTs de outras origens (defesa adicional contra CSRF em rotas públicas). */
export async function sameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (!origin) return true; // navegadores sempre enviam em POST cross-site; sem origin = mesma origem/ferramentas
  const host = h.get("x-forwarded-host") || h.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
