"use client";
import { useEffect } from "react";

const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
const STORAGE = "rb_attribution";

/** Guarda a origem do primeiro acesso da sessão (UTMs, referrer, página de entrada) para registrar no lead. */
export function Attribution() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE)) return;
      const params = new URLSearchParams(location.search);
      const utm: Record<string, string> = {};
      KEYS.forEach((k) => { const v = params.get(k); if (v) utm[k] = v.slice(0, 200); });
      if (document.referrer && !document.referrer.startsWith(location.origin)) utm.referrer = document.referrer.slice(0, 200);
      sessionStorage.setItem(STORAGE, JSON.stringify({ utm, landing_page: location.pathname.slice(0, 300) }));
    } catch { /* storage indisponível */ }
  }, []);
  return null;
}

export function readAttribution(): { utm: Record<string, string>; landing_page: string } {
  try {
    const raw = sessionStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { utm: {}, landing_page: typeof location !== "undefined" ? location.pathname : "" };
}
