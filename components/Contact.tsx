import type { Settings } from "@/lib/types";
import { whatsappLink } from "@/lib/links";
import Reveal from "./Reveal";

export default function Contact({ s }: { s: Settings }) {
  return (
    <section id="contato" className="cv mx-auto max-w-6xl px-6 pb-28 sm:pb-36">
      <Reveal>
        <div className="rounded-4xl bg-signal px-8 py-16 text-white sm:px-16 sm:py-24">
          <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Procurando um jogo ou console? Pergunte à loja.</h2>
          <a href={whatsappLink(s.whatsapp, `Olá! Vim pelo site da ${s.store_name}.`)} target="_blank" rel="noopener noreferrer"
             className="mt-10 inline-flex min-h-14 items-center rounded-full bg-white px-8 font-semibold text-ink transition-transform active:scale-95">Chamar no WhatsApp</a>
          {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="ml-4 text-sm underline underline-offset-4">Instagram</a>}
        </div>
      </Reveal>
    </section>
  );
}
