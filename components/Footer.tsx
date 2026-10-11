import type { Settings } from "@/lib/types";

export default function Footer({ s }: { s: Settings }) {
  return (
    <footer className="bg-navy px-4 py-8 text-white sm:px-6 sm:py-14">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 sm:flex-row sm:items-end sm:gap-6">
        <div className="flex items-center gap-3">
          {s.logo_url && <img src={s.logo_url} alt="" className="size-10 rounded-full object-cover sm:size-12" />}
          <div><p className="font-display text-xl font-semibold sm:text-2xl">{s.store_name}</p><p className="mt-1 text-xs text-white/50 sm:text-sm">{s.tagline}</p></div>
        </div>
        <p className="text-xs text-white/40 sm:text-sm">© {new Date().getFullYear()} {s.store_name}</p>
      </div>
    </footer>
  );
}
