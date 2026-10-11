"use client";
import { useEffect, useState } from "react";
import { getAdminData, saveSettings } from "../../actions";
import ImageUpload from "@/components/admin/ImageUpload";
import { useRun } from "@/components/admin/useRun";
import type { Settings } from "@/lib/types";
import { btn, card, inp } from "@/lib/ui";

const text: [keyof Settings, string, number][] = [
  ["store_name", "Nome da loja", 80], ["tagline", "Frase principal (Hero)", 160], ["whatsapp", "WhatsApp (com DDD)", 20],
  ["address", "Endereço completo (rua, número, bairro e cidade). Aparece no mapa do site", 240], ["maps_url", "Link do Google Maps da loja (opcional)", 500],
  ["hours", "Horário de funcionamento", 160], ["instagram", "Link do Instagram (opcional)", 500],
];

export default function StorePage() {
  const [s, setS] = useState<Partial<Settings>>({}), [ok, setOk] = useState(false);
  const load = async () => { const r = await getAdminData(); if (r.ok && r.data) setS(r.data.settings); };
  useEffect(() => { load(); }, []);
  const { busy, run } = useRun(async () => {});
  const set = (k: keyof Settings, v: string) => { setOk(false); setS((x) => ({ ...x, [k]: v })); };
  const save = () => run(() => saveSettings(s), () => setOk(true));

  return (
    <>
      <h1 className="font-display text-3xl font-semibold">Loja e Hero</h1>
      <div className={`${card} mt-6 space-y-4`}>
        <h2 className="font-display font-semibold">Identidade</h2>
        <ImageUpload folder="logo" max={512} label="Logo da loja" round value={s.logo_url} onChange={(u) => set("logo_url", u)} />
        {text.map(([k, l, m]) => (
          <label key={k} className="block text-sm"><span className="mb-1.5 block font-medium">{l}</span>
            <input className={inp} maxLength={m} value={(s[k] as string) ?? ""} onChange={(e) => set(k, e.target.value)} /></label>
        ))}
      </div>
      <div className={`${card} mt-4 space-y-5`}>
        <h2 className="font-display font-semibold">Hero (caixa que abre no scroll)</h2>
        <p className="text-sm text-ink/60">Envie a capa do jogo em pé, no formato de caixa. Para o disco, use uma imagem redonda com fundo transparente. Sem disco, o site usa um padrão.</p>
        <ImageUpload folder="hero" label="Capa do jogo" value={s.hero_cover_url} onChange={(u) => set("hero_cover_url", u)} />
        <ImageUpload folder="hero" label="Arte do disco" round value={s.hero_disc_url} onChange={(u) => set("hero_disc_url", u)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={inp} placeholder="Nome do jogo" maxLength={80} value={s.hero_title ?? ""} onChange={(e) => set("hero_title", e.target.value)} />
          <input className={inp} placeholder="Plataforma" maxLength={40} value={s.hero_platform ?? ""} onChange={(e) => set("hero_platform", e.target.value)} />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button className={btn} onClick={save} disabled={busy}>{busy ? "Salvando..." : "Salvar alterações"}</button>
        {ok && <span className="text-sm text-green-700">Salvo! O site já está atualizado.</span>}
      </div>
    </>
  );
}
