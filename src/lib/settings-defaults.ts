/**
 * Esquema dos blocos editáveis do site (tabela site_settings).
 * O painel gera os formulários a partir daqui; o site usa os defaults
 * apenas como rede de segurança caso o banco esteja indisponível.
 */

import type { FieldDef } from "@/lib/admin/fields";
export type { FieldDef };

export interface SettingDef {
  key: string;
  label: string;
  group: "Geral" | "Página inicial" | "Páginas" | "SEO e integrações";
  description?: string;
  fields: FieldDef[];
}

const t = (name: string, label: string, help?: string): FieldDef => ({ name, label, type: "text", help });
const ta = (name: string, label: string, help?: string): FieldDef => ({ name, label, type: "textarea", help });
const url = (name: string, label: string, help?: string): FieldDef => ({ name, label, type: "url", help });
const img = (name: string, label: string, help?: string): FieldDef => ({ name, label, type: "image", help });
const list = (name: string, label: string, help?: string): FieldDef => ({ name, label, type: "list", help });
const bool = (name: string, label: string, help?: string): FieldDef => ({ name, label, type: "boolean", help });
const items = (name: string, label: string, fields: FieldDef[], help?: string): FieldDef => ({ name, label, type: "items", fields, help });

export const SETTINGS_SCHEMA: SettingDef[] = [
  { key: "brand", label: "Marca", group: "Geral", fields: [
    t("name", "Nome da empresa"), t("short_name", "Nome curto"), t("tagline", "Slogan"),
    img("logo_url", "Logomarca", "PNG com fundo transparente."), t("logo_alt", "Texto alternativo da logo"),
  ]},
  { key: "contact", label: "Contato e redes sociais", group: "Geral", fields: [
    t("whatsapp_number", "WhatsApp (somente números, com DDI)", "Ex.: 5531999999999"),
    t("whatsapp_display", "WhatsApp (como exibir)"), ta("whatsapp_message", "Mensagem padrão do WhatsApp"),
    t("email", "E-mail"), t("instagram_handle", "@ do Instagram"), url("instagram_url", "Link do Instagram"),
    url("linkedin_url", "Link do LinkedIn"), t("city", "Cidade/UF"), t("service_area", "Área de atendimento"), t("hours", "Horário de atendimento"),
  ]},
  { key: "hero", label: "Topo da página inicial", group: "Página inicial", fields: [
    t("eyebrow", "Chamada pequena"), ta("title", "Título principal"), ta("subtitle", "Subtítulo"),
    t("primary_cta_label", "Botão principal — texto"), t("primary_cta_href", "Botão principal — link"),
    t("secondary_cta_label", "Botão secundário — texto"), t("secondary_cta_href", "Botão secundário — link"),
    img("image_url", "Imagem de destaque (opcional)"),
  ]},
  { key: "challenge", label: "O desafio", group: "Página inicial", fields: [
    t("eyebrow", "Chamada pequena"), ta("title", "Título"), list("items", "Itens"), ta("closing", "Frase de fechamento"),
  ]},
  { key: "differentials", label: "Diferenciais", group: "Página inicial", fields: [
    t("eyebrow", "Chamada pequena"), ta("title", "Título"),
    items("items", "Diferenciais", [t("title", "Título"), ta("text", "Texto"), t("icon", "Ícone", "handshake, chart, trophy, layers, sparkles, shield, target, zap")]),
  ]},
  { key: "segments", label: "Segmentos atendidos", group: "Página inicial", fields: [
    t("eyebrow", "Chamada pequena"), ta("title", "Título"),
    items("items", "Segmentos", [t("title", "Título"), ta("text", "Texto"), t("icon", "Ícone", "trophy, users, target, zap, handshake, chart, layers, sparkles")]),
  ]},
  { key: "process", label: "Como trabalhamos", group: "Página inicial", fields: [
    t("eyebrow", "Chamada pequena"), ta("title", "Título"), items("steps", "Etapas", [t("title", "Etapa"), ta("text", "Descrição")]),
  ]},
  { key: "saas", label: "Soluções SaaS", group: "Página inicial", fields: [
    t("eyebrow", "Chamada pequena"), ta("title", "Título"), ta("text", "Texto"), t("cta_label", "Botão — texto"), t("cta_href", "Botão — link"),
  ]},
  { key: "about", label: "Sobre a RB", group: "Página inicial", fields: [
    t("eyebrow", "Chamada pequena"), ta("title", "Título"), ta("text", "Texto"), list("pillars", "Pilares"),
  ]},
  { key: "cta_final", label: "Chamada final (contato)", group: "Página inicial", fields: [
    ta("title", "Título"), ta("text", "Texto"), t("button_label", "Texto do botão"),
  ]},
  { key: "home_sections", label: "Seções visíveis na página inicial", group: "Página inicial", fields: [
    bool("challenge", "O desafio"), bool("segments", "Segmentos atendidos"), bool("testimonials", "Depoimentos"), bool("services", "Serviços"), bool("differentials", "Diferenciais"), bool("process", "Como trabalhamos"),
    bool("portfolio", "Portfólio / cases"), bool("clients", "Clientes atendidos (logos)"), bool("saas", "Soluções SaaS"), bool("plans", "Planos"),
    bool("about", "Sobre a RB"), bool("faq", "Perguntas frequentes"), bool("contact", "Formulário de contato"),
  ]},
  { key: "founder", label: "Quem está por trás da RB", group: "Páginas", fields: [
    t("eyebrow", "Chamada pequena"), ta("headline", "Título da página"), t("name", "Nome"), t("role", "Cargo"),
    img("photo_url", "Foto profissional"), t("photo_alt", "Texto alternativo da foto"),
    list("bio", "História (um parágrafo por item)"), ta("quote", "Frase de destaque"), ta("experience", "Experiência"),
    list("specialties", "Especialidades"), list("values", "Valores"), ta("vision", "Visão da empresa"),
    url("instagram_url", "Instagram"), url("linkedin_url", "LinkedIn"),
  ]},
  { key: "clubs", label: "Clubes & Escolinhas", group: "Páginas", fields: [
    t("eyebrow", "Chamada pequena"), ta("title", "Título"), ta("subtitle", "Subtítulo"),
    items("benefits", "Benefícios", [t("title", "Título"), ta("text", "Texto")]), ta("closing", "Fechamento"), t("cta_label", "Botão — texto"),
  ]},
  { key: "plans_page", label: "Página de planos", group: "Páginas", description: "Os planos em si (nome, recursos, preço) são editados em Site → Planos.", fields: [
    t("eyebrow", "Chamada pequena"), ta("title", "Título"), ta("subtitle", "Subtítulo"), ta("note", "Observação abaixo dos planos"),
  ]},
  { key: "privacy", label: "Política de privacidade", group: "Páginas", fields: [
    t("updated_at", "Atualizada em (AAAA-MM-DD)"), t("controller", "Controlador dos dados"), t("contact_email", "E-mail do encarregado/contato"),
    { name: "body", label: "Texto (use ## para subtítulos)", type: "markdown" },
  ]},
  { key: "seo", label: "SEO global", group: "SEO e integrações", fields: [
    url("site_url", "Endereço do site", "Domínio definitivo, ex.: https://rbassessoria.com.br"),
    t("title", "Título padrão"), t("title_template", "Modelo de título", "%s é substituído pelo título da página"),
    ta("description", "Descrição padrão"), img("og_image", "Imagem de compartilhamento (1200×630)"), ta("keywords", "Palavras-chave"),
  ]},
  { key: "analytics", label: "Analytics e verificação", group: "SEO e integrações", description: "Os scripts só são carregados quando um ID é informado.", fields: [
    t("ga4_id", "Google Analytics 4 (G-XXXX)"), t("meta_pixel_id", "Meta Pixel ID"), t("google_site_verification", "Código de verificação do Search Console"),
  ]},
];

