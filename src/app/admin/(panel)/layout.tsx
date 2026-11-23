import type { Metadata } from "next";
import { Sidebar } from "@/components/admin/sidebar";
import { themeBootScript } from "@/components/admin/theme-script";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Painel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  let unread = 0;
  if (staff.role === "admin") {
    const db = await createClient();
    const { count } = await db.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null);
    unread = count ?? 0;
  }
  return (
    <div className="admin-root min-h-screen bg-mist-50 lg:flex">
      <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      <Sidebar role={staff.role} email={staff.email} unread={unread} />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
