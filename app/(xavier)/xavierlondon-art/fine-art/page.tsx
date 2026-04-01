"use client";

// app/(xavier)/xavierlondon-art/fine-art/page.tsx
// Gallery of all original fine art. Filterable by series, size category, and price.

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

function imgUrl(ref: string, projectId: string, w = 700) {
  return `https://cdn.sanity.io/images/${projectId}/production/${
    ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
  }?w=${w}&auto=format`;
}

const SIZE_LABELS: Record<string, string> = {
  small:  "Small (< 18 in)",
  medium: "Medium (18–36 in)",
  large:  "Large (36–60 in)",
  xlarge: "Extra Large (60+ in)",
};

function FineArtContent() {
  const searchParams = useSearchParams();
  const projectId    = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;

  const [allPieces, setAllPieces]   = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);

  // Active filters
  const [activeSeries, setActiveSeries]   = useState(searchParams.get("series") ?? "all");
  const [activeSize, setActiveSize]       = useState("all");
  const [maxPrice, setMaxPrice]           = useState(999999);
  const [rawMax, setRawMax]               = useState(999999);
  const [sortBy, setSortBy]               = useState<"newest" | "price-asc" | "price-desc">("newest");

  useEffect(() => {
    const artQuery = encodeURIComponent(
      `*[_type=="product"&&brand=="xavier"&&category in ["art","reproduction"]]
      |order(_createdAt desc){
        _id,title,slug,category,price,images[]{asset{_ref}},
        inventory,isOneOfOne,medium,year,sizeCategory,shortDescription,
        series->{_id,title,slug}
      }`
    );
    const seriesQuery = encodeURIComponent(
      `*[_type=="series"]|order(coalesce(order,999) asc){_id,title,slug}`
    );

    Promise.all([
      fetch(`https://${projectId}.api.sanity.io/v2021-10-21/data/query/production?query=${artQuery}`).then(r => r.json()),
      fetch(`https://${projectId}.api.sanity.io/v2021-10-21/data/query/production?query=${seriesQuery}`).then(r => r.json()),
    ])
      .then(([artData, seriesData]) => {
        const pieces = artData.result ?? [];
        setAllPieces(pieces);
        setSeriesList(seriesData.result ?? []);
        if (pieces.length > 0) {
          const top = Math.max(...pieces.map((p: any) => p.price ?? 0));
          setMaxPrice(top);
          setRawMax(top);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  // Apply filters
  const visible = useMemo(() => {
    let out = allPieces;
    if (activeSeries !== "all") out = out.filter(p => p.series?.slug?.current === activeSeries);
    if (activeSize   !== "all") out = out.filter(p => p.sizeCategory === activeSize);
    out = out.filter(p => !p.price || p.price <= maxPrice);

    if (sortBy === "price-asc")  return [...out].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === "price-desc") return [...out].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return out; // newest = default Sanity order
  }, [allPieces, activeSeries, activeSize, maxPrice, sortBy]);

  const resetFilters = () => {
    setActiveSeries("all");
    setActiveSize("all");
    setMaxPrice(rawMax);
    setSortBy("newest");
  };

  const filtersActive = activeSeries !== "all" || activeSize !== "all" || maxPrice < rawMax || sortBy !== "newest";

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a]">

      {/* Header */}
      <div className="max-w-6xl mx-auto px-8 md:px-16 pt-20 pb-12 border-b border-[#1a1a1a]/8">
        <p className="text-[9px] tracking-[0.6em] uppercase text-[#1a1a1a]/30 mb-3"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Xavier London Art
        </p>
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light text-[#1a1a1a] leading-none"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Fine Art
        </h1>
      </div>

      {/* ── Filter bar ── */}
      <div className="sticky top-0 z-10 bg-[#f7f4ef]/96 backdrop-blur-sm border-b border-[#1a1a1a]/8">
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-4 flex flex-wrap items-center gap-x-8 gap-y-3">

          {/* Series filter */}
          {seriesList.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 flex-shrink-0"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                Series
              </span>
              <div className="flex gap-2 flex-wrap">
                {[{ _id: "all", title: "All", slug: { current: "all" } }, ...seriesList].map(s => (
                  <button key={s._id}
                    onClick={() => setActiveSeries(s.slug?.current ?? "all")}
                    className="text-[8px] tracking-[0.3em] uppercase px-3 py-1 border transition-all duration-200"
                    style={{
                      fontFamily:      "'Cormorant Garamond','Georgia',serif",
                      borderColor:     activeSeries === (s.slug?.current ?? "all") ? "rgba(26,26,26,0.5)" : "rgba(26,26,26,0.12)",
                      color:           activeSeries === (s.slug?.current ?? "all") ? "rgba(26,26,26,0.8)" : "rgba(26,26,26,0.35)",
                      backgroundColor: activeSeries === (s.slug?.current ?? "all") ? "rgba(26,26,26,0.04)" : "transparent",
                    }}>
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size filter */}
          <div className="flex items-center gap-3">
            <span className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 flex-shrink-0"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Size
            </span>
            <div className="flex gap-2 flex-wrap">
              {[["all", "All"], ...Object.entries(SIZE_LABELS)].map(([v, l]) => (
                <button key={v}
                  onClick={() => setActiveSize(v)}
                  className="text-[8px] tracking-[0.3em] uppercase px-3 py-1 border transition-all duration-200"
                  style={{
                    fontFamily:      "'Cormorant Garamond','Georgia',serif",
                    borderColor:     activeSize === v ? "rgba(26,26,26,0.5)" : "rgba(26,26,26,0.12)",
                    color:           activeSize === v ? "rgba(26,26,26,0.8)" : "rgba(26,26,26,0.35)",
                    backgroundColor: activeSize === v ? "rgba(26,26,26,0.04)" : "transparent",
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Price slider */}
          {rawMax > 0 && rawMax < 999999 && (
            <div className="flex items-center gap-3">
              <span className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 flex-shrink-0"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                Under
              </span>
              <input type="range" min={0} max={rawMax} step={100}
                value={maxPrice >= rawMax ? rawMax : maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-28 accent-[#1a1a1a]"
              />
              <span className="text-[8px] text-[#1a1a1a]/40 min-w-[48px]"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                {maxPrice >= rawMax ? "Any" : `$${maxPrice.toLocaleString()}`}
              </span>
            </div>
          )}

          {/* Sort */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/30"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Sort
            </span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-[8px] tracking-[0.3em] uppercase text-[#1a1a1a]/50 border-none outline-none cursor-pointer"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              <option value="newest">Newest</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
            </select>
          </div>

          {/* Reset */}
          {filtersActive && (
            <button onClick={resetFilters}
              className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors duration-200"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-40">
          <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/25">Loading…</p>
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <div className="max-w-6xl mx-auto px-8 md:px-16 pt-8 pb-2">
          <p className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/25"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            {visible.length} {visible.length === 1 ? "work" : "works"}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && visible.length > 0 && (
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-10
          grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
          {visible.map((piece, i) => {
            const src  = piece.images?.[0]?.asset?._ref ? imgUrl(piece.images[0].asset._ref, projectId) : null;
            const sold = piece.inventory === 0 && !piece.isOneOfOne;
            return (
              <Link key={piece._id} href={`/xavierlondon-art/shop/${piece.slug?.current}`}
                className="group block">
                <div className={`relative ${i % 3 === 1 ? "aspect-[4/5]" : "aspect-[3/4]"} bg-[#ede9e2] overflow-hidden mb-4`}>
                  {src ? (
                    <Image src={src} alt={piece.title} fill
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
                      style={{ opacity: sold ? 0.4 : 0.88 }}
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] tracking-wider uppercase text-[#1a1a1a]/15">XLA</span>
                    </div>
                  )}
                  {sold && (
                    <div className="absolute inset-0 bg-[#f7f4ef]/55 flex items-center justify-center">
                      <span className="text-[7px] tracking-[0.4em] uppercase text-[#1a1a1a]/35 border border-[#1a1a1a]/12 px-2 py-1">
                        Acquired
                      </span>
                    </div>
                  )}
                  {piece.isOneOfOne && !sold && (
                    <div className="absolute top-2 left-2">
                      <span className="text-[7px] tracking-[0.3em] uppercase text-[#1a1a1a]/45 bg-[#f7f4ef]/80 px-2 py-0.5 border border-[#1a1a1a]/10">
                        Unique
                      </span>
                    </div>
                  )}
                  {piece.category === "reproduction" && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[7px] tracking-[0.3em] uppercase text-[#1a1a1a]/40 bg-[#f7f4ef]/80 px-2 py-0.5 border border-[#1a1a1a]/10">
                        Print
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-base font-light text-[#1a1a1a] leading-snug group-hover:opacity-55 transition-opacity duration-300"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    {piece.title}
                  </h3>
                  {piece.year && (
                    <span className="text-[8px] text-[#1a1a1a]/28 mt-1 flex-shrink-0">{piece.year}</span>
                  )}
                </div>
                {piece.medium && (
                  <p className="text-[9px] text-[#1a1a1a]/32 leading-snug"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    {piece.medium}
                  </p>
                )}
                {piece.series?.title && (
                  <p className="text-[8px] tracking-[0.3em] uppercase text-[#1a1a1a]/25 mt-1"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    {piece.series.title}
                  </p>
                )}
                <p className="text-[10px] tracking-wider text-[#1a1a1a]/40 mt-2">
                  {piece.isOneOfOne ? "Inquiry only" : sold ? "—" : `$${piece.price?.toLocaleString()}`}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty filtered state */}
      {!loading && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-center px-8">
          <p className="text-base font-light text-[#1a1a1a]/30 mb-5"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            No works match these filters.
          </p>
          <button onClick={resetFilters}
            className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/40 border border-[#1a1a1a]/15 px-6 py-2.5 hover:bg-[#1a1a1a] hover:text-[#f7f4ef] transition-all duration-300">
            Clear filters
          </button>
        </div>
      )}

      <div className="pb-32" />
    </div>
  );
}

export default function FineArtPage() {
  return (
    <Suspense>
      <FineArtContent />
    </Suspense>
  );
}
