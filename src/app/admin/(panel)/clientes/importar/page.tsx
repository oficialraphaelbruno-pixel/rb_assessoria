import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { ImportPanel } from "@/components/admin/import-panel";

export default async function ImportClientsPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Importar planilha de clientes" back={{ href: "/admin/clientes", label: "Clientes (CRM)" }} description="Cadastre de uma vez os clientes ativos, com valor mensal e vencimento." />
      <ImportPanel kind="clientes" templateHref="/admin/clientes/modelo" backHref="/admin/clientes" />
    </>
  );
}
