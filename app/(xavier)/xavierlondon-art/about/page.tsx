"use client";

// app/(xavier)/xavierlondon-art/about/page.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function XavierAboutPage() {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { setTimeout(() => setRevealed(true), 80); }, []);

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a]"
      style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.7s ease" }}>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-8 md:px-16 pt-20 pb-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-[9px] tracking-[0.6em] uppercase text-[#1a1a1a]/30 mb-6"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            Xavier London Art
          </p>
          <h1 className="text-[clamp(2.8rem,6vw,5rem)] font-light text-[#1a1a1a] leading-[1.05] mb-10"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            The Practice
          </h1>
          <div className="h-px w-16 bg-[#1a1a1a]/20 mb-10" />
          <p className="text-base font-light text-[#1a1a1a]/55 leading-[1.9]"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            Xavier London is an artist working across painting, mixed media, and
            considered clothing. The practice centres on materiality — how surfaces
            hold memory, how layers accumulate meaning, how objects carry history
            without announcing it.
          </p>
        </div>

        {/* Portrait */}
        <div className="relative aspect-[3/4] bg-[#e5e0d8] overflow-hidden">
          <Image
            src="/artwork/xlart.jpg"
            alt="Xavier London"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Fallback text if portrait.jpg missing */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/15"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Portrait
            </span>
          </div>
        </div>
      </section>

      {/* ── Statement ── */}
      <section className="bg-[#f0ece4] border-t border-[#1a1a1a]/8">
        <div className="max-w-3xl mx-auto px-8 md:px-16 py-28">
          <p className="text-[9px] tracking-[0.6em] uppercase text-[#1a1a1a]/30 mb-10"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            — Statement
          </p>
          <blockquote className="text-[clamp(1.4rem,3vw,2rem)] font-light text-[#1a1a1a]/80 leading-[1.55] italic"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            "I'm interested in what a surface can hold — not as record but as
            presence. Each piece begins as a negotiation between material and intent,
            and ends when the work tells me to stop."
          </blockquote>
          <p className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 mt-8">
            — Xavier London
          </p>
        </div>
      </section>

      {/* ── Practice detail ── */}
      <section className="max-w-6xl mx-auto px-8 md:px-16 py-28 border-t border-[#1a1a1a]/8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">

          <div>
            <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/30 mb-6"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Painting
            </p>
            <p className="text-sm font-light text-[#1a1a1a]/50 leading-[1.9]"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              The large-scale works begin with direct mark-making before any
              conception of image. Oil and acrylic are layered until a surface
              emerges that feels earned rather than made.
            </p>
          </div>

          <div>
            <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/30 mb-6"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Objects
            </p>
            <p className="text-sm font-light text-[#1a1a1a]/50 leading-[1.9]"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Prints, multiples, and editions extend the language of the
              paintings into forms that can be lived with. Limited in number.
              Always tied to a specific body of work.
            </p>
          </div>

          <div>
            <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/30 mb-6"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Clothing
            </p>
            <p className="text-sm font-light text-[#1a1a1a]/50 leading-[1.9]"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Garments as a secondary surface. The same consideration applied
              to cut, weight, and finish as to canvas. Nothing produced for
              its own sake.
            </p>
          </div>

        </div>
      </section>

      {/* ── Contact / Commissions ── */}
      <section className="bg-[#f0ece4] border-t border-[#1a1a1a]/8">
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[9px] tracking-[0.6em] uppercase text-[#1a1a1a]/30 mb-5"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Commissions & Inquiries
            </p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-light text-[#1a1a1a] leading-tight mb-8"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              For studio inquiries, commission requests, or press.
            </h2>
            <a href="mailto:xavierlondonart@xavierlondon.art"
              className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/45 hover:text-[#1a1a1a] transition-colors duration-300 border-b border-[#1a1a1a]/20 pb-0.5">
              xavierlondonart@xavierlondon.art
            </a>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/25 mb-2"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                Based in
              </p>
              <p className="text-sm font-light text-[#1a1a1a]/55"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                United States
              </p>
            </div>
            <div>
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/25 mb-2"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                Available for
              </p>
              <p className="text-sm font-light text-[#1a1a1a]/55"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                Commissions · Editorial · Residencies · Press
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-8 md:px-16 py-20 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-[#1a1a1a]/8">
        <p className="text-[clamp(1.2rem,2.5vw,1.8rem)] font-light text-[#1a1a1a]/55"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          View available works.
        </p>
        <Link href="/xavierlondon-art/shop"
          className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/50 border border-[#1a1a1a]/20 px-8 py-3.5 hover:bg-[#1a1a1a] hover:text-[#f7f4ef] hover:border-[#1a1a1a] transition-all duration-300"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Collections →
        </Link>
      </section>

    </div>
  );
}
