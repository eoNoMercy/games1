// Limite de requisições em memória (por instância do servidor). Complementa o limite do Supabase Auth e o firewall da hospedagem.
const store = new Map<string, { n: number; t: number }>();
export function hit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now(), e = store.get(key);
  if (!e || now > e.t) {
    store.set(key, { n: 1, t: now + windowMs });
    if (store.size > 5000) for (const [k, v] of store) if (now > v.t) store.delete(k);
    return true;
  }
  e.n++;
  return e.n <= max;
}
export const clientIp = (h: Headers) => (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "desconhecido").trim().slice(0, 64);
