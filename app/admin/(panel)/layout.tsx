import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Painel", robots: { index: false, follow: false } };

// Segunda barreira (além do middleware): confere a sessão de administrador no servidor.
export default async function Layout({ children }: { children: React.ReactNode }) {
  try { await requireAdmin(); } catch { redirect("/admin/login"); }
  return <AdminShell>{children}</AdminShell>;
}
