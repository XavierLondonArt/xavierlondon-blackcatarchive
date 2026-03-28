"use client";

// app/(blackcat)/blackcatarchive/drops/page.tsx
// Archive Records — full catalog of every product ever added to the site.
// Available items link to the purchase page.
// Sealed items open a modal with full product info.

import { useEffect, useState, useCallback } from "react";
import { ArchiveCard } from "@/components/blackcat/ArchiveCard";
import Link from "next/link";
import { SealedModal, type SealedProduct } from "@/components/blackcat/SealedModal";

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;

const CATEGORIES = [
  { value: "all",          label: "All"          },
  { value: "apparel",      label: "Apparel"       },
  { value: "accessories",  label: "Accessories"   },
  { value: "collectibles", label: "Collectibles"  },
  { value: "art",          label: "Art & Objects" },
  { value: "archival",     label: "Archival"      },
];

function imgUrl(ref: string, w = 600) {
  return `https://cdn.sanity.io/images/${PROJECT_ID}/production/${
    ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
  }?auto=format&w=${w}`;
}

export default function ArchiveRecordsPage() {
  const [products, setProducts]         = useState<SealedProduct[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");
  const [sealedModal, setSealedModal]   = useState<SealedProduct | null>(null);

  useEffect(() => {
    const query = encodeURIComponent(
      `*[_type=="product"&&brand=="blackcat"]|order(_createdAt asc){
        _id,title,slug,category,price,
        images[]{asset{_ref},caption},
        inventory,shortDescription,description,
        hasApparel,sizeChart,physicalSpecs,
        isOneOfOne,isArchiveDrop,unitRange,archiveFileNumber,hoverLore
      }`
    );
    fetch(`https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/production?query=${query}`)
      .then(r => r.json())
      .then(d => { setProducts(d.result ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? products
    : products.filter(p => p.category === filter);

  const sealed    = filtered.filter(p => p.inventory === 0);
  const available = filtered.filter(p => p.inventory > 0);

  const handleSealedClick = useCallback((product: SealedProduct) => {
    setSealedModal(product);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4df]">

      {/* ── Header ── */}
      <div className="px-6 md:px-12 pt-20 pb-10 border-b border-white/8">
        <p className="text-[8px] tracking-[0.7em] uppercase text-white/25 mb-3"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          Catalog
        </p>
        <h1 className="text-[clamp(3rem,8vw,6rem)] text-white leading-none mb-4"
          style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
          Archive Records
        </h1>
        <p className="text-xs text-white/28 max-w-lg leading-relaxed"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          Every item ever released through the Black Cat Archive. Available pieces
          can be purchased. Sealed pieces are closed — click to view the archive record.
        </p>
      </div>

      {/* ── Category filter ── */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/8 px-6 md:px-12 py-3 overflow-x-auto">
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

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-40">
          <p className="text-[9px] tracking-[0.5em] uppercase text-white/18"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            Accessing archive...
          </p>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-center px-8">
          <p className="text-[clamp(2rem,6vw,4rem)] text-white/4 leading-none select-none mb-4"
            style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
            ARCHIVE EMPTY
          </p>
        </div>
      )}

      {/* ── Available products ── */}
      {!loading && available.length > 0 && (
        <section className="px-6 md:px-12 py-14">
          <SectionLabel>Available</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 mt-8">
            {available.map(product =>
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
                    status="live"
                    projectId={PROJECT_ID}
                />
              ) : (
                <ProductCard
                  key={product._id}
                  product={product}
                  sealed={false}
                  onClick={null}
                />
              )
            )}
          </div>
        </section>
      )}

      {/* Divider between available and sealed */}
      {!loading && available.length > 0 && sealed.length > 0 && (
        <div className="px-6 md:px-12">
          <div className="h-px bg-white/6" />
        </div>
      )}

      {/* ── Sealed products ── */}
      {!loading && sealed.length > 0 && (
        <section className="px-6 md:px-12 py-14">
          <SectionLabel>Sealed Archive</SectionLabel>
          <p className="text-[8px] tracking-[0.3em] text-white/18 mt-1 mb-8"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            Click any sealed item to view its archive record
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
            {sealed.map(product =>
              product.isArchiveDrop ? (
                <div key={product._id} onClick={() => handleSealedClick(product)}
                  style={{ cursor: "pointer" }}>
                  <ArchiveCard
                    key={product._id}
                    fileNumber={product.archiveFileNumber ?? "00"}
                    title={product.title}
                    tagline={product.shortDescription ?? ""}
                    unitRange={product.unitRange ?? ""}
                    hoverLore={product.hoverLore ?? product.shortDescription ?? ""}
                    href="#"
                    images={product.images ?? []}
                    inventory={0}
                    price={product.price}
                    status="sold"
                    projectId={PROJECT_ID}
                  />
                </div>
              ) : (
                <ProductCard
                  key={product._id}
                  product={product}
                  sealed={true}
                  onClick={handleSealedClick}
                />
              )
            )}
          </div>
        </section>
      )}

      {/* ── Sealed Modal ── */}
      {sealedModal && (
        <SealedModal
          product={sealedModal}
          projectId={PROJECT_ID}
          onClose={() => setSealedModal(null)}
        />
      )}

    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <p className="text-[8px] tracking-[0.6em] uppercase text-white/22 whitespace-nowrap"
        style={{ fontFamily: "'Courier Prime',monospace" }}>
        {children}
      </p>
      <div className="flex-1 h-px bg-white/7" />
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: SealedProduct;
  sealed: boolean;
  onClick: ((p: SealedProduct) => void) | null;
}

function ProductCard({ product, sealed, onClick }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const img = product.images?.[0]?.asset?._ref
    ? imgUrl(product.images[0].asset._ref)
    : null;

  const inner = (
    <div
      className="relative flex flex-col bg-[#0f0f0f] border border-white/5 h-full"
      style={{
        borderColor: hovered
          ? sealed ? "rgba(180,15,15,0.2)" : "rgba(232,228,223,0.15)"
          : "rgba(232,228,223,0.05)",
        transition: "border-color 0.25s ease",
        cursor: sealed ? "pointer" : "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#111]">
        {img ? (
          <img src={img} alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-600"
            style={{
              opacity:    sealed ? 0.25 : hovered ? 0.9 : 0.72,
              filter:     sealed ? "grayscale(40%)" : "none",
              transform:  hovered && !sealed ? "scale(1.04)" : "scale(1)",
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[2rem] text-white/4 select-none"
              style={{ fontFamily: "'Bebas Neue',sans-serif" }}>BCA</span>
          </div>
        )}

        {/* Sealed overlay */}
        {sealed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center"
            style={{ background: "rgba(8,8,8,0.72)" }}>
            <div className="flex items-center justify-center mb-2"
              style={{
                width: "48px", height: "48px",
                border: "1px solid rgba(180,15,15,0.28)",
                borderRadius: "50%",
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="6" y1="6" x2="18" y2="18" stroke="rgba(180,15,15,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="18" y1="6" x2="6"  y2="18" stroke="rgba(180,15,15,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[10px] text-white/38 leading-none"
              style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.2em" }}>
              Sealed
            </p>
            {hovered && (
              <p className="text-[7px] tracking-[0.4em] uppercase text-white/25 mt-2"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                View record →
              </p>
            )}
          </div>
        )}

        {/* Archive file number badge */}
        {product.archiveFileNumber && (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[7px] tracking-[0.4em] uppercase px-2 py-0.5 bg-black/70 border border-white/10 text-white/35"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              File {product.archiveFileNumber}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-0.5">
        <h3 className="text-sm leading-snug line-clamp-2 transition-colors duration-200"
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            letterSpacing: "0.02em",
            color: sealed ? "rgba(232,228,223,0.35)" : "rgba(232,228,223,0.78)",
          }}>
          {product.title}
        </h3>
        {product.shortDescription && (
          <p className="text-[9px] text-white/22 leading-snug line-clamp-2 mt-0.5"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            {product.shortDescription}
          </p>
        )}
        <p className="text-[9px] mt-1"
          style={{
            fontFamily: "'Courier Prime',monospace",
            color: sealed ? "rgba(180,15,15,0.4)" : "rgba(232,228,223,0.28)",
          }}>
          {sealed ? "Sealed" : `$${product.price}`}
          {product.unitRange && (
            <span className="ml-2 text-white/15">[{product.unitRange}]</span>
          )}
        </p>
      </div>
    </div>
  );

  // Available — navigate to product page
  if (!sealed) {
    return (
      <Link href={`/blackcatarchive/shop/${product.slug?.current}`} className="block h-full">
        {inner}
      </Link>
    );
  }

  // Sealed — open modal
  return (
    <button
      onClick={() => onClick?.(product)}
      className="block w-full text-left h-full"
      aria-label={`View archive record for ${product.title}`}
    >
      {inner}
    </button>
  );
}