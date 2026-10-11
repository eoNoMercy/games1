"use client";
import { useCallback, useEffect, useState } from "react";
import { deleteProduct, getAdminData, patchProduct, reorderItems, saveProduct } from "../actions";
import SortableList from "@/components/admin/SortableList";
import ImageUpload from "@/components/admin/ImageUpload";
import { useRun } from "@/components/admin/useRun";
import type { Category, GameConsole, Product } from "@/lib/types";
import { normProduct, photoHint, variantOf } from "@/lib/utils";
import { btn, btn2, card, inp } from "@/lib/ui";

const empty: Partial<Product> = { name: "", platform: "", platforms: [], category_id: "", description: "", image_url: "", price: "", featured: false, active: true };

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]), [cats, setCats] = useState<Category[]>([]), [consoles, setConsoles] = useState<GameConsole[]>([]);
  const [edit, setEdit] = useState<Partial<Product> | null>(null), [ready, setReady] = useState(false);
  const [q, setQ] = useState(""), [cat, setCat] = useState(""), [limit, setLimit] = useState(24);
  const [order, setOrder] = useState(false), [ocat, setOcat] = useState("");

  const load = useCallback(async () => {
    const r = await getAdminData();
    if (r.ok && r.data) { setItems(r.data.products.map(normProduct)); setCats(r.data.categories); setConsoles(r.data.consoles); }
    setReady(true);
  }, []);
  useEffect(() => { load(); }, [load]);
  const { busy, run } = useRun(load);

  function save() {
    if (!edit?.name?.trim()) return alert("Informe o nome do produto.");
    const { created_at, ...row } = edit as Product;
    run(() => saveProduct(row), () => setEdit(null));
  }
  const del = (p: Product) => { if (confirm(`Excluir "${p.name}"?`)) run(() => deleteProduct(p.id)); };

  const shown = items.filter((p) => (!cat || p.category_id === cat) && p.name.toLowerCase().includes(q.toLowerCase()));
  const set = (k: keyof Product, v: unknown) => setEdit((e) => ({ ...e, [k]: v }));
  const chosen = edit?.platforms ?? [];
  const rlist = items.filter((p) => p.category_id === ocat);
  const reorder = (next: Product[]) => {
    setItems((prev) => [...next.map((p, i) => ({ ...p, position: i + 1 })), ...prev.filter((p) => p.category_id !== ocat)]);
    run(() => reorderItems("products", next.map((p) => p.id)), undefined, { onFail: load });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Produtos</h1>
        <div className="flex flex-wrap gap-2">
          <button className={btn2} disabled={busy} onClick={() => { setOrder((o) => !o); setOcat((c) => c || cats[0]?.id || ""); }}>{order ? "Voltar à lista" : "Reordenar"}</button>
          <button className={btn} onClick={() => setEdit({ ...empty, category_id: cats[0]?.id ?? "" })}>+ Novo produto</button>
        </div>
      </div>
      {order ? (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <select className={`${inp} max-w-[220px]`} value={ocat} disabled={busy} onChange={(e) => setOcat(e.target.value)}>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <p className="text-sm text-ink/60">Segure o ícone ⋮⋮ e arraste. A ordem vale para a loja.</p>
          </div>
          <div className="mt-4">
            <SortableList items={rlist} disabled={busy} onReorder={reorder}>
              {(p, handle) => (
                <div className={`${card} flex items-center gap-3 p-3`}>
                  {handle}
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-black/5">{p.image_url && <img src={p.image_url} alt="" loading="lazy" decoding="async" className="size-full object-cover" />}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-ink/60">{p.platforms.join(", ") || "Sem console"}{!p.active ? " · oculto" : ""}</p>
                  </div>
                </div>
              )}
            </SortableList>
            {!rlist.length && <p className="text-ink/50">Nenhum produto nesta categoria.</p>}
          </div>
        </div>
      ) : (
      <>
      <div className="mt-6 flex flex-wrap gap-3">
        <input className={`${inp} max-w-xs`} placeholder="Buscar..." maxLength={100} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={`${inp} max-w-[200px]`} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Todas as categorias</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.slice(0, limit).map((p) => (
          <div key={p.id} className={`${card} flex flex-col gap-3 ${p.active ? "" : "opacity-50"}`}>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-black/5">{p.image_url && <img src={p.image_url} alt="" loading="lazy" decoding="async" className="size-full object-cover" />}</div>
            <div>
              <p className="text-xs text-signal">{p.platforms.join(", ") || "Sem console"} · {cats.find((c) => c.id === p.category_id)?.name ?? "Sem categoria"}</p>
              <p className="font-display font-semibold">{p.name}</p>
              <p className="text-sm text-ink/60">{p.price || "Sem preço"}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button disabled={busy} onClick={() => run(() => patchProduct({ id: p.id, featured: !p.featured }))} className={`rounded-full px-3 py-1.5 ${p.featured ? "bg-signal text-white" : "bg-black/5"}`}>★ Destaque</button>
              <button disabled={busy} onClick={() => run(() => patchProduct({ id: p.id, active: !p.active }))} className="rounded-full bg-black/5 px-3 py-1.5">{p.active ? "Ocultar" : "Mostrar"}</button>
            </div>
            <div className="mt-auto flex gap-2 pt-1">
              <button className={btn2} disabled={busy} onClick={() => setEdit(p)}>Editar</button>
              <button className="px-3 text-sm text-red-600" disabled={busy} onClick={() => del(p)}>Excluir</button>
            </div>
          </div>
        ))}
        {ready && !shown.length && <p className="text-ink/50">Nenhum produto encontrado.</p>}
        {!ready && <p className="text-ink/50">Carregando...</p>}
      </div>
      {shown.length > limit && <div className="mt-6 text-center"><button className={btn2} onClick={() => setLimit(limit + 24)}>Ver mais produtos</button></div>}
      </>
      )}

      {edit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => !busy && setEdit(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-4xl bg-porcelain p-6 sm:rounded-4xl sm:p-8">
            <h2 className="font-display text-xl font-semibold">{edit.id ? "Editar produto" : "Novo produto"}</h2>
            <div className="mt-6 space-y-4">
              <ImageUpload folder="produtos" max={2000} label={`Foto do produto (${photoHint(variantOf(cats.find((c) => c.id === edit.category_id)?.name ?? ""))})`} value={edit.image_url}
                onChange={(u, d) => setEdit((e) => ({ ...e, image_url: u, image_w: d?.w ?? null, image_h: d?.h ?? null }))} />
              <input className={inp} placeholder="Nome" maxLength={120} value={edit.name ?? ""} onChange={(e) => set("name", e.target.value)} />
              <input className={inp} placeholder="Preço (ex.: R$ 199,90)" maxLength={30} value={edit.price ?? ""} onChange={(e) => set("price", e.target.value)} />
              <div>
                <p className="mb-2 text-sm font-medium">Consoles compatíveis</p>
                <div className="flex flex-wrap gap-2">
                  {[...consoles.map((c) => c.name), ...chosen.filter((x) => !consoles.some((c) => c.name === x))].map((name) => {
                    const on = chosen.includes(name);
                    return (
                      <button type="button" key={name} onClick={() => set("platforms", on ? chosen.filter((x) => x !== name) : [...chosen, name])}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${on ? "bg-signal text-white" : "bg-white text-ink/70 ring-1 ring-black/10"}`}>{on ? "✓ " : ""}{name}</button>
                    );
                  })}
                </div>
                {!consoles.length && <p className="mt-2 text-sm text-ink/50">Cadastre os consoles na aba Consoles.</p>}
              </div>
              <select className={inp} value={edit.category_id ?? ""} onChange={(e) => set("category_id", e.target.value)}>
                <option value="">Sem categoria</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <textarea className={inp} rows={3} maxLength={1000} placeholder="Descrição" value={edit.description ?? ""} onChange={(e) => set("description", e.target.value)} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!edit.featured} onChange={(e) => set("featured", e.target.checked)} /> Mostrar em Destaques</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.active !== false} onChange={(e) => set("active", e.target.checked)} /> Visível no site</label>
            </div>
            <div className="mt-8 flex justify-end gap-2">
              <button className={btn2} disabled={busy} onClick={() => setEdit(null)}>Cancelar</button>
              <button className={btn} onClick={save} disabled={busy}>{busy ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
