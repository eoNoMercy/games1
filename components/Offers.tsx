import Image from "next/image";
import type { Product } from "@/lib/types";
import { whatsappLink } from "@/lib/links";
import Reveal from "./Reveal";

export default function Offers({ products, number }: { products: Product[]; number: string }) {
  const featured = products.filter((p) => p.featured).slice(0, 6);
  if (!featured.length) return null;
  return (
    <section id="ofertas" className="cv mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-36">
      <Reveal><h2 className="max-w-xl font-display text-2xl font-semibold tracking-tight sm:text-5xl">Destaques da loja</h2></Reveal>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 md:grid-cols-3">
        {featured.map((p, i) => (
          <Reveal key={p.id} delay={i * 90}>
            <a href={whatsappLink(number, `Olá! Quero saber sobre ${p.name}.`)} target="_blank" rel="noopener noreferrer"
               className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-navy p-2.5 text-white sm:rounded-4xl sm:p-7">
              {p.image_url && <Image src={p.image_url} alt="" fill loading="lazy" sizes="(max-width:768px) 50vw, 380px" className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />}
              <div className="relative rounded-xl bg-navy/60 p-2.5 backdrop-blur-md sm:rounded-2xl sm:p-4">
                <p className="truncate text-[11px] text-white/60 sm:text-sm">{p.platforms.join(" · ")}</p>
                <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug sm:text-xl">{p.name}</h3>
                {p.price && <p className="mt-0.5 font-display text-sm sm:mt-1 sm:text-lg">{p.price}</p>}
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
