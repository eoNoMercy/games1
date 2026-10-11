"use client";
import { useCallback, useEffect, useState } from "react";
import { deleteCategory, getAdminData, reorderItems, saveCategory } from "../../actions";
import SortableList from "@/components/admin/SortableList";
import { useRun } from "@/components/admin/useRun";
import type { Category } from "@/lib/types";
import { btn, btn2, card, inp } from "@/lib/ui";

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]), [name, setName] = useState("");
  const load = useCallback(async () => { const r = await getAdminData(); if (r.ok && r.data) setCats(r.data.categories); }, []);
  useEffect(() => { load(); }, [load]);
  const { busy, run } = useRun(load);

  const add = () => { if (name.trim()) run(() => saveCategory({ name, text: "", position: (cats.at(-1)?.position ?? 0) + 1 }), () => setName("")); };
  const del = (c: Category) => { if (confirm(`Excluir "${c.name}"? Os produtos dela ficarão sem categoria e sumirão das seções do site até você escolher outra.`)) run(() => deleteCategory(c.id)); };
  const edit = (id: string, ch: Partial<Category>) => setCats((l) => l.map((c) => (c.id === id ? { ...c, ...ch } : c)));
  const reorder = (next: Category[]) => {
    setCats(next.map((c, i) => ({ ...c, position: i + 1 })));
    run(() => reorderItems("categories", next.map((c) => c.id)), undefined, { reload: false, onFail: load });
  };

  return (
    <>
      <h1 className="font-display text-3xl font-semibold">Categorias</h1>
      <p className="mt-2 text-sm text-ink/60">Cada categoria vira uma seção com carrossel no site. Segure o ícone ⋮⋮ e arraste para mudar a ordem.</p>
      <div className="mt-6 flex gap-3">
        <input className={`${inp} max-w-xs`} placeholder="Nova categoria" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className={btn} disabled={busy} onClick={add}>Adicionar</button>
      </div>
      <div className="mt-6">
        <SortableList items={cats} disabled={busy} onReorder={reorder}>
          {(c, handle) => (
            <div className={`${card} flex items-start gap-2 p-4 sm:items-center`}>
              {handle}
              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-center">
                <input className={inp} maxLength={60} value={c.name} onChange={(e) => edit(c.id, { name: e.target.value })} />
                <input className={inp} maxLength={160} placeholder="Texto curto" value={c.text ?? ""} onChange={(e) => edit(c.id, { text: e.target.value })} />
                <div className="flex gap-2"><button className={btn2} disabled={busy} onClick={() => run(() => saveCategory(c), undefined, { reload: false })}>Salvar</button><button className="px-2 text-sm text-red-600" disabled={busy} onClick={() => del(c)}>Excluir</button></div>
              </div>
            </div>
          )}
        </SortableList>
      </div>
    </>
  );
}
