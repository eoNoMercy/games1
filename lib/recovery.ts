import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

// Nome do cookie fechado (HttpOnly) que prende o link de recuperação ao navegador que o pediu.
export const RECOVERY_COOKIE = "dw_rec";
const KEY = "dw-recovery";

// Cliente do Supabase com armazenamento só em memória (nada vai para cookies por conta própria).
// O "verificador" do PKCE passa por aqui, e quem o guarda no navegador somos nós, de forma controlada.
export function recoveryClient(initialVerifier?: string) {
  const mem = new Map<string, string>();
  if (initialVerifier) mem.set(`${KEY}-code-verifier`, initialVerifier);
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      flowType: "pkce", storageKey: KEY, persistSession: true, autoRefreshToken: false, detectSessionInUrl: false,
      storage: { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, v); }, removeItem: (k: string) => { mem.delete(k); } },
    },
  });
  return { client, verifier: () => mem.get(`${KEY}-code-verifier`) ?? null };
}
