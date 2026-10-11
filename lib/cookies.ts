import type { CookieOptions } from "@supabase/ssr";
// Cookies de sessão do painel: invisíveis ao JavaScript, só HTTPS em produção, só enviados pelo próprio site e só em /admin.
export const hardened = (o: CookieOptions = {}): CookieOptions => ({
  ...o,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/admin",
  ...(o.maxAge === 0 ? {} : { maxAge: 60 * 60 * 12, expires: undefined }),
});
