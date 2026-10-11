import "server-only";
import { z } from "zod";
import { SUPABASE_URL } from "./env";

// Limpeza do que o usuário digita: remove tags HTML, caracteres de controle e de direção invisíveis.
const INVIS = "\\u0000-\\u0008\\u000B-\\u001F\\u007F\\u200B-\\u200F\\u202A-\\u202E\\u2066-\\u2069\\uFEFF";
export const clean = (s: unknown, max: number) =>
  String(s ?? "").normalize("NFKC").replace(/<[^>]*>/g, "").replace(new RegExp(`[${INVIS}\\n\\t]`, "g"), " ").replace(/\s+/g, " ").trim().slice(0, max);
export const cleanMulti = (s: unknown, max: number) =>
  String(s ?? "").normalize("NFKC").replace(/<[^>]*>/g, "").replace(new RegExp(`[${INVIS}]`, "g"), "").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);

const txt = (min: number, max: number) => z.string().max(max * 4).transform((s) => clean(s, max)).pipe(z.string().min(min, "obrigatório"));
const txt0 = (max: number) => z.string().max(max * 4).default("").transform((s) => clean(s, max));
const uuid = z.string().uuid();
const dim = z.number().int().min(1).max(10000).nullable().optional().transform((v) => v ?? null);

// Imagens: só aceitamos arquivos enviados ao nosso próprio armazenamento (evita links externos e SSRF).
const prefix = `${SUPABASE_URL}/storage/v1/object/public/media/`;
const imgUrl = z.union([z.string(), z.null(), z.undefined()]).transform((v) => v || null)
  .refine((v) => v === null || (v.length <= 400 && v.startsWith(prefix) && !/[\s"'<>\\]|\.\./.test(v)), "imagem inválida");

const hostOk = (v: string, ok: RegExp) => { try { const u = new URL(v); return u.protocol === "https:" && ok.test(u.hostname) && v.length <= 500; } catch { return false; } };
const link = (ok: RegExp) => z.string().max(500).default("").transform((s) => s.trim()).refine((v) => v === "" || hostOk(v, ok), "link inválido");
const MAPS = /(^|\.)(google\.com(\.br)?|goo\.gl|g\.page)$/i, INSTA = /(^|\.)instagram\.com$/i;

export const productIn = z.object({
  id: z.preprocess((v) => v || undefined, uuid.optional()),
  name: txt(1, 120),
  description: z.string().max(4000).default("").transform((s) => cleanMulti(s, 1000)),
  price: z.string().max(120).nullable().optional().transform((v) => clean(v, 30) || null),
  category_id: z.preprocess((v) => v || null, uuid.nullable()),
  platforms: z.array(txt(1, 40)).max(12).default([]).transform((a) => [...new Set(a)]),
  image_url: imgUrl, image_w: dim, image_h: dim,
  featured: z.boolean().default(false), active: z.boolean().default(true),
});
export const patchIn = z.object({ id: uuid, featured: z.boolean().optional(), active: z.boolean().optional() });
export const categoryIn = z.object({ id: uuid.optional(), name: txt(1, 60), text: txt0(160), position: z.number().int().min(-1000).max(10000).default(0) });
export const consoleIn = z.object({ name: txt(1, 40) });
export const settingsIn = z.object({
  store_name: txt(1, 80), tagline: txt0(160), logo_url: imgUrl,
  whatsapp: z.string().max(40).default("").transform((s) => s.replace(/\D/g, "")).refine((v) => v === "" || (v.length >= 8 && v.length <= 15), "whatsapp inválido"),
  address: txt0(240), maps_url: link(MAPS), hours: txt0(160), instagram: link(INSTA),
  hero_cover_url: imgUrl, hero_disc_url: imgUrl, hero_title: txt0(80), hero_platform: txt0(40),
});
export const idIn = uuid;
export const emailIn = z.string().trim().toLowerCase().email().max(200);
export const reorderIn = z.object({ kind: z.enum(["products", "categories", "consoles"]), ids: z.array(uuid).min(1).max(1000).refine((a) => new Set(a).size === a.length) });
export const loginIn = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) });
