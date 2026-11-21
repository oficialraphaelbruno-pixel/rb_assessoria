import { ResourceListView } from "@/components/admin/resource-views";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <ResourceListView resourceKey="services" searchParams={await searchParams} />;
}
