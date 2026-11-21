import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/page-header";
import { MediaLibrary } from "@/components/admin/media-library";
import type { MediaRow } from "@/components/admin/upload";

export default async function MediaPage() {
  await requireStaff();
  const db = await createClient();
  const { data } = await db.from("media").select("*").order("created_at", { ascending: false }).limit(1000);
  return (
    <>
      <PageHeader title="Biblioteca de mídia" description="Logos, fotos de clientes, banners e imagens do site. Armazenadas no Supabase Storage." />
      <MediaLibrary initial={(data as MediaRow[]) ?? []} />
    </>
  );
}
