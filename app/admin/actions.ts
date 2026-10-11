"use server";
// Toda escrita do painel passa por aqui: confere sessão e papel de admin, limita requisições, valida e limpa os dados.
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { RECOVERY_COOKIE, recoveryClient } from "@/lib/recovery";
import { hit, clientIp } from "@/lib/ratelimit";
import { requireAdmin, serverClient } from "@/lib/supabase/server";
import { categoryIn, consoleIn, emailIn, idIn, loginIn, patchIn, productIn, reorderIn, settingsIn } from "@/lib/validate";
import { audit } from "@/lib/audit";
import { passwordProblem } from "@/lib/password";
import { anonClient } from "@/lib/supabase/server";
import type { Category, GameConsole, Product, Settings } from "@/lib/types";

type Res<T = undefined> = { ok: boolean; error?: string; data?: T };
type Ctx = Awaited<ReturnType<typeof requireAdmin>>;
const FAIL: Res<never> = { ok: false, error: "Não foi possível concluir. Tente novamente." };
const bad = (error: string): Res<never> => ({ ok: false, error });
const bust = () => { revalidateTag("site"); revalidatePath("/"); };

async function guard<T>(fn: (c: Ctx) => Promise<Res<T>>): Promise<Res<T>> {
  try {
    const ctx = await requireAdmin();
    if (!hit(`w:${ctx.user.id}`, 90, 60_000)) return bad("Muitas ações seguidas. Aguarde um instante.");
    return await fn(ctx);
  } catch { return FAIL; }
}
const done = (error: { message: string } | null): Res => { if (error) return FAIL; bust(); return { ok: true }; };

// ---------- acesso ----------
export async function login(email: string, password: string): Promise<Res> {
  const ip = clientIp(await headers());
  const p = loginIn.safeParse({ email, password });
  const key = p.success ? p.data.email.toLowerCase() : "x";
  if (!hit(`l:${ip}:${key}`, 5, 15 * 60_000) || !hit(`l:${ip}`, 20, 15 * 60_000)) return bad("Muitas tentativas. Aguarde alguns minutos.");
  const generic = bad("E-mail ou senha incorretos.");
  if (!p.success) { await new Promise((r) => setTimeout(r, 600)); return generic; }
  const sb = await serverClient();
  const { data, error } = await sb.auth.signInWithPassword(p.data);
  if (error || data.user?.app_metadata?.role !== "admin") {
    if (!error) await sb.auth.signOut();
    void audit("login_failed", { email: p.data.email });
    await new Promise((r) => setTimeout(r, 600));
    return generic;
  }
  void audit("login_ok", { userId: data.user?.id });
  return { ok: true };
}
export async function logout(): Promise<Res> { await (await serverClient()).auth.signOut(); return { ok: true }; }

