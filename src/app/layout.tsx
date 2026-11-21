import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, brand, analytics } = await getSettings();
  const base = seo.site_url || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(base),
    title: { default: seo.title || brand.name, template: seo.title_template || `%s | ${brand.name}` },
    description: seo.description,
    keywords: seo.keywords ? seo.keywords.split(",").map((k) => k.trim()) : undefined,
    applicationName: brand.name,
    openGraph: {
      type: "website", locale: "pt_BR", siteName: brand.name, title: seo.title, description: seo.description,
      images: seo.og_image ? [{ url: seo.og_image, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
    icons: { icon: "/favicon.png", apple: "/apple-icon.png" },
    verification: analytics.google_site_verification ? { google: analytics.google_site_verification } : undefined,
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = { themeColor: "#0d3845", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
