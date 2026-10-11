import type { CategoryWithSlug } from "@/lib/utils";
import Reveal from "./Reveal";

export default function Categories({ categories }: { categories: CategoryWithSlug[] }) {
  if (!categories.length) return null;
  return (
    <section id="categorias" className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
      <Reveal><h2 className="max-w-xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">O que você encontra na loja</h2></Reveal>
      <div className="mt-14 grid gap-4 sm:grid-cols-6">
        {categories.map((c, i) => (
          <Reveal key={c.id} delay={i * 80} className={i % 4 === 0 || i % 4 === 3 ? "sm:col-span-4" : "sm:col-span-2"}>
            <a href={`#${c.slug}`} className={`group flex h-full min-h-48 flex-col justify-between rounded-4xl p-8 transition-colors ${i % 3 === 0 ? "bg-navy text-white" : "bg-white hover:bg-white/60"}`}>
              <h3 className="font-display text-2xl font-semibold">{c.name}</h3>
              <p className={`mt-10 max-w-xs text-sm ${i % 3 === 0 ? "text-white/60" : "text-ink/60"}`}>{c.text}</p>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
