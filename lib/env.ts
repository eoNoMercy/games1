import "server-only";
// Aceita os nomes antigos (NEXT_PUBLIC_*) para não quebrar instalações existentes, mas prefira SUPABASE_*.
export const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
