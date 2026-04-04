"use client";

// components/blackcat/BlackCatHomeContent.tsx
// Fully Sanity-driven — no hardcoded products or episodes.

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link"
import { ArchiveCard } from "./ArchiveCard";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SanityProduct {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  inventory: number;
  images: Array<{ asset: { _ref: string } }>;
  isArchiveDrop: boolean;
  featured: boolean;
  shortDescription?: string;
  hoverLore?: string;
  archiveFileNumber?: string;
  unitRange?: string;
}

interface SanityEpisode {
  _id: string;
  title: string;
  slug: { current: string };
  season: number;
  episode: number;
  youtubeUrl?: string;
  thumbnail?: { asset: { _ref: string } };
  description?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;

function sanityFetch(query: string) {
  // Sanity query API — different host from image CDN
  return fetch(
    `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/production?query=${encodeURIComponent(query)}`
  ).then(r => r.json()).then(d => d.result ?? []);
}

function imgUrl(ref: string, w = 800) {
  return `https://cdn.sanity.io/images/${PROJECT_ID}/production/${
    ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
  }?auto=format&w=${w}`;
}

function ytThumb(url?: string) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
}

// ── Component ─────────────────────────────────────────────────────────────────

// ── HomeDropCard — cycling images + sealed overlay, matches shop page cards ──

function HomeDropCard({ product }: { product: SanityProduct }) {
  const [imgIdx, setImgIdx]   = useState(0);
  const [imgFade, setImgFade] = useState(true);
  const [hovered, setHovered] = useState(false);
  const cycleRef              = useRef<ReturnType<typeof setInterval> | null>(null);
  const sealed                = product.inventory === 0;
  const images                = product.images ?? [];

  useEffect(() => {
    if (!hovered || images.length <= 1) {
      if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
      if (!hovered) { setImgIdx(0); setImgFade(true); }
      return;
    }
    cycleRef.current = setInterval(() => {
      setImgFade(false);
      setTimeout(() => { setImgIdx(i => (i + 1) % images.length); setImgFade(true); }, 220);
    }, 1600);
    return () => { if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; } };
  }, [hovered, images.length]);

  const currentImg = images[imgIdx]?.asset?._ref
    ? imgUrl(images[imgIdx].asset._ref, 600)
    : null;

  return (
    <Link
      href={`/blackcatarchive/shop/${product.slug?.current}`}
      className="group relative overflow-hidden bg-[#272727] aspect-[3/4] block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {currentImg ? (
        <img src={currentImg} alt={product.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity:    imgFade ? (sealed ? 0.3 : hovered ? 0.85 : 0.65) : 0,
            transform:  hovered && !sealed ? "scale(1.03)" : "scale(1)",
            transition: imgFade ? "opacity 0.35s ease, transform 0.7s ease" : "opacity 0.2s ease",
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[3rem] text-white/4 select-none"
            style={{ fontFamily: "'Bebas Neue',sans-serif" }}>BCA</span>
        </div>
      )}

      {hovered && !sealed && images.length > 1 && (
        <div className="absolute top-3 right-3 z-10 flex gap-1">
          {images.map((_, i) => (
            <span key={i} className="block rounded-full transition-all duration-300"
              style={{
                width: i === imgIdx ? "10px" : "4px", height: "4px",
                background: i === imgIdx ? "rgba(232,228,223,0.6)" : "rgba(232,228,223,0.15)",
              }} />
          ))}
        </div>
      )}

      {hovered && !sealed && images.length > 1 && (
        <div className="absolute bottom-14 left-3 z-10">
          <span className="text-[7px] tracking-[0.4em] uppercase text-white/40 bg-black/50 px-2 py-0.5"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            {imgIdx === 0 ? "Front" : imgIdx === 1 ? "Back" : `View ${imgIdx + 1}`}
          </span>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 55%)" }} />

      {sealed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
          style={{ background: "rgba(8,8,8,0.72)", backdropFilter: "blur(1px)" }}>
          <div className="flex items-center justify-center mb-2"
            style={{ width: "52px", height: "52px", border: "1px solid rgba(180,15,15,0.3)", borderRadius: "50%" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="6" y1="6" x2="18" y2="18" stroke="rgba(180,15,15,0.55)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="18" y1="6" x2="6"  y2="18" stroke="rgba(180,15,15,0.55)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-[clamp(0.9rem,2vw,1.1rem)] text-white/45 leading-none"
            style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.2em" }}>
            Sealed
          </p>
        </div>
      )}

      <div className="absolute top-4 left-4 z-10">
        <span className="text-[8px] tracking-[0.4em] uppercase px-2.5 py-1 border"
          style={{
            fontFamily:  "'Courier Prime',monospace",
            borderColor: sealed ? "rgba(180,15,15,0.25)" : "rgba(255,255,255,0.35)",
            color:       sealed ? "rgba(180,15,15,0.5)"  : "rgba(255,255,255,0.8)",
          }}>
          {sealed ? "Sealed" : "Live"}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <p className="text-[8px] tracking-[0.4em] uppercase text-white/30 mb-1.5"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          ${product.price}
        </p>
        <h3 className="text-2xl text-white leading-tight"
          style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.02em" }}>
          {product.title}
        </h3>
      </div>
    </Link>
  );
}


