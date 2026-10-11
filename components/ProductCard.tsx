import Image from "next/image";
import type { Product } from "@/lib/types";
import type { CardVariant } from "@/lib/utils";
import { whatsappLink } from "@/lib/links";

// Jogos: capa em pé, altura fixa. Consoles e acessórios: a altura acompanha o formato da foto (sem bordas, sem cortes).
const look: Record<CardVariant, { box: string; sizes: string }> = {
  game: { box: "w-[78vw] max-w-[360px] sm:w-[340px]", sizes: "(max-width:640px) 78vw, 340px" },
  console: { box: "w-[84vw] max-w-[400px] sm:w-[400px]", sizes: "(max-width:640px) 84vw, 400px" },
  accessory: { box: "w-[64vw] max-w-[300px] sm:w-[300px]", sizes: "(max-width:640px) 64vw, 300px" },
};

function Photo({ p, variant }: { p: Product; variant: CardVariant }) {
  const { sizes } = look[variant];
  if (!p.image_url) return <div className={`bg-gradient-to-br from-[#dfe4f2] to-[#c5cde6] ${variant === "game" ? "aspect-[5/7]" : "aspect-[4/3]"}`} />;
  if (variant === "game")
    return <div className="relative aspect-[5/7] bg-[#dfe4f2]"><Image src={p.image_url} alt={p.name} fill loading="lazy" sizes={sizes} className="object-cover" /></div>;
  if (p.image_w && p.image_h) {
    const ratio = Math.min(3, Math.max(0.5, p.image_w / p.image_h));
    return <div className="relative bg-[#dfe4f2]" style={{ aspectRatio: ratio }}><Image src={p.image_url} alt={p.name} fill loading="lazy" sizes={sizes} className="object-cover" /></div>;
  }
  // Fotos antigas, sem medida salva: a altura se ajusta ao carregar.
  return <Image src={p.image_url} alt={p.name} width={0} height={0} loading="lazy" sizes={sizes} style={{ width: "100%", height: "auto" }} />;
}

export default function ProductCard({ p, number, variant = "game" }: { p: Product; number: string; variant?: CardVariant }) {
  return (
    <article className={`flex shrink-0 snap-start flex-col overflow-hidden rounded-4xl bg-white ${look[variant].box}`}>
      <Photo p={p} variant={variant} />
      <div className="flex flex-1 flex-col gap-2 p-6">
        {p.platforms.length > 0 && <p className="text-sm text-signal">{p.platforms.join(" · ")}</p>}
        <h3 className="font-display text-xl font-semibold">{p.name}</h3>
        {p.description && <p className="text-sm text-ink/60">{p.description}</p>}
        {p.price && <p className="mt-1 font-display text-lg font-semibold">{p.price}</p>}
        <a href={whatsappLink(number, `Olá! Tenho interesse em ${p.name}${p.platforms.length ? ` (${p.platforms.join(", ")})` : ""}.`)} target="_blank" rel="noopener noreferrer"
           className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition-transform active:scale-95">
          Pedir no WhatsApp
        </a>
      </div>
    </article>
  );
}
