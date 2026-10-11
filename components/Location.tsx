import type { Settings } from "@/lib/types";
import { directionsLink, mapEmbed, mapsLink } from "@/lib/links";
import Reveal from "./Reveal";

export default function Location({ s }: { s: Settings }) {
  if (!s.address) return null;
  return (
    <section id="localizacao" className="cv mx-auto max-w-6xl px-6 pb-28 sm:pb-36">
      <div className="grid gap-10 md:grid-cols-5 md:items-stretch">
        <Reveal className="md:col-span-2">
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Venha até a loja</h2>
          <address className="mt-6 not-italic text-ink/70">
            <p>{s.address}</p>
            {s.hours && <p className="mt-1">{s.hours}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={directionsLink(s.address)} target="_blank" rel="noopener noreferrer"
                 className="inline-flex min-h-14 items-center rounded-full bg-signal px-8 font-semibold text-white transition-transform active:scale-95">Como chegar</a>
              <a href={mapsLink(s.maps_url, s.address)} target="_blank" rel="noopener noreferrer"
                 className="inline-flex min-h-14 items-center rounded-full bg-ink px-8 font-semibold text-white transition-transform active:scale-95">Ver no Google Maps</a>
            </div>
          </address>
        </Reveal>
        <Reveal delay={100} className="md:col-span-3">
          <div className="h-80 overflow-hidden rounded-4xl bg-white md:h-full md:min-h-96">
            <iframe title="Localização da loja no Google Maps" src={mapEmbed(s.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="size-full border-0" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
