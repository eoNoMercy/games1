"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type MouseEvent } from "react";

// Comportamento do carrossel: sabe se está no começo/fim (para esmaecer as bordas e habilitar as setas),
// volta ao início quando o filtro muda, e permite arrastar com o mouse sem disparar cliques por engano.
export function useRail(resetKey: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = { start: el.scrollLeft <= 2, end: max <= 2 || el.scrollLeft >= max - 2 };
    setEdge((p) => (p.start === next.start && p.end === next.end ? p : next));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    el.addEventListener("scroll", on, { passive: true });
    const ro = new ResizeObserver(on);
    ro.observe(el);
    el.scrollTo({ left: 0 });
    update();
    return () => { el.removeEventListener("scroll", on); ro.disconnect(); cancelAnimationFrame(raf); };
  }, [resetKey, update]);

  const end = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    if (ref.current) ref.current.style.scrollSnapType = "";
    setTimeout(() => { d.moved = false; }, 80);
  };

  const handlers = {
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
      drag.current = { down: true, x: e.clientX, left: ref.current.scrollLeft, moved: false };
    },
    onPointerMove: (e: PointerEvent) => {
      const d = drag.current, el = ref.current;
      if (!d.down || !el) return;
      const dx = e.clientX - d.x;
      if (!d.moved && Math.abs(dx) > 5) { d.moved = true; el.style.scrollSnapType = "none"; el.setPointerCapture?.(e.pointerId); }
      if (d.moved) el.scrollLeft = d.left - dx;
    },
    onPointerUp: end,
    onPointerCancel: end,
    onClickCapture: (e: MouseEvent) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); } },
  };

  const style = { "--fl": edge.start ? "0px" : "var(--fade)", "--fr": edge.end ? "0px" : "var(--fade)" } as CSSProperties;
  const scroll = (dir: number) => { const el = ref.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" }); };
  return { ref, edge, handlers, style, scroll };
}
