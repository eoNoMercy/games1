import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";
import { unstable_cache } from "next/cache";
import { site } from "@/config/site";
import type { Category, Product, Settings } from "./types";
import { normProduct } from "./utils";

export const defaults: Settings = {
  store_name: site.name, tagline: site.tagline, logo_url: null, whatsapp: site.whatsappNumber, address: site.address,
  maps_url: site.mapsUrl, hours: site.hours, instagram: site.instagram, hero_cover_url: null, hero_disc_url: null,
  hero_title: site.hero.gameTitle, hero_platform: site.hero.platform,
};
type SiteData = { settings: Settings; categories: Category[]; products: Product[]; consoles: string[] };

async function fetchData(): Promise<SiteData> {
  const url = SUPABASE_URL, key = SUPABASE_ANON_KEY;
  if (!url || !key) return { settings: defaults, categories: [], products: [], consoles: [] };
  try {
    const sb = createClient(url, key);
    const prods = () => sb.from("products").select("*").eq("active", true);
    const [s, c, p0, k] = await Promise.all([
      sb.from("settings").select("*").eq("id", 1).maybeSingle(),
      sb.from("categories").select("id,name,text,position").order("position"),
      prods().order("position", { ascending: true }).order("created_at", { ascending: false }),
      sb.from("consoles").select("name").order("position"),
    ]);
    // Plano B: se a coluna de ordem ainda não existir no banco, mantém a ordem antiga (mais novos primeiro).
    const p = p0.error ? await prods().order("created_at", { ascending: false }) : p0;
    const row = Object.fromEntries(Object.entries(s.data ?? {}).filter(([, v]) => v !== null && v !== ""));
    const https = (v?: string | null) => (v && v.startsWith("https://") ? v : null);
    const st = { ...defaults, ...row } as Settings;
    st.logo_url = https(st.logo_url); st.hero_cover_url = https(st.hero_cover_url); st.hero_disc_url = https(st.hero_disc_url);
    st.maps_url = https(st.maps_url) ?? ""; st.instagram = https(st.instagram) ?? "";
    return { settings: st, categories: (c.data ?? []) as Category[], products: ((p.data ?? []) as Product[]).map(normProduct).map((p) => ({ ...p, image_url: https(p.image_url) })), consoles: (k.data ?? []).map((x: { name: string }) => x.name) };
  } catch {
    return { settings: defaults, categories: [], products: [], consoles: [] };
  }
}

// Cache de 5 min compartilhado entre visitantes; o painel limpa na hora ao salvar.
export const getData = unstable_cache(fetchData, ["site-data"], { revalidate: 300, tags: ["site"] });