// ---------- leitura (inclui itens ocultos) ----------
export async function getAdminData(): Promise<Res<{ products: Product[]; categories: Category[]; consoles: GameConsole[]; settings: Partial<Settings> }>> {
  return guard(async ({ sb }) => {
    const [p, c, k, s] = await Promise.all([
      sb.from("products").select("*").order("position", { ascending: true }).order("created_at", { ascending: false }),
      sb.from("categories").select("*").order("position"),
      sb.from("consoles").select("*").order("position"),
      sb.from("settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    // Plano B: se a coluna de ordem ainda não existir, mantém a ordem antiga.
    const prods = p.error ? (await sb.from("products").select("*").order("created_at", { ascending: false })).data : p.data;
    return { ok: true, data: { products: prods ?? [], categories: c.data ?? [], consoles: k.data ?? [], settings: s.data ?? {} } };
  });
}

// ---------- produtos ----------
export async function saveProduct(input: unknown): Promise<Res> {
  return guard(async ({ sb }) => {
    const r = productIn.safeParse(input);
    if (!r.success) return bad("Confira os campos: nome, preço, descrição e foto.");
    const { id, ...row } = r.data;
    const payload = { ...row, platform: row.platforms.join(", ") };
    return done((id ? await sb.from("products").update(payload).eq("id", id) : await sb.from("products").insert(payload)).error);
  });
}
export async function patchProduct(input: unknown): Promise<Res> {
  return guard(async ({ sb }) => {
    const r = patchIn.safeParse(input);
    if (!r.success) return FAIL;
    const { id, ...ch } = r.data;
    return done((await sb.from("products").update(ch).eq("id", id)).error);
  });
}
export async function deleteProduct(id: string): Promise<Res> {
  return guard(async ({ sb }) => { const r = idIn.safeParse(id); return r.success ? done((await sb.from("products").delete().eq("id", r.data)).error) : FAIL; });
}

// ---------- categorias ----------
export async function saveCategory(input: unknown): Promise<Res> {
  return guard(async ({ sb }) => {
    const r = categoryIn.safeParse(input);
    if (!r.success) return bad("Confira o nome e o texto da categoria.");
    const { id, ...row } = r.data;
    return done((id ? await sb.from("categories").update(row).eq("id", id) : await sb.from("categories").insert(row)).error);
  });
}
export async function deleteCategory(id: string): Promise<Res> {
  return guard(async ({ sb }) => { const r = idIn.safeParse(id); return r.success ? done((await sb.from("categories").delete().eq("id", r.data)).error) : FAIL; });
}

// ---------- consoles ----------
export async function addConsole(input: unknown, position: number): Promise<Res> {
  return guard(async ({ sb }) => {
    const r = consoleIn.safeParse(input);
    if (!r.success) return bad("Informe um nome válido.");
    const { error } = await sb.from("consoles").insert({ name: r.data.name, position: Math.max(0, Math.min(10000, Math.trunc(Number(position)) || 0)) });
    return error ? bad("Não foi possível adicionar. Esse console talvez já exista.") : (bust(), { ok: true });
  });
}
export async function saveConsolePosition(id: string, position: number): Promise<Res> {
  return guard(async ({ sb }) => {
    const r = idIn.safeParse(id);
    return r.success ? done((await sb.from("consoles").update({ position: Math.max(0, Math.min(10000, Math.trunc(Number(position)) || 0)) }).eq("id", r.data)).error) : FAIL;
  });
}
export async function deleteConsole(id: string): Promise<Res> {
  return guard(async ({ sb }) => {
    const r = idIn.safeParse(id);
    if (!r.success) return FAIL;
    const { data: c } = await sb.from("consoles").select("name").eq("id", r.data).maybeSingle();
    if (!c) return FAIL;
    const { data: rows } = await sb.from("products").select("id,platforms").contains("platforms", [c.name]);
    await Promise.all((rows ?? []).map((p: { id: string; platforms: string[] }) => sb.from("products").update({ platforms: p.platforms.filter((x) => x !== c.name) }).eq("id", p.id)));
    return done((await sb.from("consoles").delete().eq("id", r.data)).error);
  });
}

// ---------- loja ----------
export async function saveSettings(input: unknown): Promise<Res> {
  return guard(async ({ sb }) => {
    const r = settingsIn.safeParse(input);
    if (!r.success) return bad("Confira os campos: nome, WhatsApp e links (Maps e Instagram).");
    return done((await sb.from("settings").upsert({ ...r.data, id: 1 })).error);
  });
}

// ---------- upload (validado pelo conteúdo real do arquivo, não pelo nome ou tipo informado) ----------
function sniff(b: Uint8Array): { ext: string; mime: string } | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return { ext: "png", mime: "image/png" };
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return { ext: "webp", mime: "image/webp" };
  return null;
}
export async function uploadImage(fd: FormData): Promise<Res<{ url: string; w: number; h: number }>> {
  return guard(async ({ sb, user }) => {
    if (!hit(`u:${user.id}`, 30, 60_000)) return bad("Muitos envios seguidos. Aguarde um instante.");
    const file = fd.get("file"), folder = String(fd.get("folder") ?? "");
    if (!(file instanceof File) || !["produtos", "logo", "hero"].includes(folder)) return bad("Arquivo inválido.");
    if (file.size < 1 || file.size > 4 * 1024 * 1024) return bad("A foto precisa ter até 4 MB.");
    const buf = new Uint8Array(await file.arrayBuffer());
    const kind = sniff(buf);
    if (!kind) return bad("Use uma foto JPG, PNG ou WebP.");
    const path = `${folder}/${crypto.randomUUID()}.${kind.ext}`;
    const { error } = await sb.storage.from("media").upload(path, buf, { contentType: kind.mime, cacheControl: "31536000", upsert: false });
    if (error) return FAIL;
    const n = (k: string) => { const v = Math.trunc(Number(fd.get(k))); return v >= 1 && v <= 10000 ? v : 0; };
    return { ok: true, data: { url: sb.storage.from("media").getPublicUrl(path).data.publicUrl, w: n("w"), h: n("h") } };
  });
}

// ---------- ordem (arrastar e soltar) ----------
export async function reorderItems(kind: string, ids: string[]): Promise<Res> {
  return guard(async ({ sb }) => {
    const r = reorderIn.safeParse({ kind, ids });
    if (!r.success) return FAIL;
    return done((await sb.rpc("reorder_items", { p_table: r.data.kind, p_ids: r.data.ids })).error);
  });
}

// ---------- recuperação de senha (feita pelo Supabase Auth; aqui só pedimos o e-mail e validamos o link) ----------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const LINK_BAD = "Este link é inválido ou expirou. Peça um novo link e abra-o no mesmo navegador em que fez o pedido.";
const COOKIE = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/admin" };

// Resposta SEMPRE igual, exista ou não a conta, e com tempo parecido (não revela se o e-mail tem acesso).
// O pedido usa PKCE: o link só funciona no navegador que o pediu (um "verificador" fica num cookie fechado, válido por 15 min).
export async function requestPasswordReset(email: string): Promise<Res> {
  const t0 = Date.now();
  const settle = async (): Promise<Res> => { await sleep(Math.max(0, 700 - (Date.now() - t0))); return { ok: true }; };
  const h = await headers();
  const ip = clientIp(h);
  const e = emailIn.safeParse(email ?? "");
  if (!e.success) return settle();
  if (!hit(`rq:${ip}`, 5, 3_600_000) || !hit(`rq:${e.data}`, 3, 3_600_000)) { await audit("recovery_blocked", { email: e.data }); return settle(); }
  await audit("recovery_requested", { email: e.data });
  try {
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
    const proto = h.get("x-forwarded-proto") ?? (/^(localhost|127\.)/.test(host) ? "http" : "https");
    const origin = (process.env.SITE_URL ?? `${proto}://${host}`).replace(/\/$/, "");
    const { client, verifier } = recoveryClient();
    await client.auth.resetPasswordForEmail(e.data, { redirectTo: `${origin}/admin/redefinir-senha` });
    const v = verifier();
    if (v) (await cookies()).set(RECOVERY_COOKIE, v, { ...COOKIE, maxAge: 900 });
  } catch { /* resposta igual de propósito */ }
  return settle();
}

// Valida o link no Supabase SEM entregar sessão ao navegador: a sessão de recuperação vive só dentro desta requisição.
const fail = (reason: string) => ({ ok: false as const, reason });
const ok = (client: SupabaseClient, user: User) => ({ ok: true as const, client, user });
async function recoverSession(kind: string, credential: string) {
  if (kind === "token_hash") {
    const client = anonClient();
    const { data, error } = await client.auth.verifyOtp({ token_hash: credential, type: "recovery" });
    return error || !data.session || !data.user ? fail(`otp:${error?.code ?? error?.status ?? "sem_sessao"}`) : ok(client, data.user);
  }
  const store = await cookies();
  const v = store.get(RECOVERY_COOKIE)?.value;
  store.set(RECOVERY_COOKIE, "", { ...COOKIE, maxAge: 0 }); // uso único: o verificador é apagado de qualquer jeito
  if (!v) return fail("sem_verificador");
  const { client } = recoveryClient(v);
  const { data, error } = await client.auth.exchangeCodeForSession(credential);
  if (error || !data?.session || !data.user) return fail(`troca:${error?.code ?? error?.status ?? "falhou"}`);
  const type = (data as { redirectType?: string | null }).redirectType;
  if (type && !/^(password_)?recovery$/i.test(type)) return fail("tipo_errado"); // aceita só link de recuperação (a biblioteca informa "recovery")
  return ok(client, data.user);
}

// O link só é consumido AQUI, junto com a nova senha. Depois de trocar, todas as sessões da conta são encerradas
// e a pessoa entra de novo pelo login normal (que exige o papel de administrador).
export async function resetPassword(kind: string, credential: string, password: string, confirm: string): Promise<Res> {
  const ip = clientIp(await headers());
  if (!hit(`rp:${ip}`, 10, 15 * 60_000)) { await audit("recovery_blocked"); return bad("Muitas tentativas. Aguarde alguns minutos."); }
  if (!["code", "token_hash"].includes(kind) || !/^[A-Za-z0-9_-]{16,200}$/.test(String(credential ?? ""))) return bad(LINK_BAD);
  if (typeof password !== "string" || password !== confirm) return bad("As senhas não são iguais.");
  const problem = passwordProblem(password);
  if (problem) return bad(problem);

  const rec = await recoverSession(kind, credential);
  if (!rec.ok) { await audit("recovery_failed", { detail: rec.reason }); await sleep(600); return bad(LINK_BAD); }
  const { error: upd } = await rec.client.auth.updateUser({ password });
  await rec.client.auth.signOut({ scope: "global" });
  if (upd) { await audit("password_change_failed", { userId: rec.user.id, detail: String(upd.code ?? upd.status ?? "") }); return bad("Não foi possível definir esta senha. Escolha outra e peça um novo link."); }
  await audit("password_changed", { userId: rec.user.id });
  return { ok: true };
}
