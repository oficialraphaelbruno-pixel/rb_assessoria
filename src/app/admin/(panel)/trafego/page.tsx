import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { Stat } from "@/components/admin/stat";
import { SingleBarChart } from "@/components/admin/charts";
import { getCampaignInsights, metaConfigured, META_PRESETS, type MetaPreset } from "@/lib/meta";
import { getSettings } from "@/lib/content";

const LABEL: Record<MetaPreset, string> = { "7": "7 dias", "30": "30 dias", "90": "90 dias", mes: "Este mês", "mes-passado": "Mês passado" };
const DAYS: Record<MetaPreset, number> = { "7": 7, "30": 30, "90": 90, mes: 31, "mes-passado": 62 };

export default async function TrafficPage({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  await requireAdmin();
  const { periodo = "30" } = await searchParams;
  const preset = (periodo in META_PRESETS ? periodo : "30") as MetaPreset;
  const configured = metaConfigured();
  const [insights, settings] = await Promise.all([getCampaignInsights(preset), getSettings()]);
  const cur = insights.currency ?? "BRL";
  const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: cur });
  const t = insights.data.reduce((a, c) => ({ spend: a.spend + c.spend, impressions: a.impressions + c.impressions, reach: a.reach + c.reach, clicks: a.clicks + c.clicks, link: a.link + c.link_clicks, leads: a.leads + c.leads }), { spend: 0, impressions: 0, reach: 0, clicks: 0, link: 0, leads: 0 });

  // leads que chegaram ao site vindos de anúncios Meta (pelos UTMs ou origem)
  const db = await createClient();
  const since = new Date(Date.now() - DAYS[preset] * 864e5).toISOString();
  const { data: siteLeads } = await db.from("leads").select("source, utm, stage").gte("created_at", since);
  const fromMeta = (siteLeads ?? []).filter((l) => {
    const u = (l.utm ?? {}) as Record<string, string>;
    return l.source === "meta_ads" || !!u.fbclid || /facebook|instagram|meta|fb|ig/i.test(u.utm_source ?? "");
  });
  const byCampaign = new Map<string, number>();
  fromMeta.forEach((l) => { const c = ((l.utm ?? {}) as Record<string, string>).utm_campaign || "Sem campanha (UTM)"; byCampaign.set(c, (byCampaign.get(c) ?? 0) + 1); });
  const won = fromMeta.filter((l) => l.stage === "fechado").length;

  return (
    <>
      <PageHeader title="Tráfego pago (Meta Ads)" description="Resultados das campanhas do Facebook/Instagram lidos direto da sua conta de anúncios, cruzados com os leads que chegaram ao site."
        actions={<div className="flex flex-wrap gap-1">{(Object.keys(LABEL) as MetaPreset[]).map((p) => (
          <Link key={p} href={`?periodo=${p}`} className={`rounded-lg px-3 py-2 text-sm ${preset === p ? "bg-navy-800 text-white" : "bg-white"}`}>{LABEL[p]}</Link>))}</div>} />

      {!configured ? (
        <Panel title="Conectar a conta de anúncios da Meta">
          <p className="text-sm text-mist-600">Esta área mostra investimento, alcance, cliques, custo por clique e leads de cada campanha. Para ativar, configure duas variáveis na Vercel (passo a passo no manual <code>docs/META-ADS.md</code>):</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-mist-600">
            <li><code>META_AD_ACCOUNT_ID</code> — ID da conta de anúncios (números, sem “act_”).</li>
            <li><code>META_ADS_ACCESS_TOKEN</code> — token de acesso de um <em>usuário do sistema</em> com permissão <code>ads_read</code>.</li>
          </ul>
          <p className="mt-3 text-sm text-mist-600">Enquanto isso, os leads vindos de anúncios já são identificados pelos UTMs (abaixo).</p>
        </Panel>
      ) : insights.error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><strong>Não foi possível ler a conta da Meta:</strong> {insights.error}. Verifique se o token não expirou e tem a permissão ads_read.</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Investimento" value={money(t.spend)} tone="dark" hint={LABEL[preset]} />
            <Stat label="Alcance / impressões" value={t.reach.toLocaleString("pt-BR")} hint={`${t.impressions.toLocaleString("pt-BR")} impressões · CPM ${money(t.impressions ? (t.spend / t.impressions) * 1000 : 0)}`} />
            <Stat label="Cliques" value={t.clicks.toLocaleString("pt-BR")} hint={`CTR ${t.impressions ? ((t.clicks / t.impressions) * 100).toFixed(2) : "0"}% · CPC ${money(t.clicks ? t.spend / t.clicks : 0)}`} />
            <Stat label="Leads (Meta)" value={t.leads.toLocaleString("pt-BR")} hint={t.leads ? `Custo por lead ${money(t.spend / t.leads)}` : "Sem conversões registradas"} />
          </div>
          <Panel title="Campanhas" className="mt-6">
            <div className="-mx-6 overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-y border-mist-200 bg-mist-50 text-xs uppercase text-mist-600"><tr>
                  <th className="px-6 py-3">Campanha</th><th className="px-6 py-3 text-right">Investido</th><th className="px-6 py-3 text-right">Impressões</th><th className="px-6 py-3 text-right">Cliques</th><th className="px-6 py-3 text-right">CTR</th><th className="px-6 py-3 text-right">CPC</th><th className="px-6 py-3 text-right">Leads</th><th className="px-6 py-3 text-right">Custo/lead</th>
                </tr></thead>
                <tbody className="divide-y divide-mist-100">
                  {insights.data.map((c) => (
                    <tr key={c.campaign_id}>
                      <td className="px-6 py-3 font-medium">{c.campaign_name}</td>
                      <td className="px-6 py-3 text-right">{money(c.spend)}</td>
                      <td className="px-6 py-3 text-right">{c.impressions.toLocaleString("pt-BR")}</td>
                      <td className="px-6 py-3 text-right">{c.clicks.toLocaleString("pt-BR")}</td>
                      <td className="px-6 py-3 text-right">{c.ctr.toFixed(2)}%</td>
                      <td className="px-6 py-3 text-right">{money(c.cpc)}</td>
                      <td className="px-6 py-3 text-right">{c.leads}</td>
                      <td className="px-6 py-3 text-right">{c.leads ? money(c.spend / c.leads) : "—"}</td>
                    </tr>
                  ))}
                  {!insights.data.length && <tr><td colSpan={8} className="px-6 py-10 text-center text-mist-600">Nenhuma campanha com veiculação no período.</td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Leads no site vindos da Meta">
          <p className="font-display text-3xl font-bold text-navy-800">{fromMeta.length}</p>
          <p className="mt-1 text-sm text-mist-600">{won} viraram cliente{configured && t.spend && fromMeta.length ? ` · custo por lead no site ${money(t.spend / fromMeta.length)}` : ""}</p>
          <p className="mt-4 text-xs text-mist-600">Identificados por UTM (<code>utm_source=facebook/instagram</code>) ou pelo parâmetro <code>fbclid</code> dos anúncios.</p>
        </Panel>
        <Panel title="Leads do site por campanha (UTM)" className="lg:col-span-2">
          <SingleBarChart data={[...byCampaign.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)} label="Leads" horizontal />
        </Panel>
      </div>

      <Panel title="Rastreamento no site" className="mt-6">
        <ul className="space-y-1.5 text-sm text-mist-600">
          <li>Meta Pixel: {settings.analytics.meta_pixel_id ? <span className="text-emerald-700">configurado ({settings.analytics.meta_pixel_id})</span> : <><span className="text-amber-700">não configurado</span> — <Link className="underline" href="/admin/conteudo/analytics">informar o ID do Pixel</Link></>}. O evento <code>Lead</code> é enviado quando alguém envia o formulário.</li>
          <li>Nos anúncios, use links com UTM, por exemplo: <code>?utm_source=instagram&amp;utm_medium=paid&amp;utm_campaign=nome-da-campanha</code>.</li>
        </ul>
      </Panel>
    </>
  );
}
