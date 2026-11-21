import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface Staff { id: string; email: string; role: "admin" | "editor"; full_name: string | null }

/** Usuário autenticado com papel de equipe (admin/editor), validado no servidor do Supabase. */
export const getStaff = cache(async (): Promise<Staff | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "admin" && profile.role !== "editor")) return null;
  return { id: user.id, email: user.email ?? "", role: profile.role, full_name: profile.full_name };
});

export async function requireStaff() {
  const s = await getStaff();
  if (!s) redirect("/admin/login");
  return s;
}

export async function requireAdmin() {
  const s = await requireStaff();
  if (s.role !== "admin") redirect("/admin?erro=permissao");
  return s;
}
