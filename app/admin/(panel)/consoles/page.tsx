"use client";
import { useCallback, useEffect, useState } from "react";
import { addConsole, deleteConsole, getAdminData, reorderItems } from "../../actions";
import SortableList from "@/components/admin/SortableList";
import { useRun } from "@/components/admin/useRun";
import type { GameConsole } from "@/lib/types";
import { btn, card, inp } from "@/lib/ui";

export default function ConsolesPage() {
  const [list, setList] = useState<GameConsole[]>([]), [name, setName] = useState("");
  const load = useCallback(async () => { const r = await getAdminData(); if (r.ok && r.data) setList(r.data.consoles); }, []);
  useEffect(() => { load(); }, [load]);
  const { busy, run } = useRun(load);

  const add = () => { if (name.trim()) run(() => addConsole({ name }, (list.at(-1)?.position ?? 0) + 1), () => setName("")); };
  const del = (c: GameConsole) => { if (confirm(`Remover "${c.name}"? Ele também sai dos produtos que já o usam.`)) run(() => deleteConsole(c.id)); };
  const reorder = (next: GameConsole[]) => {
    setList(next.map((c, i) => ({ ...c, position: i + 1 })));
    run(() => reorderItems("consoles", next.map((c) => c.id)), undefined, { reload: false, onFail: load });
  };

  return (
    <>
      <h1 className="font-display text-3xl font-semibold">Consoles</h1>
      <p className="mt-2 text-sm text-ink/60">Esta lista aparece como opções ao cadastrar um produto e vira os botões de filtro no site. Segure o ícone ⋮⋮ e arraste para mudar a ordem.</p>
      <div className="mt-6 flex gap-3">
        <input className={`${inp} max-w-xs`} placeholder="Novo console" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className={btn} disabled={busy} onClick={add}>Adicionar</button>
      </div>
      <div className="mt-6">
        <SortableList items={list} disabled={busy} onReorder={reorder}>
          {(c, handle) => (
            <div className={`${card} flex items-center gap-2 p-3`}>
              {handle}
              <span className="min-w-0 flex-1 truncate font-display font-semibold">{c.name}</span>
              <button className="px-3 text-sm text-red-600" disabled={busy} onClick={() => del(c)}>Remover</button>
            </div>
          )}
        </SortableList>
      </div>
    </>
  );
}
