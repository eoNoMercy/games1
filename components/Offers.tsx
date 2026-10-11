import Image from "next/image";
import type { Product } from "@/lib/types";
import { whatsappLink } from "@/lib/links";
import Reveal from "./Reveal";

export default function Offers({ products, number }: { products: Product[]; number: string }) {
  const featured = products.filter((p) => p.featured).slice(0, 6);
  if (!featured.length) return null;
  return (
    <section id="ofertas" className="cv mx-auto max-w-6xl px-6 pb-28 sm:pb-36">
      <Reveal><h2 className="max-w-xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">Destaques da loja</h2></Reveal>
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {featured.map((p, i) => (
          <Reveal key={p.id} delay={i * 90}>
            <a href={whatsappLink(number, `Olá! Quero saber sobre ${p.name}.`)} target="_blank" rel="noopener noreferrer"
               className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-4xl bg-navy p-7 text-white">
              {p.image_url && <Image src={p.image_url} alt="" fill loading="lazy" sizes="(max-width:768px) 100vw, 380px" className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />}
              <div className="relative rounded-2xl bg-navy/60 p-4 backdrop-blur-md">
                <p className="text-sm text-white/60">{p.platforms.join(" · ")}</p>
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                {p.price && <p className="mt-1 font-display text-lg">{p.price}</p>}
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
