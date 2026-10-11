import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../env";
import { hardened } from "../cookies";

// Cliente sem sessão e sem cookies: usado para recuperação de senha e auditoria (nunca guarda tokens).
export const anonClient = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });

export async function serverClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => { try { list.forEach(({ name, value, options }) => store.set(name, value, hardened(options))); } catch { /* chamado de componente de leitura */ } },
    },
  });
}

// Confere no servidor, a cada ação: sessão válida E papel de administrador (app_metadata não pode ser alterado pelo usuário).
export async function requireAdmin() {
  const sb = await serverClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") throw new Error("nao autorizado");
  return { sb, user };
}
