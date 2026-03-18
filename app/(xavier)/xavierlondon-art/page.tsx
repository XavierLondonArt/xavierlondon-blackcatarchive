"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
// ARTWORK DATA — update with your real pieces
// Place images in /public/artwork/piece-01.jpg etc.
// ─────────────────────────────────────────────────────────────────────────────

const ARTWORK = [
  {
    id: 1,
    title: "Untitled No. 7",
    year: "2024",
    medium: "Oil on Canvas",
    dimensions: "48 × 60 in",
    description:
      "An exploration of negative space and the weight of light on fabric. The composition breathes from the edges inward, arriving at a stillness that refuses resolution.",
    image: "/artwork/untitled07.jpg",
    available: true,
    price: "$4,200",
    edition: "Original",
    slug: "untitled-no-7",
  },
  {
    id: 2,
    title: "Study in Amber",
    year: "2024",
    medium: "Acrylic and graphite on panel",
    dimensions: "24 × 36 in",
    description:
      "A departure from the usual palette — amber as the primary language. Graphite interrupts the warmth with geometric hesitation, as if the drawing second-guesses the painting.",
    image: "/artwork/piece-02.jpg",
    available: true,
    price: "$2,800",
    edition: "Original",
    slug: "study-in-amber",
  },
  {
    id: 3,
    title: "Archive III",
    year: "2023",
    medium: "Mixed media on canvas",
    dimensions: "36 × 36 in",
    description:
      "Part of the Archive series. Printed ephemera, paint, and charcoal layered until the original substrate disappears. The piece remembers differently every time you look at it.",
    image: "/artwork/piece-03.jpg",
    available: false,
    price: "Sold",
    edition: "Original",
    slug: "archive-iii",
  },
  {
    id: 4,
    title: "Meridian",
    year: "2023",
    medium: "Ink and watercolour on paper",
    dimensions: "18 × 24 in",
    description:
      "The horizon as a question. Ink bleeds into watercolour along the line where they meet, each resisting absorption at a different rate — a negotiation rather than a blend.",
    image: "/artwork/piece-04.jpg",
    available: true,
    price: "$1,600",
    edition: "Original + 3 prints",
    slug: "meridian",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function XavierHomePage() {
  const [active, setActive] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [autoplay, setAutoplay] = useState(true);

  const goTo = useCallback((index: number) => {
    if (index === active || transitioning) return;
    setTransitioning(true);
    setAutoplay(false);
    setTimeout(() => {
      setActive(index);
      setTransitioning(false);
    }, 500);
  }, [active, transitioning]);

  const goNext = useCallback(() => {
    const next = (active + 1) % ARTWORK.length;
    setTransitioning(true);
    setTimeout(() => {
      setActive(next);
      setTransitioning(false);
    }, 500);
  }, [active, transitioning]);

  // Autoplay
  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(goNext, 6000);
    return () => clearInterval(id);
  }, [autoplay, goNext]);

  const piece = ARTWORK[active];

  return (
    <div>

      {/* ════════════════════════════════════════════════════════════════════
          HERO — Full-screen artwork showcase
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[100svh] overflow-hidden bg-[#ede9e2]">

        {/* ── Images (all stacked, active one fades in) ── */}
        {ARTWORK.map((art, i) => (
          <div
            key={art.id}
            aria-hidden={i !== active}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === active && !transitioning ? 1 : 0 }}
          >
            <Image
              src={art.image}
              alt={art.title}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
            {/* Soft vignette */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(237,233,226,0.85) 0%, rgba(237,233,226,0.2) 50%, rgba(237,233,226,0.05) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(237,233,226,0.6) 0%, transparent 40%)",
              }}
            />
          </div>
        ))}

        {/* ── Left info panel ── */}
        <div className="absolute inset-y-0 left-0 w-full md:w-[42%] flex flex-col justify-end md:justify-center px-8 md:px-16 pb-24 md:pb-0 z-10">

          {/* Piece counter */}
          <div className="flex items-center gap-3 mb-8">
            <span
              className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/35"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              {String(active + 1).padStart(2, "0")} / {String(ARTWORK.length).padStart(2, "0")}
            </span>
            <div className="flex-1 h-px bg-[#1a1a1a]/12 max-w-[60px]" />
          </div>

          {/* Title */}
          <h1
            className="text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-none text-[#1a1a1a] mb-3 transition-opacity duration-500"
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              opacity: transitioning ? 0 : 1,
            }}
          >
            {piece.title}
          </h1>

          {/* Meta */}
          <p
            className="text-sm font-light text-[#1a1a1a]/50 tracking-wider mb-1 transition-opacity duration-500"
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              opacity: transitioning ? 0 : 1,
            }}
          >
            {piece.medium} — {piece.year}
          </p>
          <p
            className="text-xs text-[#1a1a1a]/35 tracking-wide mb-6 transition-opacity duration-500"
            style={{ opacity: transitioning ? 0 : 1 }}
          >
            {piece.dimensions} · {piece.edition}
          </p>

          {/* Description */}
          <p
            className="text-sm md:text-base font-light text-[#1a1a1a]/60 leading-relaxed max-w-sm mb-10 transition-opacity duration-500"
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              opacity: transitioning ? 0 : 1,
            }}
          >
            {piece.description}
          </p>

          {/* CTAs */}
          <div
            className="flex items-center gap-6 transition-opacity duration-500"
            style={{ opacity: transitioning ? 0 : 1 }}
          >
            {piece.available ? (
              <Link
                href={`/xavierlondon-art/shop/${piece.slug}`}
                className="group relative border border-[#1a1a1a]/25 px-8 py-3 text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/60 hover:text-[#f7f4ef] overflow-hidden transition-colors duration-400"
              >
                <span className="relative z-10">Acquire — {piece.price}</span>
                <span className="absolute inset-0 bg-[#1a1a1a] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-400 ease-out" />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] tracking-[0.5em] uppercase text-[#f7f4ef] opacity-0 group-hover:opacity-100 z-20 transition-opacity duration-200">
                  Acquire — {piece.price}
                </span>
              </Link>
            ) : (
              <span className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/25 border border-[#1a1a1a]/12 px-8 py-3">
                Acquired
              </span>
            )}
            <Link
              href={`/xavierlondon-art/shop/${piece.slug}`}
              className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors duration-300"
            >
              View piece →
            </Link>
          </div>

        </div>

        {/* ── Thumbnail navigation — bottom right ── */}
        <div className="absolute bottom-8 right-8 md:right-16 z-10 flex items-end gap-3">
          {ARTWORK.map((art, i) => (
            <button
              key={art.id}
              onClick={() => goTo(i)}
              aria-label={`View ${art.title}`}
              className="group relative overflow-hidden transition-all duration-400"
              style={{
                width: i === active ? "72px" : "48px",
                height: "56px",
              }}
            >
              <Image
                src={art.image}
                alt={art.title}
                fill
                className="object-cover transition-opacity duration-300"
                style={{ opacity: i === active ? 1 : 0.45 }}
                sizes="72px"
              />
              {/* Active indicator */}
              <span
                className="absolute bottom-0 left-0 right-0 h-px bg-[#1a1a1a] transition-opacity duration-300"
                style={{ opacity: i === active ? 1 : 0 }}
              />
            </button>
          ))}
        </div>

        {/* ── Scroll hint ── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 opacity-30">
          <span className="text-[8px] tracking-[0.5em] uppercase" style={{ fontFamily: "'Cormorant Garamond',serif" }}>
            Scroll
          </span>
          <div className="w-px h-8 bg-[#1a1a1a] animate-[grow_1.8s_ease-in-out_infinite]" />
        </div>

      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FEATURED WORKS GRID — below the hero
      ════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-8 md:px-16 py-28">

        <div className="flex items-baseline justify-between mb-16">
          <div>
            <p className="text-[9px] tracking-[0.55em] uppercase text-[#1a1a1a]/35 mb-2">
              Selected Works
            </p>
            <h2
              className="text-[clamp(1.8rem,4vw,2.8rem)] font-light text-[#1a1a1a] leading-tight"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              Current Collection
            </h2>
          </div>
          <Link
            href="/xavierlondon-art/shop"
            className="hidden md:block text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors duration-300"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARTWORK.map((art, i) => (
            <ArtworkCard key={art.id} art={art} index={i} />
          ))}
        </div>

      </section>

      {/* ════════════════════════════════════════════════════════════════════
          ABOUT STRIP
      ════════════════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#1a1a1a]/10 py-28 px-8 md:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          <div>
            <p className="text-[9px] tracking-[0.55em] uppercase text-[#1a1a1a]/35 mb-4">
              The Practice
            </p>
            <h2
              className="text-[clamp(2rem,4vw,3rem)] font-light text-[#1a1a1a] leading-snug mb-8"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              Work made in the space between intention and accident.
            </h2>
            <p className="text-base font-light text-[#1a1a1a]/55 leading-relaxed mb-6" style={{ fontFamily: "'Cormorant Garamond',serif" }}>
              {/* ← Replace with your actual bio */}
              Xavier London is an artist working across painting, mixed media, and
              considered clothing. The practice centres on materiality — how surfaces
              hold memory, how layers accumulate meaning, how objects carry history
              without announcing it.
            </p>
            <Link
              href="/xavierlondon-art/about"
              className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/45 hover:text-[#1a1a1a] transition-colors duration-300"
            >
              Read more →
            </Link>
          </div>

          {/* Placeholder portrait — replace src with your image */}
          <div className="relative aspect-[3/4] bg-[#e5e0d8] overflow-hidden">
            <Image
              src="/artwork/portrait.jpg"
              alt="Xavier London in the studio"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Fallback if image missing */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/20"
                style={{ fontFamily: "'Cormorant Garamond',serif" }}
              >
                Portrait
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          LATEST JOURNALS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#1a1a1a]/10 py-28 px-8 md:px-16 bg-[#f0ece4]">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-baseline justify-between mb-16">
            <div>
              <p className="text-[9px] tracking-[0.55em] uppercase text-[#1a1a1a]/35 mb-2">Writing</p>
              <h2
                className="text-[clamp(1.8rem,4vw,2.8rem)] font-light text-[#1a1a1a]"
                style={{ fontFamily: "'Cormorant Garamond',serif" }}
              >
                Journal
              </h2>
            </div>
            <Link href="/xavierlondon-art/journals" className="hidden md:block text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors duration-300">
              All entries →
            </Link>
          </div>

          {/* Placeholder journal entries — swap with Sanity data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]/10">
            {[
              { title: "On the persistence of linen", date: "March 2024", excerpt: "Why I keep returning to the same support material, and what it gives back." },
              { title: "A note on unfinished things", date: "January 2024", excerpt: "The decision to stop. How a work signals its own completion — or refuses to." },
              { title: "Colour as material", date: "November 2023", excerpt: "Pigment is not paint. On the physical weight of colour and why it matters to the work." },
            ].map((entry) => (
              <Link key={entry.title} href="/xavierlondon-art/journals" className="group block bg-[#f0ece4] p-8 hover:bg-[#ede9e2] transition-colors duration-300">
                <p className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 mb-4">{entry.date}</p>
                <h3 className="text-xl font-light text-[#1a1a1a] leading-snug mb-4 group-hover:opacity-70 transition-opacity duration-300" style={{ fontFamily: "'Cormorant Garamond',serif" }}>
                  {entry.title}
                </h3>
                <p className="text-sm font-light text-[#1a1a1a]/45 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond',serif" }}>
                  {entry.excerpt}
                </p>
              </Link>
            ))}
          </div>

        </div>
      </section>

      <style>{`
        @keyframes grow {
          0%,100% { transform: scaleY(0.3); transform-origin: top; opacity: 0.3; }
          50%      { transform: scaleY(1);   transform-origin: top; opacity: 1; }
        }
      `}</style>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ArtworkCard({ art, index }: { art: typeof ARTWORK[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/xavierlondon-art/shop/${art.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#e5e0d8] mb-4" style={{ aspectRatio: index % 2 === 0 ? "3/4" : "4/3" }}>
        <Image
          src={art.image}
          alt={art.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Availability */}
        {!art.available && (
          <div className="absolute inset-0 bg-[#f7f4ef]/40 flex items-center justify-center">
            <span className="text-[8px] tracking-[0.5em] uppercase text-[#1a1a1a]/40 border border-[#1a1a1a]/15 px-3 py-1.5">
              Acquired
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-base font-light text-[#1a1a1a] leading-snug group-hover:opacity-60 transition-opacity duration-300"
            style={{ fontFamily: "'Cormorant Garamond',serif" }}
          >
            {art.title}
          </h3>
          <span className="text-[9px] tracking-wider text-[#1a1a1a]/40 whitespace-nowrap mt-0.5">
            {art.year}
          </span>
        </div>
        <p className="text-xs text-[#1a1a1a]/35 mt-1 tracking-wide">{art.medium}</p>
        <p className="text-xs text-[#1a1a1a]/50 mt-2 font-light" style={{ fontFamily: "'Cormorant Garamond',serif" }}>
          {art.available ? art.price : "—"}
        </p>
      </div>
    </Link>
  );
}