"use client";

// app/(xavier)/xavierlondon-art/collections/page.tsx
// Gallery/browse page. Three modes: All | By Series | Standalone.
// Works immediately — no Series documents required.
// Clicking a piece routes to the product detail page (shop/[slug])
// where the user can purchase or send an inquiry.

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

type Tab = "all" | "series" | "standalone";

function imgUrl(ref: string, pid: string, w = 700) {
  return `https://cdn.sanity.io/images/${pid}/production/${
    ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
  }?w=${w}&auto=format`;
}

// ── Piece card ────────────────────────────────────────────────────────────────
function PieceCard({ piece, pid, index }: { piece: any; pid: string; index: number }) {
  const [hovered, setHovered] = useState(false);
  const src = piece.images?.asset?._ref ? imgUrl(piece.images.asset._ref, pid) : null; 
  const sold = piece.inventory === 0 && !piece.isOneOfOne;
  const isprint = piece.category === "reproduction";

  // Label shown on hover — tells user where clicking will take them
  const actionLabel = piece.isOneOfOne
    ? "Inquire"
    : sold
    ? "View"
    : isprint
    ? "Buy print"
    : "Purchase";

  return (
    <Link
      href={`/xavierlondon-art/shop/${piece.slug?.current}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`relative overflow-hidden bg-[#ede9e2] mb-4 ${
          index % 5 === 1 ? "aspect-[4/5]" : index % 5 === 3 ? "aspect-[5/4]" : "aspect-[3/4]"
        }`}
      >
        {src ? (
          <Image
            src={src}
            alt={piece.title}
            fill
            className="object-cover transition-all duration-700 ease-out"
            style={{
              opacity: sold ? 0.38 : hovered ? 0.95 : 0.84,
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] tracking-wider uppercase text-[#1a1a1a]/15">XLA</span>
          </div>
        )}

        {/* Sold overlay */}
        {sold && (
          <div className="absolute inset-0 bg-[#f7f4ef]/52 flex items-center justify-center">
            <span className="text-[7px] tracking-[0.4em] uppercase text-[#1a1a1a]/35 border border-[#1a1a1a]/12 px-2 py-1">
              Acquired
            </span>
          </div>
        )}

        {/* Category badge */}
        {isprint && !sold && (
          <div className="absolute top-2 left-2">
            <span className="text-[7px] tracking-[0.3em] uppercase text-[#1a1a1a]/45 bg-[#f7f4ef]/88 px-2 py-0.5 border border-[#1a1a1a]/10">
              Print
            </span>
          </div>
        )}

        {/* Hover action label */}
        <div
          className="absolute inset-0 flex items-end justify-end p-3 transition-opacity duration-300"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <span className="text-[7px] tracking-[0.4em] uppercase text-[#1a1a1a]/55 bg-[#f7f4ef]/88 px-2.5 py-1 border border-[#1a1a1a]/10">
            {actionLabel} →
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2 mb-0.5">
        <h3
          className="text-sm font-light text-[#1a1a1a] leading-snug group-hover:opacity-52 transition-opacity duration-300"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
        >
          {piece.title}
        </h3>
        {piece.year && (
          <span className="text-[8px] text-[#1a1a1a]/25 mt-0.5 flex-shrink-0">{piece.year}</span>
        )}
      </div>
      {piece.medium && (
        <p
          className="text-[9px] text-[#1a1a1a]/30 leading-snug"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
        >
          {piece.medium}
        </p>
      )}
      <p className="text-[10px] tracking-wider text-[#1a1a1a]/38 mt-1.5">
        {piece.isOneOfOne
          ? "Inquiry only"
          : sold
          ? "—"
          : `$${piece.price?.toLocaleString()}`}
      </p>
    </Link>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CollectionsPage() {
  const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;

  const [allPieces, setAllPieces]   = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<Tab>("all");

  useEffect(() => {
    const base = `https://${pid}.api.sanity.io/v2021-10-21/data/query/production`;

    const piecesQ = encodeURIComponent(
      `*[_type=="product"&&brand=="xavier"&&category in ["art","reproduction"]]
      |order(featured desc,_createdAt desc){
        _id,title,slug,category,price,medium,year,
        images[0]{asset{_ref}},
        inventory,isOneOfOne,featured,shortDescription,
        series->{_id,title,slug}
      }`
    );
    const seriesQ = encodeURIComponent(
      `*[_type=="series"]|order(coalesce(order,999) asc,_createdAt desc){
        _id,title,slug,year,shortDescription,coverImage{asset{_ref}}
      }`
    );

    Promise.all([
      fetch(`${base}?query=${piecesQ}`).then(r => r.json()),
      fetch(`${base}?query=${seriesQ}`).then(r => r.json()),
    ])
      .then(([pd, sd]) => {
        setAllPieces(pd.result ?? []);
        setSeriesList(sd.result ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pid]);

  // Pieces grouped by series for the "By Series" tab
  const grouped = useMemo(() => {
    const map = new Map<string, { series: any; pieces: any[] }>();
    for (const p of allPieces) {
      if (!p.series) continue;
      const key = p.series._id;
      if (!map.has(key)) map.set(key, { series: p.series, pieces: [] });
      map.get(key)!.pieces.push(p);
    }
    // Also pull in any series that have no pieces yet but exist in seriesList
    for (const s of seriesList) {
      if (!map.has(s._id)) map.set(s._id, { series: s, pieces: [] });
    }
    return [...map.values()];
  }, [allPieces, seriesList]);

  const standalone = useMemo(
    () => allPieces.filter(p => !p.series),
    [allPieces]
  );

  const hasSeries  = grouped.length > 0;
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all",        label: "All works",   count: allPieces.length },
    { key: "series",     label: "By series",   count: grouped.length   },
    { key: "standalone", label: "Standalone",  count: standalone.length },
  ];

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a]">

      {/* Header */}
      <div className="max-w-6xl mx-auto px-8 md:px-16 pt-20 pb-10 border-b border-[#1a1a1a]/8">
        <p
          className="text-[9px] tracking-[0.6em] uppercase text-[#1a1a1a]/28 mb-3"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
        >
          Xavier London Art
        </p>
        <h1
          className="text-[clamp(2.5rem,6vw,4.5rem)] font-light text-[#1a1a1a] leading-none mb-5"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
        >
          Collections
        </h1>
        <p
          className="text-sm font-light text-[#1a1a1a]/38 max-w-lg leading-relaxed"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
        >
          Browse all works. Click any piece to view it in full and purchase or inquire.
        </p>
      </div>

      {/* Tab bar */}
      <div className="sticky top-0 z-10 bg-[#f7f4ef]/96 backdrop-blur-sm border-b border-[#1a1a1a]/8">
        <div className="max-w-6xl mx-auto px-8 md:px-16 flex gap-8 py-3">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 text-[9px] tracking-[0.4em] uppercase pb-1 transition-all duration-200"
              style={{
                fontFamily:   "'Cormorant Garamond','Georgia',serif",
                color:        tab === t.key ? "rgba(26,26,26,0.85)" : "rgba(26,26,26,0.3)",
                borderBottom: tab === t.key ? "1px solid rgba(26,26,26,0.5)" : "1px solid transparent",
              }}
            >
              {t.label}
              {!loading && t.count !== undefined && (
                <span style={{ opacity: 0.45 }}>({t.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`bg-[#ede9e2] animate-pulse ${i % 3 === 1 ? "aspect-[4/5]" : "aspect-[3/4]"}`}
            />
          ))}
        </div>
      )}

      {/* ── ALL tab ── */}
      {!loading && tab === "all" && (
        <>
          {allPieces.length === 0 ? (
            <EmptyState message="No works found." hint="Add products in Sanity Studio with brand set to Xavier London Art." />
          ) : (
            <div className="max-w-6xl mx-auto px-8 md:px-16 py-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
              {allPieces.map((p, i) => (
                <PieceCard key={p._id} piece={p} pid={pid} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── BY SERIES tab ── */}
      {!loading && tab === "series" && (
        <>
          {grouped.length === 0 ? (
            <EmptyState
              message="No series yet."
              hint='Create a "Series" document in Sanity Studio, then assign pieces to it using the "Series" field on each product.'
            />
          ) : (
            <div>
              {grouped.map(({ series, pieces }) => {
                const coverSrc = series.coverImage?.asset?._ref
                  ? imgUrl(series.coverImage.asset._ref, pid, 1200) : null;
                return (
                  <section key={series._id} className="border-b border-[#1a1a1a]/6">
                    {/* Series header */}
                    <div className="max-w-6xl mx-auto px-8 md:px-16 py-10 flex items-end justify-between gap-8">
                      <div>
                        {series.year && (
                          <p
                            className="text-[8px] tracking-[0.5em] uppercase text-[#1a1a1a]/25 mb-2"
                            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                          >
                            {series.year}
                          </p>
                        )}
                        <h2
                          className="text-[clamp(1.5rem,3vw,2.5rem)] font-light text-[#1a1a1a] leading-tight"
                          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                        >
                          {series.title}
                        </h2>
                        {series.shortDescription && (
                          <p
                            className="text-sm font-light text-[#1a1a1a]/42 mt-2 max-w-lg leading-relaxed"
                            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                          >
                            {series.shortDescription}
                          </p>
                        )}
                      </div>
                      <p
                        className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/22 flex-shrink-0"
                        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                      >
                        {pieces.length} {pieces.length === 1 ? "piece" : "pieces"}
                      </p>
                    </div>

                    {/* Series pieces */}
                    {pieces.length > 0 ? (
                      <div className="bg-[#f0ece4] border-t border-[#1a1a1a]/5">
                        <div className="max-w-6xl mx-auto px-8 md:px-16 py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
                          {pieces.map((p, i) => (
                            <PieceCard key={p._id} piece={p} pid={pid} index={i} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#f0ece4] border-t border-[#1a1a1a]/5">
                        <div className="max-w-6xl mx-auto px-8 md:px-16 py-10">
                          <p
                            className="text-sm font-light text-[#1a1a1a]/25"
                            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                          >
                            No pieces assigned to this series yet. Assign products in Sanity Studio.
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── STANDALONE tab ── */}
      {!loading && tab === "standalone" && (
        <>
          {standalone.length === 0 ? (
            <EmptyState
              message="No standalone pieces."
              hint='Pieces without a Series assigned will appear here. Leave the "Series" field blank on a product in Sanity Studio.'
            />
          ) : (
            <div className="max-w-6xl mx-auto px-8 md:px-16 py-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
              {standalone.map((p, i) => (
                <PieceCard key={p._id} piece={p} pid={pid} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      <div className="pb-32" />
    </div>
  );
}

function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-40 text-center px-8 max-w-lg mx-auto">
      <p
        className="text-[clamp(1.2rem,2.5vw,1.8rem)] font-light text-[#1a1a1a]/15 mb-5"
        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
      >
        {message}
      </p>
      <p
        className="text-[9px] tracking-[0.35em] uppercase text-[#1a1a1a]/22 leading-relaxed"
        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
      >
        {hint}
      </p>
    </div>
  );
}
