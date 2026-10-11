import Image from "next/image";
import type { Product } from "@/lib/types";
import type { CardVariant } from "@/lib/utils";
import { whatsappLink } from "@/lib/links";

// Celular: cards menores, para caber mais coisas na tela (como no computador). Jogos: capa em pé. Consoles e acessórios: seguem o formato da foto.
const look: Record<CardVariant, { box: string; sizes: string }> = {
  game: { box: "w-[42vw] max-w-[190px] sm:w-[340px] sm:max-w-none", sizes: "(max-width:640px) 42vw, 340px" },
  console: { box: "w-[62vw] max-w-[280px] sm:w-[400px] sm:max-w-none", sizes: "(max-width:640px) 62vw, 400px" },
  accessory: { box: "w-[40vw] max-w-[180px] sm:w-[300px] sm:max-w-none", sizes: "(max-width:640px) 40vw, 300px" },
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
    <article className={`flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white sm:rounded-4xl ${look[variant].box}`}>
      <Photo p={p} variant={variant} />
      <div className="flex flex-1 flex-col gap-1 p-3 sm:gap-2 sm:p-6">
        {p.platforms.length > 0 && <p className="truncate text-[11px] text-signal sm:whitespace-normal sm:text-sm">{p.platforms.join(" · ")}</p>}
        <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug sm:line-clamp-none sm:text-xl">{p.name}</h3>
        {p.description && <p className="line-clamp-2 text-xs text-ink/60 sm:line-clamp-none sm:text-sm">{p.description}</p>}
        {p.price && <p className="font-display text-sm font-semibold sm:mt-1 sm:text-lg">{p.price}</p>}
        <a href={whatsappLink(number, `Olá! Tenho interesse em ${p.name}${p.platforms.length ? ` (${p.platforms.join(", ")})` : ""}.`)} target="_blank" rel="noopener noreferrer"
           className="mt-2 inline-flex min-h-9 items-center justify-center rounded-full bg-ink px-3 text-xs font-semibold text-white transition-transform active:scale-95 sm:mt-4 sm:min-h-12 sm:px-5 sm:text-sm">
          Pedir no WhatsApp
        </a>
      </div>
    </article>
  );
}