export function BlackCatHomeContent() {
  const [featuredDrop, setFeaturedDrop]   = useState<SanityProduct | null>(null);
  const [recentDrops, setRecentDrops]     = useState<SanityProduct[]>([]);
  const [episodes, setEpisodes]           = useState<SanityEpisode[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([
      // Featured drop: first featured archive drop, or first featured product
      sanityFetch(
        `*[_type=="product"&&brand=="blackcat"&&featured==true]|order(_createdAt asc)[0]{
          _id,title,slug,price,inventory,
          images[]{asset{_ref}},
          isArchiveDrop,featured,shortDescription,
          hoverLore,archiveFileNumber,unitRange
        }`
      ),
      // Recent drops: up to 3 featured products for the homepage grid
      sanityFetch(
        `*[_type=="product"&&brand=="blackcat"&&featured==true]|order(_createdAt desc)[0...3]{
          _id,title,slug,price,inventory,
          images[]{asset{_ref}},
          isArchiveDrop,featured,shortDescription,
          hoverLore,archiveFileNumber,unitRange
        }`
      ),
      // Latest 3 Archive TV episodes
      sanityFetch(
        `*[_type=="archiveTv"]|order(season desc,episode desc)[0...3]{
          _id,title,slug,season,episode,youtubeUrl,thumbnail,description
        }`
      ),
    ])
      .then(([hero, drops, eps]) => {
        setFeaturedDrop(Array.isArray(hero) ? hero[0] ?? null : hero ?? null);
        setRecentDrops(drops);
        setEpisodes(eps);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const heroImg = featuredDrop?.images?.[0]?.asset?._ref
    ? imgUrl(featuredDrop.images[0].asset._ref, 1200)
    : null;

  return (
    <div>

      {/* ══════════════════════════════════════════════════════════════════
          HERO — looping video + featured drop overlay
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] flex flex-col items-start justify-end px-6 md:px-12 pb-16 overflow-hidden bg-[#272727]">

        {/* Looping hero video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/blackcat-hero.mp4"
          autoPlay muted loop playsInline preload="auto"
          aria-hidden="true"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: [
            "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.1) 100%)",
            "linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 60%)",
          ].join(", "),
        }} />

        {/* Hero content — driven by first featured product in Sanity */}
        <div className="relative z-10 max-w-sm">
          {loading ? (
            <p className="text-[8px] tracking-[0.5em] uppercase text-white/20"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              Loading...
            </p>
          ) : featuredDrop ? (
            <>
              <p className="text-[8px] tracking-[0.7em] uppercase text-white/35 mb-3"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                {featuredDrop.inventory > 0
                  ? `New drop — ${featuredDrop.inventory} units remaining`
                  : "Archive sealed"}
              </p>
              <h2
                className="text-[clamp(2rem,5vw,3.5rem)] text-white leading-none mb-4"
                style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.02em" }}
              >
                {featuredDrop.title}
              </h2>
              <p className="text-xs text-white/40 leading-relaxed mb-8 max-w-xs"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                {featuredDrop.inventory > 0
                  ? (featuredDrop.shortDescription ?? `${featuredDrop.inventory} units available.`)
                  : "This archive file has been sealed."}
              </p>
              <div className="flex items-center gap-6">
                {featuredDrop.inventory > 0 ? (
                  <Link href={`/blackcatarchive/shop/${featuredDrop.slug?.current}`}
                    className="group relative border border-white/30 px-10 py-3.5 text-[10px] tracking-[0.4em] uppercase text-white overflow-hidden transition-colors duration-300"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    <span className="relative z-10 group-hover:text-black transition-colors duration-250">
                      Shop now — ${featuredDrop.price}
                    </span>
                    <span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                  </Link>
                ) : (
                  <span className="border border-white/10 px-10 py-3.5 text-[10px] tracking-[0.4em] uppercase text-white/20"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    Sealed
                  </span>
                )}
                <Link href="/blackcatarchive/drops"
                  className="text-[10px] tracking-[0.35em] uppercase text-white/35 hover:text-white transition-colors duration-200"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  Archive Records →
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-[8px] tracking-[0.7em] uppercase text-white/35 mb-4"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                Something is coming
              </p>
              <h2 className="text-[clamp(3rem,8vw,5.5rem)] text-white leading-none mb-6"
                style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
                Black Cat Archive
              </h2>
              <Link href="/blackcatarchive/shop"
                className="text-[10px] tracking-[0.35em] uppercase text-white/35 hover:text-white transition-colors duration-200"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                Browse Archive →
              </Link>
            </>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 md:right-12 z-10 flex flex-col items-center gap-2 opacity-25">
          <div className="w-px h-10 bg-white animate-[scrollpulse_2s_ease-in-out_infinite]" />
          <span className="text-[7px] tracking-[0.5em] uppercase text-white"
            style={{ fontFamily: "'Courier Prime',monospace", writingMode: "vertical-rl" }}>
            Scroll
          </span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ARCHIVE RECORDS — recent featured products from Sanity
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[8px] tracking-[0.6em] uppercase text-white/22 mb-2"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              Releases
            </p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] text-white leading-none"
              style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
              Archive Records
            </h2>
          </div>
          <Link href="/blackcatarchive/drops"
            className="hidden md:block text-[9px] tracking-[0.35em] uppercase text-white/30 hover:text-white transition-colors duration-200"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            View all →
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-[9px] tracking-[0.5em] uppercase text-white/18"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              Loading...
            </p>
          </div>
        )}

        {!loading && recentDrops.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p className="text-[clamp(2rem,5vw,3rem)] text-white/4 leading-none select-none"
              style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
              Coming Soon
            </p>
          </div>
        )}

        {!loading && recentDrops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {recentDrops.map(product =>
              product.isArchiveDrop ? (
                <ArchiveCard
                  key={product._id}
                  fileNumber={product.archiveFileNumber ?? "00"}
                  title={product.title}
                  tagline={product.shortDescription ?? ""}
                  unitRange={product.unitRange ?? ""}
                  hoverLore={product.hoverLore ?? product.shortDescription ?? ""}
                  href={`/blackcatarchive/shop/${product.slug?.current}`}
                  images={product.images ?? []}
                  inventory={product.inventory}
                  price={product.price}
                  status={product.inventory === 0 ? "sold" : "live"}
                  projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
                />
              ) : (
                <HomeDropCard key={product._id} product={product} />
              )
            )}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ARCHIVE TV — latest episodes from Sanity
      ══════════════════════════════════════════════════════════════════ */}
      <section className="border-t border-white/8 px-6 md:px-12 py-24 bg-[#272727]">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[8px] tracking-[0.6em] uppercase text-white/22 mb-2"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              Video
            </p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] text-white leading-none"
              style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
              Archive TV
            </h2>
          </div>
          <Link href="/blackcatarchive/archive-tv"
            className="hidden md:block text-[9px] tracking-[0.35em] uppercase text-white/30 hover:text-white transition-colors duration-200"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            All episodes →
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-[9px] tracking-[0.5em] uppercase text-white/18"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              Loading...
            </p>
          </div>
        )}

        {!loading && episodes.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p className="text-[clamp(1.5rem,4vw,2.5rem)] text-white/4 leading-none select-none"
              style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
              Season 01 Loading
            </p>
          </div>
        )}

        {!loading && episodes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {episodes.map(ep => {
              const thumb = ep.thumbnail?.asset?._ref
                ? imgUrl(ep.thumbnail.asset._ref, 600)
                : ytThumb(ep.youtubeUrl);
              return (
                <Link key={ep._id}
                  href={`/blackcatarchive/archive-tv/${ep.slug?.current}`}
                  className="group relative overflow-hidden bg-[#272727] aspect-video block">

                  {thumb ? (
                    <img src={thumb} alt={ep.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-75 transition-opacity duration-400" />
                  ) : (
                    <div className="absolute inset-0 bg-[#272727]" />
                  )}

                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 60%)" }} />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 border border-white/22 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-0 h-0 ml-0.5"
                        style={{ borderTop:"5px solid transparent", borderBottom:"5px solid transparent", borderLeft:"9px solid rgba(255,255,255,0.75)" }} />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[8px] tracking-widest text-white/28 mb-1"
                      style={{ fontFamily: "'Courier Prime',monospace" }}>
                      S{String(ep.season).padStart(2,"0")}E{String(ep.episode).padStart(2,"0")}
                    </p>
                    <h3 className="text-xl text-white"
                      style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.04em" }}>
                      {ep.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <style>{`
        @keyframes scrollpulse {
          0%,100% { transform: scaleY(0.4); transform-origin: top; opacity: 0.3; }
          50%      { transform: scaleY(1);   transform-origin: top; opacity: 1; }
        }
      `}</style>
    </div>
  );
}