"use client";

// app/(xavier)/xavierlondon-art/shop/page.tsx

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  { value: "all",          label: "All"            },
  { value: "art",          label: "Originals"      },
  { value: "reproduction", label: "Prints"         },
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
  shortDescription?: string;
}

function imgUrl(ref: string, projectId: string, w = 700) {
  return `https://cdn.sanity.io/images/${projectId}/production/${
    ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
  }?w=${w}&auto=format`;
}

export default function XavierShopPage() {
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const projectId               = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;

  useEffect(() => {
    const query = encodeURIComponent(
      `*[_type=="product"&&brand=="xavier"&&category in ["art","reproduction"]]|order(featured desc,_createdAt desc){
        _id,title,slug,category,price,
        images[]{asset{_ref}},
        inventory,isOneOfOne,featured,shortDescription
      }`
    );
    fetch(`https://${projectId}.api.sanity.io/v2021-10-21/data/query/production?query=${query}`)
      .then(r => r.json())
      .then(d => { setProducts(d.result ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [projectId]);

  const visible = products.filter(p => filter === "all" || p.category === filter);

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a]">

      {/* Page header */}
      <div className="max-w-6xl mx-auto px-8 md:px-16 pt-20 pb-12 border-b border-[#1a1a1a]/8">
        <p className="text-[9px] tracking-[0.6em] uppercase text-[#1a1a1a]/30 mb-3"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Collections
        </p>
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light text-[#1a1a1a] leading-none"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          All Works
        </h1>
      </div>

      {/* Category filter */}
      <div className="sticky top-0 z-10 bg-[#f7f4ef]/95 backdrop-blur-sm border-b border-[#1a1a1a]/8">
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-3 flex gap-8 overflow-x-auto whitespace-nowrap">
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setFilter(cat.value)}
              className="text-[9px] tracking-[0.4em] uppercase pb-1 transition-all duration-200"
              style={{
                fontFamily:   "'Cormorant Garamond','Georgia',serif",
                color:        filter === cat.value ? "rgba(26,26,26,0.85)" : "rgba(26,26,26,0.3)",
                borderBottom: filter === cat.value ? "1px solid rgba(26,26,26,0.5)" : "1px solid transparent",
              }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-40">
          <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/25"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            Loading collection…
          </p>
        </div>
      )}

      {/* Product grid */}
      {!loading && visible.length > 0 && (
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-16
          grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
          {visible.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} projectId={projectId} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-48 text-center px-8">
          <p className="text-[clamp(2rem,5vw,3.5rem)] font-light text-[#1a1a1a]/10 leading-none mb-6"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            New works arriving soon.
          </p>
          <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/25">
            Subscribe below to be notified
          </p>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, index, projectId }: {
  product: SanityProduct;
  index: number;
  projectId: string;
}) {
  const [imgIdx, setImgIdx]   = useState(0);
  const [fade, setFade]       = useState(true);
  const [hovered, setHovered] = useState(false);
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null);
  const images                = product.images ?? [];
  const sold                  = product.inventory === 0 && !product.isOneOfOne;

  useEffect(() => {
    if (!hovered || images.length <= 1) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (!hovered) { setImgIdx(0); setFade(true); }
      return;
    }
    timerRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => { setImgIdx(i => (i + 1) % images.length); setFade(true); }, 220);
    }, 1800);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hovered, images.length]);

  const src = images[imgIdx]?.asset?._ref
    ? imgUrl(images[imgIdx].asset._ref, projectId)
    : null;

  // Alternate aspect ratio for visual rhythm
  const aspect = index % 3 === 1 ? "aspect-[4/5]" : "aspect-[3/4]";

  return (
    <Link href={`/xavierlondon-art/shop/${product.slug?.current}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>

      {/* Image */}
      <div className={`relative ${aspect} overflow-hidden bg-[#ede9e2] mb-4`}>
        {src ? (
          <img src={src} alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            style={{ opacity: fade ? (sold ? 0.4 : 0.9) : 0, transition: fade ? "opacity 0.3s ease, transform 0.7s ease" : "opacity 0.2s ease" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/20"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              XLA
            </span>
          </div>
        )}

        {/* Sold / Acquired overlay */}
        {sold && (
          <div className="absolute inset-0 bg-[#f7f4ef]/55 flex items-center justify-center">
            <span className="text-[8px] tracking-[0.5em] uppercase text-[#1a1a1a]/40 border border-[#1a1a1a]/15 px-3 py-1.5"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Acquired
            </span>
          </div>
        )}

        {/* 1 of 1 badge */}
        {product.isOneOfOne && !sold && (
          <div className="absolute top-2 left-2">
            <span className="text-[7px] tracking-[0.35em] uppercase text-[#1a1a1a]/50 bg-[#f7f4ef]/80 px-2 py-0.5 border border-[#1a1a1a]/10"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Unique
            </span>
          </div>
        )}

        {/* Image dots on hover */}
        {hovered && images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span key={i} className="block rounded-full transition-all duration-300"
                style={{
                  width: i === imgIdx ? "12px" : "4px", height: "4px",
                  background: i === imgIdx ? "rgba(26,26,26,0.5)" : "rgba(26,26,26,0.15)",
                }} />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-light text-[#1a1a1a] leading-snug group-hover:opacity-55 transition-opacity duration-300"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            {product.title}
          </h3>
        </div>
        {product.shortDescription && (
          <p className="text-xs text-[#1a1a1a]/35 mt-1 leading-relaxed line-clamp-1"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            {product.shortDescription}
          </p>
        )}
        <p className="text-[10px] tracking-wider text-[#1a1a1a]/40 mt-2">
          {product.isOneOfOne ? "Inquiry only" : sold ? "—" : `$${product.price}`}
        </p>
      </div>
    </Link>
  );
}
