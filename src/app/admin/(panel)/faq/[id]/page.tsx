import { ResourceEditView } from "@/components/admin/resource-views";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ResourceEditView resourceKey="faqs" id={(await params).id} />;
}
