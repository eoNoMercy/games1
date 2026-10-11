const supa = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let host = "";
try { host = new URL(supa).hostname; } catch {}
const dev = process.env.NODE_ENV !== "production";

// Política de conteúdo: só carrega o que o site realmente usa. (Não há CORS aberto: o site não expõe API para outros domínios.)
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${host ? ` https://${host}` : ""}`,
  "font-src 'self' data:",
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "frame-src https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const security = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  compress: true,
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    // Só otimiza imagens do nosso próprio armazenamento (evita uso do servidor como proxy de imagens de terceiros).
    remotePatterns: host ? [{ protocol: "https", hostname: host, pathname: "/storage/v1/object/public/media/**" }] : [],
  },
  async headers() {
    return [
      { source: "/:path*", headers: security },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/admin/redefinir-senha", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
    ];
  },
};
export default nextConfig;
