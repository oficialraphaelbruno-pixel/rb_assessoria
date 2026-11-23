import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = createPublicClient();
  const [{ data: seo }, { data: services }, { data: clients }] = await Promise.all([
    db.from("site_settings").select("published").eq("key", "seo").maybeSingle(),
    db.from("services").select("slug, updated_at").eq("status", "published").eq("has_page", true),
    db.from("portfolio_clients").select("slug, updated_at").eq("status", "published"),
  ]);
  const base = ((seo?.published as { site_url?: string })?.site_url || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const fixed = ["", "/servicos", "/planos", "/clientes-e-projetos", "/quem-esta-por-tras-da-rb", "/clubes-e-escolinhas", "/contato", "/privacidade"];
  return [
    ...fixed.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...(services ?? []).map((s) => ({ url: `${base}/servicos/${s.slug}`, lastModified: s.updated_at, priority: 0.8 })),
    ...(clients ?? []).map((c) => ({ url: `${base}/clientes-e-projetos/${c.slug}`, lastModified: c.updated_at, priority: 0.6 })),
  ];
}
