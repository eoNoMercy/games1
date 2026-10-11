import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hardened } from "@/lib/cookies";
import { clientIp, hit } from "@/lib/ratelimit";

export async function middleware(req: NextRequest) {
  if (!hit(`mw:${clientIp(req.headers)}`, 240, 60_000))
    return new NextResponse("Muitas requisições. Tente novamente em instantes.", { status: 429, headers: { "Retry-After": "60" } });

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, hardened(options)));
      },
    },
  });
  const { data: { user }, error: authError } = await sb.auth.getUser();
  // Cookies de login antigos (renovação inexistente): limpa em silêncio e trata como "sem login".
  const staleNames = req.cookies.getAll().map((c) => c.name).filter((n) => n.startsWith("sb-"));
  const stale = !!authError && staleNames.length > 0 && [400, 401, 403].includes(Number((authError as { status?: number }).status));
  const clean = <T extends NextResponse>(r: T): T => {
    if (stale) staleNames.forEach((n) => { r.cookies.set(n, "", { path: "/admin", maxAge: 0 }); r.cookies.set(n, "", { path: "/", maxAge: 0 }); });
    return r;
  };
  const isAdmin = user?.app_metadata?.role === "admin";
  const path = req.nextUrl.pathname.replace(/\/$/, "");
  const isLogin = path === "/admin/login";
  const isPublic = ["/admin/login", "/admin/esqueci-senha", "/admin/redefinir-senha"].includes(path);
  if (!isAdmin && !isPublic) return clean(NextResponse.redirect(new URL("/admin/login", req.url)));
  if (isAdmin && isLogin) return clean(NextResponse.redirect(new URL("/admin", req.url)));
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return clean(res);
}
export const config = { matcher: ["/admin/:path*"] };
