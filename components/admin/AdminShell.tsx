"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/app/admin/actions";

const items = [["/admin", "Produtos"], ["/admin/categorias", "Categorias"], ["/admin/consoles", "Consoles"], ["/admin/loja", "Loja e Hero"]];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(), router = useRouter();
  async function out() { await logout(); router.replace("/admin/login"); router.refresh(); }
  return (
    <div className="min-h-svh bg-porcelain md:flex">
      <aside className="bg-navy p-4 text-white md:sticky md:top-0 md:h-svh md:w-64 md:p-6">
        <p className="px-2 font-display text-lg font-semibold md:mb-10">Painel</p>
        <nav className="mt-3 flex gap-2 overflow-x-auto md:mt-0 md:flex-col">
          {items.map(([h, l]) => (
            <Link key={h} href={h} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm transition ${path === h ? "bg-white text-ink" : "text-white/70 hover:bg-white/10"}`}>{l}</Link>
          ))}
          <a href="/" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap rounded-full px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 md:mt-6">Ver site ↗</a>
          <button onClick={out} className="whitespace-nowrap rounded-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/10">Sair</button>
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-5xl p-5 sm:p-10">{children}</main>
    </div>
  );
}
