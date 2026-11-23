import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { ImportPanel } from "@/components/admin/import-panel";

export default async function ImportLeadsPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Importar planilha de leads" back={{ href: "/admin/leads", label: "Leads" }} description="Cadastre de uma vez contatos de equipes, escolinhas e empresas para prospecção." />
      <ImportPanel kind="leads" templateHref="/admin/leads/modelo" backHref="/admin/leads" />
    </>
  );
}
