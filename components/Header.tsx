import type { Settings } from "@/lib/types";
import { whatsappLink } from "@/lib/links";

const nav = [["Categorias", "#categorias"], ["Loja", "#catalogo"], ["Ofertas", "#ofertas"], ["Contato", "#contato"], ["Localização", "#localizacao"]];

export default function Header({ s }: { s: Settings }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-navy/60 px-5 py-2.5 text-white backdrop-blur-xl">
        <a href="#" className="flex items-center gap-2.5 font-display text-base font-semibold tracking-tight">
          {s.logo_url && <img src={s.logo_url} alt="" className="size-7 rounded-full object-cover" />}{s.store_name}
        </a>
        <nav aria-label="Principal" className="hidden gap-7 text-sm text-white/70 md:flex">
          {nav.map(([l, h]) => <a key={h} href={h} className="transition-colors hover:text-white">{l}</a>)}
        </nav>
        <a href={whatsappLink(s.whatsapp, `Olá! Vim pelo site da ${s.store_name}.`)} target="_blank" rel="noopener noreferrer"
           className="rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-95">WhatsApp</a>
      </div>
    </header>
  );
}
