import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { BotTester } from "@/components/admin/chat-admin";

export default async function TestBotPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Testar o bot" back={{ href: "/admin/chatbot", label: "Chatbot" }} description="Usa a configuração e a base de conhecimento atuais, mesmo com o bot desativado no site. O consumo do teste entra no controle de custos." />
      <BotTester />
    </>
  );
}
