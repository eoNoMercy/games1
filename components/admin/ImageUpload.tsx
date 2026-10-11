"use client";
import { useRef, useState } from "react";
import { uploadImage } from "@/app/admin/actions";
import { btn2 } from "@/lib/ui";

type Dims = { w: number; h: number };
const OK = ["image/jpeg", "image/png", "image/webp"];

async function shrink(file: File, max: number): Promise<{ body: File | Blob; w: number; h: number }> {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/webp", 0.86));
    return { body: blob && blob.size < file.size ? blob : file, w: c.width, h: c.height };
  } catch { return { body: file, w: 0, h: 0 }; }
}

export default function ImageUpload({ value, onChange, folder, label, round, max = 1600 }: { value?: string | null; onChange: (url: string, dims?: Dims) => void; folder: string; label: string; round?: boolean; max?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file?: File) {
    if (!file || busy) return;
    if (!OK.includes(file.type)) return alert("Use uma foto JPG, PNG ou WebP.");
    if (file.size > 25 * 1024 * 1024) return alert("A foto é muito grande.");
    setBusy(true);
    try {
      const { body, w, h } = await shrink(file, max);
      if (body.size > 4 * 1024 * 1024) return alert("A foto precisa ter até 4 MB. Tente uma menor.");
      const fd = new FormData();
      fd.set("file", new File([body], "foto", { type: body.type || file.type }));
      fd.set("folder", folder); fd.set("w", String(w)); fd.set("h", String(h));
      const r = await uploadImage(fd);
      if (!r.ok || !r.data) return alert(r.error ?? "Não foi possível enviar a foto. Tente novamente.");
      onChange(r.data.url, r.data.w > 0 ? { w: r.data.w, h: r.data.h } : undefined);
    } finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  }

  return (
    <div className="flex items-center gap-4">
      <div className={`flex size-24 shrink-0 items-center justify-center overflow-hidden bg-black/5 text-xs text-ink/40 ${round ? "rounded-full" : "rounded-2xl"}`}>
        {value ? <img src={value} alt="" loading="lazy" decoding="async" className="size-full object-cover" /> : "Sem imagem"}
      </div>
      <div className="flex flex-col items-start gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => ref.current?.click()} disabled={busy} className={btn2}>{busy ? "Enviando..." : value ? "Trocar" : "Enviar foto"}</button>
          {value && <button type="button" disabled={busy} onClick={() => onChange("")} className="text-sm text-red-600">Remover</button>}
        </div>
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>
    </div>
  );
}
