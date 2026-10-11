"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "../actions";
import { btn, inp } from "@/lib/ui";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState(""), [pass, setPass] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false), [changed, setChanged] = useState(false);
  useEffect(() => { setChanged(new URLSearchParams(window.location.search).get("senha") === "ok"); }, []);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr("");
    const r = await login(email.trim(), pass);
    if (!r.ok) { setBusy(false); return setErr(r.error ?? "E-mail ou senha incorretos."); }
    router.replace("/admin"); router.refresh();
  }
  return (
    <div className="flex min-h-svh items-center justify-center bg-navy p-6">
      <form onSubmit={go} className="w-full max-w-sm rounded-4xl bg-white p-8">
        <h1 className="font-display text-2xl font-semibold">Entrar</h1>
        <p className="mt-1 text-sm text-ink/50">Área restrita da loja.</p>
        {changed && <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm text-green-800" role="status">Senha alterada com sucesso. Entre com a nova senha.</p>}
        <div className="mt-8 space-y-3">
          <input className={inp} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={200} autoComplete="email" />
          <input className={inp} type="password" placeholder="Senha" value={pass} onChange={(e) => setPass(e.target.value)} required maxLength={200} autoComplete="current-password" />
        </div>
        {err && <p className="mt-3 text-sm text-red-600" role="alert">{err}</p>}
        <button className={`${btn} mt-6 w-full`} disabled={busy}>{busy ? "Entrando..." : "Entrar"}</button>
        <Link href="/admin/esqueci-senha" className="mt-5 block text-center text-sm text-ink/60 underline underline-offset-4">Esqueci minha senha</Link>
      </form>
    </div>
  );
}
