import "server-only";
import { headers } from "next/headers";
import { anonClient } from "./supabase/server";
import { clientIp } from "./ratelimit";

const sha = async (s: string) => {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 24);
};

// Registra eventos de acesso e recuperação. Nunca grava senha nem token; e-mail e IP entram só como código embaralhado.
export async function audit(event: string, o: { userId?: string; email?: string; detail?: string } = {}) {
  try {
    const ip = await sha(clientIp(await headers()));
    const detail = [o.email ? `email:${await sha(o.email.toLowerCase())}` : "", o.detail ?? ""].filter(Boolean).join(" ");
    console.info(JSON.stringify({ audit: event, user: o.userId ?? null, ip, detail, at: new Date().toISOString() }));
    await anonClient().rpc("log_event", { p_event: event, p_user: o.userId ?? null, p_ip: ip, p_detail: detail });
  } catch { /* a auditoria nunca pode derrubar o fluxo */ }
}
