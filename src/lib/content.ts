import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { Faq, PortfolioClient, Plan, Service } from "@/lib/types";
import { DEFAULT_SETTINGS, type SettingsMap, type SettingKey } from "@/lib/settings-defaults";

/** Em modo de pré-visualização (painel), lê rascunhos com a sessão do admin. */
async function getReader() {
  const preview = (await draftMode()).isEnabled;
  return { preview, db: preview ? await createClient() : createPublicClient() };
}

export const getSettings = cache(async (): Promise<SettingsMap> => {
  const { preview, db } = await getReader();
  const cols = preview ? "key, draft, published" : "key, published";
  const { data, error } = await db.from("site_settings").select(cols);
  const merged = structuredClone(DEFAULT_SETTINGS) as SettingsMap;
  if (error || !data) return merged;
  for (const row of data as unknown as { key: SettingKey; draft?: object; published: object }[]) {
    if (!(row.key in merged)) continue;
    const value = preview ? row.draft ?? row.published : row.published;
    (merged as Record<string, object>)[row.key] = { ...(merged[row.key] as object), ...(value as object) };
  }
  return merged;
});

export const getServices = cache(async (): Promise<Service[]> => {
  const { preview, db } = await getReader();
  let q = db.from("services").select("*").order("sort_order");
  if (!preview) q = q.eq("status", "published");
  const { data } = await q;
  return (data as Service[]) ?? [];
});

export const getService = cache(async (slug: string): Promise<Service | null> => {
  const list = await getServices();
  return list.find((s) => s.slug === slug && s.has_page) ?? null;
});

export const getPlans = cache(async (): Promise<Plan[]> => {
  const { preview, db } = await getReader();
  let q = db.from("plans").select("*").order("sort_order");
  if (!preview) q = q.eq("status", "published");
  const { data } = await q;
  return (data as Plan[]) ?? [];
});

export const getFaqs = cache(async (): Promise<Faq[]> => {
  const { preview, db } = await getReader();
  let q = db.from("faqs").select("*").order("sort_order");
  if (!preview) q = q.eq("status", "published");
  const { data } = await q;
  return (data as Faq[]) ?? [];
});

export const getPortfolio = cache(async (): Promise<PortfolioClient[]> => {
  const { preview, db } = await getReader();
  let q = db.from("portfolio_clients").select("*").order("sort_order").order("created_at", { ascending: false });
  if (!preview) q = q.eq("status", "published");
  const { data } = await q;
  return (data as PortfolioClient[]) ?? [];
});

export const getPortfolioClient = cache(async (slug: string) => {
  const list = await getPortfolio();
  return list.find((c) => c.slug === slug) ?? null;
});
