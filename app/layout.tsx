import type { Metadata, Viewport } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import { getData } from "@/lib/data";
import RecoveryHashGuard from "@/components/RecoveryHashGuard";
import { SUPABASE_URL } from "@/lib/env";

const display = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getData();
  return { title: `${s.store_name} | Games e eletrônicos`, description: `${s.store_name}: ${s.tagline}`, openGraph: { title: s.store_name, description: s.tagline, type: "website", locale: "pt_BR" } };
}
export const viewport: Viewport = { themeColor: "#0b1022", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <head>{SUPABASE_URL ? <link rel="preconnect" href={SUPABASE_URL} /> : null}</head>
      <body className="bg-porcelain font-body text-ink antialiased"><RecoveryHashGuard />{children}</body>
    </html>
  );
}
