import type { Category, Product } from "./types";

export const norm = (s: string) => (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export const matches = (p: Product, text: string) => {
  const t = norm(text);
  if (!t) return true;
  const hay = norm(`${p.name} ${p.platforms.join(" ")} ${p.description}`);
  return t.split(/\s+/).every((w) => hay.includes(w));
};

export const normProduct = (p: Product): Product => ({ ...p, platforms: p.platforms?.length ? p.platforms : p.platform ? [p.platform] : [] });

export type CategoryWithSlug = Category & { slug: string };
export function withSlugs(cats: Category[]): CategoryWithSlug[] {
  const used = new Set<string>();
  return cats.map((c) => {
    const base = norm(c.name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "secao";
    let slug = base, i = 2;
    while (used.has(slug)) slug = `${base}-${i++}`;
    used.add(slug);
    return { ...c, slug };
  });
}

export type CardVariant = "game" | "console" | "accessory";
export const variantOf = (categoryName: string): CardVariant => {
  const n = norm(categoryName);
  if (/jogo|game|midia/.test(n)) return "game";
  if (/console|videogame/.test(n)) return "console";
  return "accessory";
};
export const photoHint = (v: CardVariant) =>
  v === "console" ? "ideal: 1920 x 1080, horizontal" : v === "accessory" ? "ideal: 1000 x 1000, quadrada" : "ideal: capa em pé, formato de caixa";
