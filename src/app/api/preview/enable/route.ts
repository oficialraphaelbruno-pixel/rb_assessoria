import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getStaff } from "@/lib/auth";

/** Ativa a pré-visualização de rascunhos — somente para equipe autenticada. */
export async function GET(req: Request) {
  const staff = await getStaff();
  if (!staff) return new Response("Não autorizado", { status: 401 });
  const path = new URL(req.url).searchParams.get("path") || "/";
  (await draftMode()).enable();
  redirect(path.startsWith("/") && !path.startsWith("//") ? path : "/");
}
