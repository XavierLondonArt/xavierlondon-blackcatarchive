"use client";

import Link from "next/link";
import Image from "next/image";

const FEATURED_DROPS = [
  { id: 1, title: " Archive_File_001: Gaurdian 001", status: "live" as const,    units: 50,  image: "/Archive_files/Archive_File_001_front.png", slug: "Archive_File_001-Gaurdian-001" },
  { id: 2, title: "Night Archive Tee",  type: "Single", status: "upcoming" as const, units: 100, image: "/Archive_files/drop-02.jpg", slug: "night-archive-tee", dropDate: "April 2025" },
  { id: 3, title: "Catalogue No. 9",    type: "Print",  status: "sold" as const,     units: 30,  image: "/Archive_files/drop-03.jpg", slug: "catalogue-no-9" },
];

const ARCHIVE_TV_EPISODES = [
  { id: 1, ep: "S01E01", title: "Origins",      thumb: "/archive-tv/ep01.jpg", slug: "origins" },
  { id: 2, ep: "S01E02", title: "The Process",  thumb: "/archive-tv/ep02.jpg", slug: "the-process" },
  { id: 3, ep: "S01E03", title: "Street Level", thumb: "/archive-tv/ep03.jpg", slug: "street-level" },
];

export function BlackCatHomeContent() {
  return (
    <div>

      {/* ══════════════════════════════════════════════════════════════════
          HERO — looping video background
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] flex flex-col items-start justify-end px-6 md:px-12 pb-16 overflow-hidden bg-black">

        {/* ── Looping hero video ── */}
        {/*
          Place your video at: /public/blackcat-hero.mp4
          (copy the file from the outputs folder into your project's /public/ folder)
        */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/blackcat-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        {/* Gradient overlays — darken bottom for text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.1) 100%)",
              "linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 60%)",
            ].join(", "),
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          <p
            className="text-[8px] tracking-[0.7em] uppercase text-white/35 mb-4"
            style={{ fontFamily: "'Courier Prime', monospace" }}
          >
            New drop — limited units
          </p>
          <h2
            className="text-[clamp(3rem,8vw,5.5rem)] text-white leading-none mb-6"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}
          >
            Archive_File_001:<br /> Gaurdian 001
          </h2>
          <p
            className="text-sm text-white/40 leading-relaxed mb-10 max-w-sm"
            style={{ fontFamily: "'Courier Prime', monospace" }}
          >
            50 units. Street-weight cotton. Screenprinted.
            Once it's gone, it's gone.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/blackcatarchive/shop/shadow-work-vol-1"
              className="group relative border border-white/30 px-10 py-3.5 text-[10px] tracking-[0.4em] uppercase text-white overflow-hidden transition-colors duration-300"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            >
              <span className="relative z-10 group-hover:text-black transition-colors duration-250">
                Shop now — $50
              </span>
              <span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </Link>
            <Link
              href="/blackcatarchive/drops"
              className="text-[10px] tracking-[0.35em] uppercase text-white/35 hover:text-white transition-colors duration-200"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            >
              Archive Records →
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 md:right-12 z-10 flex flex-col items-center gap-2 opacity-25">
          <div className="w-px h-10 bg-white animate-[scrollpulse_2s_ease-in-out_infinite]" />
          <span
            className="text-[7px] tracking-[0.5em] uppercase text-white"
            style={{ fontFamily: "'Courier Prime', monospace", writingMode: "vertical-rl" }}
          >
            Scroll
          </span>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════
          DROPS GRID
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p
              className="text-[8px] tracking-[0.6em] uppercase text-white/22 mb-2"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            >
              Releases
            </p>
            <h2
              className="text-[clamp(2rem,5vw,3.5rem)] text-white leading-none"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Archive Records
            </h2>
          </div>
          <Link
            href="/blackcatarchive/drops"
            className="hidden md:block text-[9px] tracking-[0.35em] uppercase text-white/30 hover:text-white transition-colors duration-200"
            style={{ fontFamily: "'Courier Prime', monospace" }}
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {FEATURED_DROPS.map((drop) => (
            <Link
              key={drop.id}
              href={`/blackcatarchive/shop/${drop.slug}`}
              className="group relative overflow-hidden bg-[#111] aspect-[3/4] block"
            >
              <Image
                src={drop.image}
                alt={drop.title}
                fill
                className="object-cover opacity-65 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 55%)" }}
              />
              <div className="absolute top-4 left-4">
                <span
                  className="text-[8px] tracking-[0.4em] uppercase px-2.5 py-1 border"
                  style={{
                    fontFamily: "'Courier Prime', monospace",
                    borderColor: drop.status === "live" ? "rgba(255,255,255,0.4)" : drop.status === "upcoming" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                    color:       drop.status === "live" ? "rgba(255,255,255,0.85)" : drop.status === "upcoming" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)",
                  }}
                >
                  {drop.status === "live" ? "Live" : drop.status === "upcoming" ? (drop.dropDate ?? "Coming") : "Sold"}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-[8px] tracking-[0.4em] uppercase text-white/30 mb-1.5" style={{ fontFamily: "'Courier Prime', monospace" }}>
                  {drop.type} · {drop.units} units
                </p>
                <h3 className="text-2xl text-white leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}>
                  {drop.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ARCHIVE TV
      ══════════════════════════════════════════════════════════════════ */}
      <section className="border-t border-white/8 px-6 md:px-12 py-24 bg-[#080808]">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p
              className="text-[8px] tracking-[0.6em] uppercase text-white/22 mb-2"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            >
              Video
            </p>
            <h2
              className="text-[clamp(2rem,5vw,3.5rem)] text-white leading-none"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Archive TV
            </h2>
          </div>
          <Link
            href="/blackcatarchive/archive-tv"
            className="hidden md:block text-[9px] tracking-[0.35em] uppercase text-white/30 hover:text-white transition-colors duration-200"
            style={{ fontFamily: "'Courier Prime', monospace" }}
          >
            All episodes →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {ARCHIVE_TV_EPISODES.map((ep) => (
            <Link
              key={ep.id}
              href={`/blackcatarchive/archive-tv/${ep.slug}`}
              className="group relative overflow-hidden bg-[#111] aspect-video block"
            >
              <Image
                src={ep.thumb}
                alt={ep.title}
                fill
                className="object-cover opacity-55 group-hover:opacity-75 transition-opacity duration-400"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 60%)" }}
              />
              {/* Play circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-11 h-11 border border-white/22 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-0 h-0 ml-0.5" style={{ borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "9px solid rgba(255,255,255,0.75)" }} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-[8px] tracking-widest text-white/28 mb-1" style={{ fontFamily: "'Courier Prime', monospace" }}>{ep.ep}</p>
                <h3 className="text-xl text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>{ep.title}</h3>
              </div>
            </Link>
          ))}
        </div>
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