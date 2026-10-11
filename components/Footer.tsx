import type { Settings } from "@/lib/types";

export default function Footer({ s }: { s: Settings }) {
  return (
    <footer className="bg-navy px-6 py-14 text-white">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="flex items-center gap-3">
          {s.logo_url && <img src={s.logo_url} alt="" className="size-12 rounded-full object-cover" />}
          <div><p className="font-display text-2xl font-semibold">{s.store_name}</p><p className="mt-1 text-sm text-white/50">{s.tagline}</p></div>
        </div>
        <p className="text-sm text-white/40">© {new Date().getFullYear()} {s.store_name}</p>
      </div>
    </footer>
  );
}
