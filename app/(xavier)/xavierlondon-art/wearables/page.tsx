// app/(xavier)/xavierlondon-art/wearables/page.tsx
// Coming soon — no inventory yet.

import Link from "next/link";

export const metadata = { title: "Wearables — Xavier London Art" };

export default function WearablesPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a] flex flex-col">

      {/* Top context */}
      <div className="max-w-6xl mx-auto px-8 md:px-16 pt-20 pb-14 border-b border-[#1a1a1a]/8 w-full">
        <p className="text-[9px] tracking-[0.6em] uppercase text-[#1a1a1a]/28 mb-3"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>Xavier London</p>
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light text-[#1a1a1a] leading-none"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>Wearables</h1>
      </div>

      {/* Coming soon body */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-32 text-center">
        <p className="text-[clamp(2rem,6vw,5rem)] font-light text-[#1a1a1a]/8 leading-none mb-12 select-none"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Coming soon.
        </p>
        <div className="h-px w-16 bg-[#1a1a1a]/12 mb-12" />
        <p className="text-sm font-light text-[#1a1a1a]/42 leading-relaxed max-w-md mb-10"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Considered clothing made from premium materials.
          Minimal branding — a small cursive signature, nothing more.
          Built for a dinner meeting or a late evening without adjustment.
        </p>
        <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/28 mb-8"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Quarter-zips · Polos · Workwear jackets
        </p>
        <p className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/22 mb-12"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Subscribe below to be notified when the first pieces drop.
        </p>
        <Link href="/xavierlondon-art"
          className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors duration-300"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          ← Back to home
        </Link>
      </div>

    </div>
  );
}
