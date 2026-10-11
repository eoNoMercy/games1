"use client";
import { useDeferredValue, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { matches, norm, variantOf, type CategoryWithSlug } from "@/lib/utils";
import ProductCard from "./ProductCard";
import { useRail } from "./useRail";

const field = "w-full rounded-full border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none sm:py-3 sm:pl-11 transition focus:border-signal focus:ring-4 focus:ring-signal/15";

function SearchBox({ value, onChange, placeholder, className = "" }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 size-4 sm:left-4 sm:size-5 -translate-y-1/2 text-ink/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={field} />
    </div>
  );
}

function Section({ cat, items, q, number, order }: { cat: CategoryWithSlug; items: Product[]; q: string; number: string; order: string[] }) {
  const [local, setLocal] = useState(""), [plat, setPlat] = useState("");
  const deferred = useDeferredValue(local);
  const variant = variantOf(cat.name);

  const platforms = useMemo(() => {
    const m = new Map<string, { label: string; n: number }>();
    items.forEach((p) => p.platforms.forEach((pl) => {
      const k = norm(pl);
      if (!k) return;
      const e = m.get(k);
      if (e) e.n++; else m.set(k, { label: pl.trim(), n: 1 });
    }));
    const pos = (k: string) => { const i = order.findIndex((o) => norm(o) === k); return i < 0 ? 999 : i; };
    return [...m.entries()].sort((a, b) => pos(a[0]) - pos(b[0]) || b[1].n - a[1].n);
  }, [items, order]);

  const shown = useMemo(() => items.filter((p) => (!plat || p.platforms.some((x) => norm(x) === plat)) && matches(p, q) && matches(p, deferred)), [items, plat, q, deferred]);
  const rail = useRail(`${plat}|${deferred}|${q}|${shown.length}`);
  if (q && !shown.length) return null;

  const chip = (on: boolean) => `shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition active:scale-95 sm:px-4 sm:py-2 sm:text-sm ${on ? "bg-ink text-white" : "bg-white text-ink/70 hover:bg-white/70"}`;

  return (
    <section id={cat.slug} className="py-8 sm:py-20">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-3 px-4 sm:gap-4 sm:px-6">
        <h2 className="font-display text-xl font-semibold tracking-tight sm:text-4xl">{cat.name}</h2>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <SearchBox value={local} onChange={setLocal} placeholder={`Buscar em ${cat.name.toLowerCase()}`} className="flex-1 sm:w-64" />
          {!(rail.edge.start && rail.edge.end) && (
            <div className="hidden gap-2 sm:flex">
              <button onClick={() => rail.scroll(-1)} disabled={rail.edge.start} aria-label="Anterior" className="size-11 rounded-full bg-white text-xl transition active:scale-90 disabled:opacity-30">‹</button>
              <button onClick={() => rail.scroll(1)} disabled={rail.edge.end} aria-label="Próximo" className="size-11 rounded-full bg-ink text-xl text-white transition active:scale-90 disabled:opacity-30">›</button>
            </div>
          )}
        </div>
      </div>
      {platforms.length > 1 && (
        <div className="no-scrollbar mx-auto mt-4 flex max-w-6xl gap-1.5 overflow-x-auto px-4 sm:mt-6 sm:gap-2 sm:px-6" role="group" aria-label="Filtrar por console">
          <button className={chip(!plat)} onClick={() => setPlat("")}>Todos</button>
          {platforms.map(([k, v]) => <button key={k} className={chip(plat === k)} onClick={() => setPlat(plat === k ? "" : k)}>{v.label}</button>)}
        </div>
      )}
      {shown.length ? (
        <div ref={rail.ref} {...rail.handlers} className={`rail mt-5 pb-4 sm:mt-8 ${variant === "game" ? "" : "items-start"}`}>
          {shown.map((p) => <ProductCard key={p.id} p={p} number={number} variant={variant} />)}
        </div>
      ) : <p className="mx-auto mt-5 max-w-6xl px-4 text-ink/50 sm:mt-8 sm:px-6">Nada encontrado nesta seção.</p>}
    </section>
  );
}

export default function Catalog({ categories, products, number, consoles }: { categories: CategoryWithSlug[]; products: Product[]; number: string; consoles: string[] }) {
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const sections = useMemo(() => categories.map((c) => ({ c, items: products.filter((p) => p.category_id === c.id) })).filter((x) => x.items.length), [categories, products]);
  const none = dq && !products.some((p) => matches(p, dq));
  if (!sections.length) return null;
  return (
    <div id="catalogo" className="pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="max-w-xl font-display text-2xl font-semibold tracking-tight sm:text-5xl">Encontre o que você procura</h2>
        <SearchBox value={q} onChange={setQ} placeholder="Buscar jogos, consoles e acessórios" className="mt-5 max-w-xl sm:mt-8" />
        {none && <p className="mt-5 text-ink/60 sm:mt-8">Nenhum produto encontrado para “{q}”.</p>}
      </div>
      {sections.map(({ c, items }) => <Section key={c.id} cat={c} items={items} q={dq} number={number} order={consoles} />)}
    </div>
  );
}
