"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPassword } from "../actions";
import { PASSWORD_RULES, passwordProblem } from "@/lib/password";
import { btn, inp } from "@/lib/ui";

export default function ResetPassword() {
  const router = useRouter();
  const [link, setLink] = useState<{ kind: "code" | "token_hash"; value: string } | null>(null), [ready, setReady] = useState(false);
  const [pw, setPw] = useState(""), [pw2, setPw2] = useState(""), [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [done, setDone] = useState(false);

  // O código do link é lido uma vez e já sai do endereço da página (não fica no histórico nem no recarregamento).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search), hp = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hash = sp.get("token_hash"), code = sp.get("code");
    if (hash && sp.get("type") === "recovery") setLink({ kind: "token_hash", value: hash });
    else if (code) setLink({ kind: "code", value: code });
    else if (sp.get("error_code") || hp.get("error_code")) setErr("Este link expirou ou já foi usado. Cada novo pedido cancela os anteriores: use o e-mail mais recente e clique uma única vez.");
    window.history.replaceState(null, "", window.location.pathname);
    setReady(true);
  }, []);

  const problem = pw ? passwordProblem(pw) : null;
  const match = pw !== "" && pw === pw2;

  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !link) return;
    const p = passwordProblem(pw);
    if (p) return setErr(p);
    if (pw !== pw2) return setErr("As senhas não são iguais.");
    setBusy(true); setErr("");
    const r = await resetPassword(link.kind, link.value, pw, pw2);
    setBusy(false);
    if (!r.ok) { setErr(r.error ?? "Não foi possível concluir. Tente novamente."); if (/link/i.test(r.error ?? "")) setLink(null); return; }
    setPw(""); setPw2(""); setLink(null); setDone(true);
    setTimeout(() => router.replace("/admin/login?senha=ok"), 2500);
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-navy p-6">
      <div className="w-full max-w-sm rounded-4xl bg-white p-8">
        <h1 className="font-display text-2xl font-semibold">Criar nova senha</h1>
        {!ready ? null : done ? (
          <p className="mt-6 rounded-2xl bg-green-50 p-4 text-sm text-green-900" role="status">Senha alterada com sucesso. Todas as sessões foram encerradas. Levando você para o login...</p>
        ) : !link ? (
          <div className="mt-6 space-y-4">
            {err && <p className="text-sm text-red-600" role="alert">{err}</p>}
            <p className="text-sm text-ink/60">Este link é inválido ou expirou. Peça um novo link e abra-o no mesmo navegador em que fez o pedido.</p>
            <Link href="/admin/esqueci-senha" className={`${btn} w-full`}>Pedir novo link</Link>
          </div>
        ) : (
          <form onSubmit={go} className="mt-6 space-y-3">
            <input className={inp} type={show ? "text" : "password"} placeholder="Nova senha" value={pw} onChange={(e) => setPw(e.target.value)} required maxLength={128} autoComplete="new-password" />
            <input className={inp} type={show ? "text" : "password"} placeholder="Repita a nova senha" value={pw2} onChange={(e) => setPw2(e.target.value)} required maxLength={128} autoComplete="new-password" />
            <label className="flex items-center gap-2 text-sm text-ink/70"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Mostrar senhas</label>
            <ul className="space-y-1 text-sm">
              {PASSWORD_RULES.map(([label, ok]) => <li key={label} className={ok(pw) ? "text-green-700" : "text-ink/50"}>{ok(pw) ? "✓" : "○"} {label}</li>)}
              <li className={match ? "text-green-700" : "text-ink/50"}>{match ? "✓" : "○"} As duas senhas são iguais</li>
            </ul>
            {(err || (problem && pw.length >= 12)) && <p className="text-sm text-red-600" role="alert">{err || problem}</p>}
            <button className={`${btn} w-full`} disabled={busy || !!problem || !pw || !match}>{busy ? "Salvando..." : "Salvar nova senha"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