export const DEFAULT_SETTINGS = {
  brand: { name: "RB Assessoria & Comunicação", short_name: "RB Assessoria", tagline: "", logo_url: "/brand/logo-rb.png", logo_alt: "RB Assessoria & Comunicação" },
  contact: { whatsapp_number: "", whatsapp_display: "", whatsapp_message: "", email: "", instagram_handle: "", instagram_url: "", linkedin_url: "", city: "", service_area: "", hours: "" },
  hero: { eyebrow: "", title: "RB Assessoria & Comunicação", subtitle: "", primary_cta_label: "Solicitar orçamento", primary_cta_href: "/contato", secondary_cta_label: "", secondary_cta_href: "", image_url: "" },
  challenge: { eyebrow: "", title: "", items: [] as string[], closing: "" },
  differentials: { eyebrow: "", title: "", items: [] as { title: string; text: string; icon?: string }[] },
  process: { eyebrow: "", title: "", steps: [] as { title: string; text: string }[] },
  segments: { eyebrow: "", title: "", items: [] as { title: string; text: string; icon?: string }[] },
  saas: { eyebrow: "", title: "", text: "", cta_label: "", cta_href: "/servicos/sistemas-saas" },
  about: { eyebrow: "", title: "", text: "", pillars: [] as string[] },
  cta_final: { title: "", text: "", button_label: "Enviar" },
  home_sections: { plans: true, challenge: true, segments: true, testimonials: true, services: true, differentials: true, process: true, portfolio: true, clients: true, saas: true, about: true, faq: true, contact: true },
  founder: { eyebrow: "", headline: "", name: "", role: "", photo_url: "", photo_alt: "", bio: [] as string[], quote: "", experience: "", specialties: [] as string[], values: [] as string[], vision: "", instagram_url: "", linkedin_url: "" },
  clubs: { eyebrow: "", title: "", subtitle: "", benefits: [] as { title: string; text: string }[], closing: "", cta_label: "Solicitar orçamento" },
  plans_page: { eyebrow: "Planos", title: "Planos", subtitle: "", note: "" },
  privacy: { updated_at: "", controller: "", contact_email: "", body: "" },
  seo: { site_url: "", title: "RB Assessoria & Comunicação", title_template: "%s | RB Assessoria & Comunicação", description: "", og_image: "", keywords: "" },
  analytics: { ga4_id: "", meta_pixel_id: "", google_site_verification: "" },
};

export type SettingsMap = typeof DEFAULT_SETTINGS;
export type SettingKey = keyof SettingsMap;
