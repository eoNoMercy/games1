"use client";
import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Settings } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ s }: { s: Settings }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: reduce ? true : 0.6 },
      });
      // Posições relativas (0 a 1) = progresso do scroll. Tudo acompanha o dedo/mouse.
      tl.fromTo(".case3d", { rotateY: -24, rotateX: 10, scale: 0.92 }, { rotateY: 0, rotateX: 4, scale: 1, duration: 1 }, 0)
        .fromTo(".case-shift", { xPercent: 0 }, { xPercent: 50, duration: 0.8 }, 0.1)
        .fromTo(".cover", { rotateY: 0 }, { rotateY: -178, duration: 0.8 }, 0.1)
        .fromTo(".disc", { rotate: 0, scale: 0.94, z: 0 }, { rotate: 420, scale: 1, z: 6, duration: 0.8 }, 0.2)
        .fromTo(".case-shadow", { scaleX: 1, opacity: 0.7 }, { scaleX: 2.1, opacity: 1, duration: 0.8 }, 0.1)
        .fromTo(".hero-copy", { opacity: 1, y: 0 }, { opacity: 0, y: -40, duration: 0.25 }, 0)
        .fromTo(".hero-end", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, 0.8);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-label="Abertura" className="relative h-[320svh] bg-navy text-white">
      <div className="sticky top-0 flex h-svh w-full flex-col items-center justify-center overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_55%,rgba(61,99,255,.28),transparent_70%)]" />

        <div className="hero-copy absolute inset-x-0 top-[13svh] px-4 text-center sm:px-6">
          <h1 className="font-display text-[clamp(1.75rem,7.5vw,6rem)] font-semibold leading-[1.02] tracking-tight">{s.tagline}</h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/60 sm:text-base">Role para abrir a caixa.</p>
        </div>

        <div className="scene relative mt-[14svh]">
          <div className="case-shift">
            <div className="case3d">
              <div className="tray">
                <div className="floor" />
                <div className="wall top" /><div className="wall bottom" /><div className="wall right" />
                <div className="disc-wrap">
                  <div className={`disc${s.hero_disc_url ? " custom" : ""}`} style={s.hero_disc_url ? { backgroundImage: `url(${s.hero_disc_url})` } : undefined} aria-hidden />
                </div>
              </div>
              <div className="spine" aria-hidden>{s.store_name}</div>
              <div className="cover">
                <div className="c-front">
                  <div className="art">
                    {s.hero_cover_url ? (
                      <Image src={s.hero_cover_url} alt={`Capa de ${s.hero_title}`} fill priority sizes="(max-width:768px) 44vw, 400px" className="object-cover" />
                    ) : (
                      <div className="flex h-full flex-col justify-between p-[9%]">
                        <span className="text-[0.7em] text-white/70">{s.hero_platform}</span>
                        <span className="font-display text-[clamp(1.1rem,3.2vw,2.2rem)] font-semibold leading-tight">{s.hero_title}</span>
                      </div>
                    )}
                  </div>
                  <div className="gloss" />
                </div>
                <div className="c-back"><i className="clip a" /><i className="clip b" /></div>
                <div className="c-edge c-top" /><div className="c-edge c-bottom" /><div className="c-edge c-right" />
              </div>
            </div>
          </div>
          <div className="case-shadow" aria-hidden />
        </div>

        <div className="hero-end pointer-events-none absolute inset-x-0 bottom-[7svh] px-6 text-center opacity-0">
          <p className="font-display text-base font-medium sm:text-2xl">Jogos em mídia física, direto na loja.</p>
        </div>
      </div>
    </section>
  );
}
