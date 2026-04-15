"use client";

// app/(blackcat)/blackcatarchive/shop/page.tsx
// All lore data comes from Sanity — no hardcoded slug maps.

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArchiveCard } from "@/components/blackcat/ArchiveCard";

const CATEGORIES = [
  { value: "all",          label: "All"           },
  { value: "apparel",      label: "Apparel"        },
  { value: "accessories",  label: "Accessories"    },
  { value: "collectibles", label: "Collectibles"   },
  { value: "art",          label: "Art & Objects"  },
  { value: "archival",     label: "Archival"       },
];

interface SanityProduct {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  price: number;
  images: Array<{ asset: { _ref: string } }>;
  inventory: number;
  isOneOfOne: boolean;
  featured: boolean;
  isArchiveDrop: boolean;
  // Archive card fields — set in Sanity Studio
  archiveFileNumber?: string;
  unitRange?: string;
  shortDescription?: string;
  hoverLore?: string;
  presale?: boolean;
  presaleShipsBy?: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const projectId               = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;

  useEffect(() => {
    const query = encodeURIComponent(
      `*[_type=="product"&&brand=="blackcat"]|order(featured desc,_createdAt desc){
        _id,title,slug,category,price,
        images[]{asset{_ref}},
        inventory,isOneOfOne,featured,isArchiveDrop,
        archiveFileNumber,unitRange,shortDescription,hoverLore,presale,presaleShipsBy
      }`
    );
    fetch(`https://${projectId}.api.sanity.io/v2021-10-21/data/query/production?query=${query}`)
      .then(r => r.json())
      .then(d => { setProducts(d.result ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [projectId]);

  const archiveDrops     = products.filter(p => p.isArchiveDrop);
  const standardProducts = products.filter(p => {
    if (p.isArchiveDrop) return false;
    if (filter === "all") return true;
    return p.category === filter;
  });

  const imgUrl = (ref: string) =>
    `https://cdn.sanity.io/images/${projectId}/production/${
      ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
    }?w=600&auto=format`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4df]">

      {/* Header */}
      <div className="px-6 md:px-12 pt-20 pb-8 border-b border-white/8">
        <p className="text-[8px] tracking-[0.7em] uppercase text-white/25 mb-3"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          Store
        </p>
        <h1 className="text-[clamp(3rem,8vw,6rem)] text-white leading-none"
          style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
          Purchase
        </h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-32">
          <p className="text-[9px] tracking-[0.5em] uppercase text-white/18"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            Accessing archive...
          </p>
        </div>
      )}

      {/* ── Archive Drops ── */}
      {!loading && archiveDrops.length > 0 && (
        <section className="px-6 md:px-12 pt-14 pb-4">
          <div className="flex items-center gap-4 mb-8">
            <p className="text-[8px] tracking-[0.6em] uppercase text-white/18 whitespace-nowrap"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              Archive Files
            </p>
            <div className="flex-1 h-px bg-white/6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {archiveDrops.map(product => (
              <ArchiveCard
                key={product._id}
                fileNumber={product.archiveFileNumber ?? "00"}
                title={product.title}
                tagline={product.shortDescription ?? ""}
                unitRange={product.unitRange ?? "00/50"}
                hoverLore={product.hoverLore ?? product.shortDescription ?? ""}
                href={`/blackcatarchive/shop/${product.slug?.current}`}
                images={product.images ?? []}
                inventory={product.inventory}
                price={product.price}
                status={product.inventory === 0 ? "sold" : "live"}
                projectId={projectId}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Category filter ── */}
      {!loading && (
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-y border-white/8 px-6 md:px-12 py-3 overflow-x-auto mt-8">
          <div className="flex gap-6 whitespace-nowrap">
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setFilter(cat.value)}
                className="text-[9px] tracking-[0.35em] uppercase transition-colors duration-200 pb-0.5"
                style={{
                  fontFamily:   "'Courier Prime',monospace",
                  color:        filter === cat.value ? "rgba(232,228,223,0.85)" : "rgba(232,228,223,0.22)",
                  borderBottom: filter === cat.value ? "1px solid rgba(232,228,223,0.45)" : "1px solid transparent",
                }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Standard product grid ── */}
      {!loading && standardProducts.length > 0 && (
        <div className="px-6 md:px-12 py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
          {standardProducts.map(product => (
            <StandardProductCard
              key={product._id}
              product={product}
              sealed={product.inventory === 0}
              imgUrlFn={imgUrl}
            />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && archiveDrops.length === 0 && standardProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-center px-8">
          <p className="text-[clamp(2rem,6vw,4rem)] text-white/4 leading-none select-none mb-4"
            style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
            MORE COMING
          </p>
        </div>
      )}

    </div>
  );
}

// ── Standard product card ─────────────────────────────────────────────────────

function StandardProductCard({
  product,
  sealed,
  imgUrlFn,
}: {
  product: SanityProduct;
  sealed: boolean;
  imgUrlFn: (ref: string) => string;
}) {
  const [imgIdx, setImgIdx]   = useState(0);
  const [imgFade, setImgFade] = useState(true);
  const [hovered, setHovered] = useState(false);
  const cycleRef              = useRef<ReturnType<typeof setInterval> | null>(null);
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
    ? imgUrlFn(images[imgIdx].asset._ref)
    : null;

  return (
    <Link
      href={sealed ? "#" : `/blackcatarchive/shop/${product.slug?.current}`}
      onClick={e => sealed && e.preventDefault()}
      className="group relative flex flex-col bg-[#0f0f0f] border border-white/5 hover:border-white/14 transition-colors duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#111]">
        {currentImg ? (
          <img src={currentImg} alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            style={{
              opacity:    imgFade ? (sealed ? 0.3 : 0.82) : 0,
              transition: imgFade ? "opacity 0.35s ease, transform 0.7s ease" : "opacity 0.2s ease",
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[2rem] text-white/4 select-none"
              style={{ fontFamily: "'Bebas Neue',sans-serif" }}>BCA</span>
          </div>
        )}

        {/* Image dots */}
        {hovered && !sealed && images.length > 1 && (
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            {images.map((_, i) => (
              <span key={i} className="block rounded-full transition-all duration-300"
                style={{
                  width: i === imgIdx ? "10px" : "4px", height: "4px",
                  background: i === imgIdx ? "rgba(232,228,223,0.6)" : "rgba(232,228,223,0.15)",
                }} />
            ))}
          </div>
        )}

        {/* View label */}
        {hovered && !sealed && images.length > 1 && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="text-[7px] tracking-[0.4em] uppercase text-white/40 bg-black/50 px-2 py-0.5"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              {imgIdx === 0 ? "Front" : imgIdx === 1 ? "Back" : `View ${imgIdx + 1}`}
            </span>
          </div>
        )}

        {/* Sealed overlay */}
        {sealed && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            style={{ background: "rgba(8,8,8,0.78)", backdropFilter: "blur(1.5px)" }}>
            <div className="flex items-center justify-center mb-2"
              style={{ width: "52px", height: "52px", border: "1px solid rgba(180,15,15,0.3)", borderRadius: "50%" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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

        {product.isOneOfOne && !sealed && (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[7px] tracking-[0.3em] uppercase px-2 py-0.5 bg-black/70 border border-white/18 text-white/60"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              1 of 1
            </span>
          </div>
        )}

        {product.presale && !sealed && (
          <div className="absolute top-2 right-2 z-10">
            <span className="text-[7px] tracking-[0.3em] uppercase px-2 py-0.5"
              style={{
                fontFamily: "'Courier Prime',monospace",
                background: "rgba(180,15,15,0.18)",
                border: "1px solid rgba(180,15,15,0.45)",
                color: "rgba(220,80,80,0.9)",
              }}>
              Pre-Sale
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm text-white/75 leading-snug group-hover:text-white transition-colors duration-200 line-clamp-2"
          style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.02em" }}>
          {product.title}
        </h3>
        <p className="text-[10px] text-white/28 mt-1"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          {product.isOneOfOne ? "Inquiry" : sealed ? "Sealed" : product.presale ? `Pre-Sale · $${product.price}` : `$${product.price}`}
        </p>
      </div>
    </Link>
  );
}