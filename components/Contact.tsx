import type { Settings } from "@/lib/types";
import { whatsappLink } from "@/lib/links";
import Reveal from "./Reveal";

export default function Contact({ s }: { s: Settings }) {
  return (
    <section id="contato" className="cv mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-36">
      <Reveal>
        <div className="rounded-3xl bg-signal px-5 py-10 text-white sm:rounded-4xl sm:px-16 sm:py-24">
          <h2 className="max-w-2xl font-display text-2xl font-semibold leading-tight tracking-tight sm:text-5xl">Procurando um jogo ou console? Pergunte à loja.</h2>
          <a href={whatsappLink(s.whatsapp, `Olá! Vim pelo site da ${s.store_name}.`)} target="_blank" rel="noopener noreferrer"
             className="mt-6 inline-flex min-h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-ink transition-transform active:scale-95 sm:mt-10 sm:min-h-14 sm:px-8 sm:text-base">Chamar no WhatsApp</a>
          {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="ml-4 text-sm underline underline-offset-4">Instagram</a>}
        </div>
      </Reveal>
    </section>
  );
}
