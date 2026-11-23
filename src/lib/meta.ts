import "server-only";
import { env } from "@/lib/env";

export const META_PRESETS = { "7": "last_7d", "30": "last_30d", "90": "last_90d", mes: "this_month", "mes-passado": "last_month" } as const;
export type MetaPreset = keyof typeof META_PRESETS;

export interface CampaignInsight {
  campaign_id: string; campaign_name: string; spend: number; impressions: number; reach: number; clicks: number;
  ctr: number; cpc: number; cpm: number; leads: number; link_clicks: number;
}

const LEAD_ACTIONS = ["lead", "onsite_conversion.lead_grouped", "offsite_conversion.fb_pixel_lead", "onsite_conversion.messaging_conversation_started_7d"];

export function metaConfigured() {
  return !!env.metaToken && !!env.metaAdAccountId;
}

/** Leitura (somente) dos resultados das campanhas via Marketing API da Meta. Cache de 15 minutos. */
export async function getCampaignInsights(preset: MetaPreset): Promise<{ data: CampaignInsight[]; currency?: string; error?: string }> {
  if (!metaConfigured()) return { data: [], error: "not_configured" };
  const base = `https://graph.facebook.com/${env.metaGraphVersion}/act_${env.metaAdAccountId}`;
  const params = new URLSearchParams({
    level: "campaign", date_preset: META_PRESETS[preset], limit: "100",
    fields: "campaign_id,campaign_name,spend,impressions,reach,clicks,ctr,cpc,cpm,actions,inline_link_clicks",
  });
  try {
    const [res, acc] = await Promise.all([
      fetch(`${base}/insights?${params}`, { headers: { Authorization: `Bearer ${env.metaToken}` }, next: { revalidate: 900, tags: ["meta-insights"] } }),
      fetch(`${base}?fields=currency,name`, { headers: { Authorization: `Bearer ${env.metaToken}` }, next: { revalidate: 3600 } }),
    ]);
    const json = await res.json();
    if (!res.ok) return { data: [], error: json?.error?.message ?? `Erro ${res.status}` };
    const account = acc.ok ? await acc.json() : {};
    const num = (v: unknown) => Number(v ?? 0) || 0;
    const data: CampaignInsight[] = (json.data ?? []).map((r: Record<string, unknown>) => {
      const actions = (r.actions as { action_type: string; value: string }[] | undefined) ?? [];
      return {
        campaign_id: String(r.campaign_id), campaign_name: String(r.campaign_name ?? "Campanha"),
        spend: num(r.spend), impressions: num(r.impressions), reach: num(r.reach), clicks: num(r.clicks),
        ctr: num(r.ctr), cpc: num(r.cpc), cpm: num(r.cpm), link_clicks: num(r.inline_link_clicks),
        leads: actions.filter((a) => LEAD_ACTIONS.includes(a.action_type)).reduce((s, a) => s + num(a.value), 0),
      };
    }).sort((a: CampaignInsight, b: CampaignInsight) => b.spend - a.spend);
    return { data, currency: account.currency };
  } catch (e) {
    return { data: [], error: (e as Error).message };
  }
}
