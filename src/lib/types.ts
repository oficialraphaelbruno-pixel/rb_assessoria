export type Status = "draft" | "published";

export interface Feature { title: string; text: string }
export interface LinkItem { label: string; url: string }
export interface GalleryItem { url: string; alt?: string }
export interface Metric { value: string; label: string }

export interface Service {
  id: string; slug: string; title: string; eyebrow: string | null; summary: string; description: string;
  features: Feature[]; deliverables: string[]; icon: string; cover_url: string | null; cta_label: string | null;
  seo_title: string | null; seo_description: string | null; show_on_home: boolean; has_page: boolean;
  sort_order: number; status: Status;
}

export interface Plan {
  id: string; product: string; name: string; tagline: string | null; price_cents: number | null;
  setup_cents: number | null; billing_period: "mensal" | "anual" | "unico"; features: string[];
  highlighted: boolean; cta_label: string | null; sort_order: number; status: Status;
}

export interface Faq { id: string; question: string; answer: string; category: string; show_on_home: boolean; sort_order: number; status: Status }

export interface PortfolioClient {
  id: string; slug: string; name: string; segment: string | null; category: string; logo_url: string | null;
  cover_url: string | null; gallery: GalleryItem[]; summary: string; description: string; services: string[];
  metrics: Metric[]; metrics_source: string | null; instagram_url: string | null; website_url: string | null;
  extra_links: LinkItem[]; featured: boolean; sort_order: number; status: Status; created_at: string;
}

export type Json = Record<string, unknown>;
