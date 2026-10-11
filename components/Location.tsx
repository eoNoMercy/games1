import type { Settings } from "@/lib/types";
import { directionsLink, mapEmbed, mapsLink } from "@/lib/links";
import Reveal from "./Reveal";

export default function Location({ s }: { s: Settings }) {
  if (!s.address) return null;
  return (
    <section id="localizacao" className="cv mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-36">
      <div className="grid gap-6 sm:gap-10 md:grid-cols-5 md:items-stretch">
        <Reveal className="md:col-span-2">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-5xl">Venha até a loja</h2>
          <address className="mt-4 not-italic text-sm text-ink/70 sm:mt-6 sm:text-base">
            <p>{s.address}</p>
            {s.hours && <p className="mt-1">{s.hours}</p>}
            <div className="mt-5 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
              <a href={directionsLink(s.address)} target="_blank" rel="noopener noreferrer"
                 className="inline-flex min-h-11 items-center rounded-full bg-signal px-5 text-sm font-semibold text-white transition-transform active:scale-95 sm:min-h-14 sm:px-8 sm:text-base">Como chegar</a>
              <a href={mapsLink(s.maps_url, s.address)} target="_blank" rel="noopener noreferrer"
                 className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition-transform active:scale-95 sm:min-h-14 sm:px-8 sm:text-base">Ver no Google Maps</a>
            </div>
          </address>
        </Reveal>
        <Reveal delay={100} className="md:col-span-3">
          <div className="h-56 overflow-hidden rounded-2xl bg-white sm:h-80 sm:rounded-4xl md:h-full md:min-h-96">
            <iframe title="Localização da loja no Google Maps" src={mapEmbed(s.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="size-full border-0" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
