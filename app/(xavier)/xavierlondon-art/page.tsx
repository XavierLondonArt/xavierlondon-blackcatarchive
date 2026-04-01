"use client";

// app/(xavier)/xavierlondon-art/page.tsx
// All content pulled from Sanity. No hardcoded data.

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

function imgUrl(ref: string, projectId: string, w = 800) {
  return `https://cdn.sanity.io/images/${projectId}/production/${
    ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
  }?w=${w}&auto=format`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function XavierHomePage() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
  const [pieces, setPieces]       = useState<any[]>([]);
  const [journals, setJournals]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeHero, setActiveHero] = useState(0);

  // Cycle hero image through all pieces
  useEffect(() => {
    if (pieces.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHero(i => (i + 1) % pieces.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [pieces.length]);

  useEffect(() => {
    const base = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/production`;
    const artQ = encodeURIComponent(
      `*[_type=="product"&&brand=="xavier"&&category in ["art","reproduction"]]|order(featured desc,_createdAt desc)[0..5]{_id,title,slug,category,price,medium,year,images[0]{asset{_ref}},inventory,isOneOfOne}`
    );
    const journalQ = encodeURIComponent(
      `*[_type=="manuscript"&&brand=="xavier"]|order(publishedAt desc)[0..2]{_id,title,slug,excerpt,publishedAt,coverImage{asset{_ref}}}`
    );
    Promise.all([
      fetch(`${base}?query=${artQ}`).then(r => r.json()),
      fetch(`${base}?query=${journalQ}`).then(r => r.json()),
    ])
      .then(([a, j]) => {
        setPieces(a.result ?? []);
        setJournals(j.result ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a]">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex flex-col justify-end px-8 md:px-16 pb-20 overflow-hidden">

        {/* Hero images — all mounted, only active one visible for smooth crossfade */}
        {!loading && pieces.length > 0 && (() => {
          const hasSrc = pieces.some(p => p.images?.asset?._ref);
          if (!hasSrc) return null;
          return (
            <div className="absolute inset-0 z-0">
              {pieces.map((p, i) => {
                const s = p.images?.asset?._ref
  ? imgUrl(p.images.asset._ref, projectId, 1200)  // was 1600
  : null;
                if (!s) return null;
                return (
                  <Image
  key={p._id}
  src={s}
  alt={p.title}
  fill
  unoptimized
  className="object-cover absolute inset-0 transition-opacity duration-1000 ease-in-out"
  style={{ opacity: i === activeHero ? 0.70 : 0 }}
  priority={i === 0}
/>
                );
              })}
              {/* Gradient: dark at bottom for text legibility, lighter at top */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(247,244,239,0.96) 0%, rgba(247,244,239,0.55) 50%, rgba(247,244,239,0.25) 100%)",
                }}
              />
            </div>
          );
        })()}

        {/* Fallback warm wash when no image */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 60% 30%, rgba(210,195,175,0.22) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <p
            className="text-[9px] tracking-[0.7em] uppercase text-[#1a1a1a]/28 mb-8"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
          >
            Xavier London Art
          </p>
          <h1
            className="text-[clamp(3.5rem,10vw,9rem)] font-light text-[#1a1a1a] leading-[0.92] mb-12"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
          >
            Work made<br /><em className="italic">in the space</em><br />between.
          </h1>

          {/* Hero piece credit — tracks active piece */}
          {!loading && pieces.length > 0 && (
            <p
              className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/28 mb-8 -mt-6"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
            >
              {pieces[activeHero].title}
              {pieces[activeHero].year ? `, ${pieces[activeHero].year}` : ""}
              {pieces.length > 1 && (
                <span className="ml-4 opacity-40">
                  {activeHero + 1} / {pieces.length}
                </span>
              )}
            </p>
          )}

          <div className="flex items-center gap-8">
            <Link
              href="/xavierlondon-art/collections"
              className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/50 border border-[#1a1a1a]/18 px-8 py-3.5 hover:bg-[#1a1a1a] hover:text-[#f7f4ef] hover:border-[#1a1a1a] transition-all duration-300"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
            >
              View collections
            </Link>
            <Link
              href="/xavierlondon-art/fine-art"
              className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/35 hover:text-[#1a1a1a] transition-colors duration-300"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
            >
              Available works →
            </Link>
          </div>
        </div>

        {/* Hero dots indicator — only shown when multiple pieces */}
        {!loading && pieces.length > 1 && (
          <div className="absolute bottom-8 left-8 md:left-16 flex items-center gap-2 z-10">
            {pieces.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveHero(i)}
                className="transition-all duration-300"
                style={{
                  width:         i === activeHero ? "20px" : "4px",
                  height:        "1px",
                  background:    `rgba(26,26,26,${i === activeHero ? 0.4 : 0.18})`,
                }}
                aria-label={`View piece ${i + 1}`}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-8 right-8 md:right-16 flex flex-col items-center gap-3 z-10">
          <span className="text-[7px] tracking-[0.5em] uppercase text-[#1a1a1a]/22 [writing-mode:vertical-lr]">
            Scroll
          </span>
          <div className="w-px h-8 bg-[#1a1a1a]/18 animate-[grow_1.8s_ease-in-out_infinite]" />
        </div>
      </section>

      {/* ── Featured works ── */}
      <section className="border-t border-[#1a1a1a]/8 py-28 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-16">
            <div>
              <p
                className="text-[9px] tracking-[0.55em] uppercase text-[#1a1a1a]/30 mb-2"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
              >
                Selected works
              </p>
              <h2
                className="text-[clamp(1.8rem,4vw,2.8rem)] font-light text-[#1a1a1a] leading-tight"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
              >
                Current Collection
              </h2>
            </div>
            <Link
              href="/xavierlondon-art/fine-art"
              className="hidden md:block text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/35 hover:text-[#1a1a1a] transition-colors duration-300"
            >
              View all →
            </Link>
          </div>

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-[#ede9e2] animate-pulse ${i % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/3]"}`}
                />
              ))}
            </div>
          )}

          {!loading && pieces.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pieces.map((piece, i) => {
                const src  = piece.images?.asset?._ref ? imgUrl(piece.images.asset._ref, projectId) : null;
                const sold = piece.inventory === 0 && !piece.isOneOfOne;
                return (
                  <Link
                    key={piece._id}
                    href={`/xavierlondon-art/shop/${piece.slug?.current}`}
                    className="group block"
                  >
                    <div
                      className={`relative overflow-hidden bg-[#e5e0d8] mb-4 ${
                        i % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/3]"
                      }`}
                    >
                      {src ? (
                        <Image
                          src={src}
                          alt={piece.title}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          style={{ opacity: sold ? 0.4 : 0.88 }}
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[8px] tracking-wider uppercase text-[#1a1a1a]/15">XLA</span>
                        </div>
                      )}
                      {sold && (
                        <div className="absolute inset-0 bg-[#f7f4ef]/50 flex items-center justify-center">
                          <span className="text-[8px] tracking-[0.5em] uppercase text-[#1a1a1a]/38 border border-[#1a1a1a]/15 px-3 py-1.5">
                            Acquired
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="text-base font-light text-[#1a1a1a] leading-snug group-hover:opacity-55 transition-opacity duration-300"
                        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                      >
                        {piece.title}
                      </h3>
                      {piece.year && (
                        <span className="text-[9px] text-[#1a1a1a]/30 whitespace-nowrap mt-0.5">
                          {piece.year}
                        </span>
                      )}
                    </div>
                    {piece.medium && (
                      <p
                        className="text-xs text-[#1a1a1a]/30 mt-0.5"
                        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                      >
                        {piece.medium}
                      </p>
                    )}
                    <p
                      className="text-xs text-[#1a1a1a]/42 mt-2 font-light"
                      style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                    >
                      {piece.isOneOfOne ? "Inquiry only" : sold ? "—" : `$${piece.price?.toLocaleString()}`}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}

          {!loading && pieces.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p
                className="text-[clamp(1.2rem,3vw,2rem)] font-light text-[#1a1a1a]/15 mb-4"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
              >
                New works arriving soon.
              </p>
              <p className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/18">
                Mark pieces as Featured in Sanity Studio to display them here
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── About strip ── */}
      <section className="border-t border-[#1a1a1a]/8 py-28 px-8 md:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p
              className="text-[9px] tracking-[0.55em] uppercase text-[#1a1a1a]/30 mb-5"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
            >
              The Practice
            </p>
            <h2
              className="text-[clamp(1.8rem,4vw,3rem)] font-light text-[#1a1a1a] leading-snug mb-8"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
            >
              Work made in the space between intention and accident.
            </h2>
            <p
              className="text-base font-light text-[#1a1a1a]/48 leading-relaxed mb-8"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
            >
              Xavier London is an artist working across painting, mixed media, and considered clothing.
              The practice centres on materiality — how surfaces hold memory, how layers accumulate meaning.
            </p>
            <Link
              href="/xavierlondon-art/about"
              className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/38 hover:text-[#1a1a1a] transition-colors duration-300"
            >
              Read more →
            </Link>
          </div>
          <div className="relative aspect-[3/4] bg-[#e5e0d8] overflow-hidden">
            <Image
              src="/28bday.jpg"
              alt="Xavier London"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/15"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
              >
                Portrait
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Journal previews ── */}
      <section className="border-t border-[#1a1a1a]/8 py-28 px-8 md:px-16 bg-[#f0ece4]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-16">
            <div>
              <p className="text-[9px] tracking-[0.55em] uppercase text-[#1a1a1a]/30 mb-2">Writing</p>
              <h2
                className="text-[clamp(1.8rem,4vw,2.8rem)] font-light text-[#1a1a1a]"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
              >
                Journal
              </h2>
            </div>
            <Link
              href="/xavierlondon-art/journals"
              className="hidden md:block text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/35 hover:text-[#1a1a1a] transition-colors duration-300"
            >
              All entries →
            </Link>
          </div>

          {!loading && journals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]/8">
              {journals.map((entry) => {
                const coverSrc = entry.coverImage?.asset?._ref
                  ? imgUrl(entry.coverImage.asset._ref, projectId, 600)
                  : null;
                return (
                  <Link
                    key={entry._id}
                    href={`/xavierlondon-art/journals/${entry.slug?.current}`}
                    className="group block bg-[#f0ece4] hover:bg-[#ede9e2] transition-colors duration-300"
                  >
                    {coverSrc && (
                      <div className="relative aspect-[16/9] overflow-hidden bg-[#e5e0d8]">
                        <Image
                          src={coverSrc}
                          alt={entry.title}
                          fill
                          className="object-cover opacity-78 group-hover:opacity-95 group-hover:scale-[1.03] transition-all duration-700"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <p className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/25 mb-4">
                        {entry.publishedAt ? formatDate(entry.publishedAt) : "—"}
                      </p>
                      <h3
                        className="text-xl font-light text-[#1a1a1a] leading-snug mb-4 group-hover:opacity-58 transition-opacity duration-300"
                        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                      >
                        {entry.title}
                      </h3>
                      {entry.excerpt && (
                        <p
                          className="text-sm font-light text-[#1a1a1a]/40 leading-relaxed line-clamp-2"
                          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                        >
                          {entry.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]/8">
              {["On the persistence of linen", "A note on unfinished things", "Colour as material"].map((t) => (
                <div key={t} className="bg-[#f0ece4] p-8">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/15 mb-4">—</p>
                  <h3
                    className="text-xl font-light text-[#1a1a1a]/18 leading-snug"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                  >
                    {t}
                  </h3>
                </div>
              ))}
            </div>
          )}
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