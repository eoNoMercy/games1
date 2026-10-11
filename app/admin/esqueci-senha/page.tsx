"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "../actions";
import { btn, inp } from "@/lib/ui";

export default function ForgotPassword() {
  const [email, setEmail] = useState(""), [busy, setBusy] = useState(false), [sent, setSent] = useState(false), [motivo, setMotivo] = useState("");
  useEffect(() => { setMotivo(new URLSearchParams(window.location.search).get("motivo") ?? ""); }, []);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    await requestPasswordReset(email.trim());
    setBusy(false); setSent(true);
  }
  return (
    <div className="flex min-h-svh items-center justify-center bg-navy p-6">
      <div className="w-full max-w-sm rounded-4xl bg-white p-8">
        <h1 className="font-display text-2xl font-semibold">Esqueci minha senha</h1>
        {motivo === "expirado" && <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900" role="status">Esse link expirou ou já foi usado. Cada novo pedido cancela os anteriores: use sempre o e-mail mais recente e clique no link uma única vez.</p>}
        {motivo === "link" && <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900" role="status">Esse link não é mais válido ou usa um formato antigo. Peça um novo link abaixo.</p>}
        {sent ? (
          <p className="mt-6 rounded-2xl bg-green-50 p-4 text-sm text-green-900" role="status">
            Se esse e-mail tiver acesso ao painel, enviamos um link para criar uma nova senha. O link vale por tempo limitado e só funciona uma vez. Confira também a caixa de spam.
          </p>
        ) : (
          <form onSubmit={go} className="mt-6 space-y-4">
            <p className="text-sm text-ink/60">Informe o e-mail do acesso. Se ele tiver permissão, você recebe um link para criar uma nova senha.</p>
            <input className={inp} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={200} autoComplete="email" />
            <button className={`${btn} w-full`} disabled={busy}>{busy ? "Enviando..." : "Enviar link"}</button>
          </form>
        )}
        <Link href="/admin/login" className="mt-6 block text-center text-sm text-ink/60 underline underline-offset-4">Voltar para o login</Link>
      </div>
    </div>
  );
}
