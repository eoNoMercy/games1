"use client";
import { useState } from "react";

// Trava os botões enquanto uma ação está em andamento (evita clique duplo e envio repetido).
export function useRun(reload: () => Promise<void>) {
  const [busy, setBusy] = useState(false);
  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void, opts?: { reload?: boolean; onFail?: () => void }) {
    if (busy) return false;
    setBusy(true);
    try {
      const r = await fn();
      if (!r.ok) { alert(r.error ?? "Não foi possível concluir. Tente novamente."); opts?.onFail?.(); return false; }
      if (opts?.reload !== false) await reload();
      after?.();
      return true;
    } finally { setBusy(false); }
  }
  return { busy, run };
}
