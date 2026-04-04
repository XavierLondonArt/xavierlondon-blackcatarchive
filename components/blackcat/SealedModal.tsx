"use client";

// components/blackcat/SealedModal.tsx
// Opens when a customer clicks a sealed (sold out) product in the archive catalog.
// Shows: all product images, description, specs/size chart, closing message.

import { useEffect, useState } from "react";
import { PortableText } from "@portabletext/react";

interface SealedModalProps {
  product: SealedProduct;
  projectId: string;
  onClose: () => void;
}

export interface SealedProduct {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  price: number;
  images: Array<{ asset: { _ref: string }; caption?: string }>;
  description?: any[];
  shortDescription?: string;
  hasApparel?: boolean;
  sizeChart?: {
    columns: string[];
    rows: Array<{ size: string; measurements: string[] }>;
    note?: string;
  };
  physicalSpecs?: {
    specRows: Array<{ label: string; value: string }>;
  };
  unitRange?: string;
  archiveFileNumber?: string;
}

function imgUrl(ref: string, projectId: string, w = 800) {
  return `https://cdn.sanity.io/images/${projectId}/production/${
    ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
  }?auto=format&w=${w}`;
}

const ptComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="text-xs text-white/40 leading-[1.9] mb-3"
        style={{ fontFamily: "'Courier Prime',monospace" }}>
        {children}
      </p>
    ),
    h3: ({ children }: any) => (
      <p className="text-sm text-white/60 mb-2 mt-4"
        style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.05em" }}>
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="text-white/70">{children}</strong>,
    em:     ({ children }: any) => <em className="text-white/50 italic">{children}</em>,
  },
};

export function SealedModal({ product, projectId, onClose }: SealedModalProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [imgFade, setImgFade]     = useState(true);
  const images = product.images ?? [];

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const changeImg = (i: number) => {
    if (i === activeImg) return;
    setImgFade(false);
    setTimeout(() => { setActiveImg(i); setImgFade(true); }, 200);
  };

  const CATEGORY_LABELS: Record<string, string> = {
    apparel:      "Apparel",
    accessories:  "Accessories",
    collectibles: "Collectibles",
    art:          "Art & Objects",
    archival:     "Archival",
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(4,4,4,0.88)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{
          background: "#0f0f0f",
          border: "1px solid rgba(232,228,223,0.1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Grain */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat", backgroundSize: "120px 120px",
          }}
        />

        {/* Red fog */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 40% at 50% 100%, rgba(140,10,10,0.1) 0%, transparent 65%)" }}
        />

        <div className="relative z-10">

          {/* ── Header ── */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-white/8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                {product.archiveFileNumber && (
                  <span className="text-[7px] tracking-[0.6em] uppercase text-white/18"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    File {product.archiveFileNumber}
                  </span>
                )}
                <span className="text-[7px] tracking-[0.4em] uppercase px-2 py-0.5 border"
                  style={{
                    fontFamily: "'Courier Prime',monospace",
                    borderColor: "rgba(180,15,15,0.3)",
                    color:       "rgba(180,15,15,0.5)",
                  }}>
                  Archive Sealed
                </span>
              </div>
              <h2 className="text-[clamp(1.4rem,4vw,2rem)] text-white leading-none"
                style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
                {product.title}
              </h2>
              <p className="text-[8px] tracking-[0.3em] uppercase text-white/22 mt-1"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                {CATEGORY_LABELS[product.category] ?? product.category}
                {product.unitRange && ` · [${product.unitRange}]`}
                {product.price > 0 && ` · $${product.price}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors duration-200 mt-1"
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <line x1="6" y1="6" x2="18" y2="18" stroke="rgba(232,228,223,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="18" y1="6" x2="6"  y2="18" stroke="rgba(232,228,223,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* Images */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-white/8">
              <div className="relative aspect-square overflow-hidden bg-[#272727] mb-2">
                {images[activeImg]?.asset ? (
                  <img
                    src={imgUrl(images[activeImg].asset._ref, projectId)}
                    alt={images[activeImg].caption ?? product.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: imgFade ? 0.75 : 0, transition: "opacity 0.22s ease",
                      filter: "grayscale(20%)" }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[3rem] text-white/4 select-none"
                      style={{ fontFamily: "'Bebas Neue',sans-serif" }}>BCA</span>
                  </div>
                )}
                {/* Sealed overlay on image */}
                <div className="absolute inset-0 flex items-end p-3 pointer-events-none">
                  <span className="text-[7px] tracking-[0.5em] uppercase text-white/20 bg-black/50 px-2 py-0.5"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    {images[activeImg]?.caption ?? (activeImg === 0 ? "Front" : activeImg === 1 ? "Back" : `View ${activeImg + 1}`)}
                  </span>
                </div>
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-1.5 flex-wrap">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => changeImg(i)}
                      className="relative overflow-hidden flex-shrink-0"
                      style={{
                        width: "48px", height: "48px", background: "#111",
                        border: i === activeImg ? "1px solid rgba(232,228,223,0.3)" : "1px solid rgba(232,228,223,0.07)",
                      }}>
                      {img.asset && (
                        <img src={imgUrl(img.asset._ref, projectId, 100)} alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ opacity: i === activeImg ? 0.8 : 0.3, filter: "grayscale(20%)" }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col gap-5 overflow-y-auto" style={{ maxHeight: "480px" }}>

              {/* Short description */}
              {product.shortDescription && (
                <p className="text-xs text-white/45 leading-relaxed"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  {product.shortDescription}
                </p>
              )}

              {/* Full description */}
              {product.description && product.description.length > 0 && (
                <div className="border-t border-white/8 pt-5">
                  <p className="text-[7px] tracking-[0.6em] uppercase text-white/18 mb-3"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    About this piece
                  </p>
                  <PortableText value={product.description} components={ptComponents} />
                </div>
              )}

              {/* Physical specs (non-apparel) */}
              {!product.hasApparel && product.physicalSpecs?.specRows?.length > 0 && (
                <div className="border-t border-white/8 pt-5">
                  <p className="text-[7px] tracking-[0.6em] uppercase text-white/18 mb-3"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    Specifications
                  </p>
                  <dl className="space-y-2">
                    {product.physicalSpecs.specRows.map((row, i) => (
                      <div key={i} className="flex gap-3">
                        <dt className="text-[9px] tracking-[0.3em] uppercase text-white/25 w-24 flex-shrink-0"
                          style={{ fontFamily: "'Courier Prime',monospace" }}>
                          {row.label}
                        </dt>
                        <dd className="text-[9px] text-white/45"
                          style={{ fontFamily: "'Courier Prime',monospace" }}>
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Size chart (apparel) */}
              {product.hasApparel && product.sizeChart?.rows?.length > 0 && (
                <div className="border-t border-white/8 pt-5">
                  <p className="text-[7px] tracking-[0.6em] uppercase text-white/18 mb-3"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    Size Reference
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[9px]" style={{ fontFamily: "'Courier Prime',monospace" }}>
                      {product.sizeChart.columns?.length > 0 && (
                        <thead>
                          <tr className="border-b border-white/10">
                            {product.sizeChart.columns.map((col, i) => (
                              <th key={i} className="text-left px-2 py-1.5 text-[8px] uppercase tracking-wider text-white/25">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody>
                        {product.sizeChart.rows.map((row, i) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="px-2 py-1.5 text-white/55 font-bold">{row.size}</td>
                            {(row.measurements ?? []).map((m, j) => (
                              <td key={j} className="px-2 py-1.5 text-white/28">{m}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {product.sizeChart.note && (
                      <p className="text-[7.5px] text-white/18 mt-2"
                        style={{ fontFamily: "'Courier Prime',monospace" }}>
                        {product.sizeChart.note}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Archive sealed message */}
              <div className="border-t border-white/8 pt-5 mt-auto">
                <p className="text-[8px] text-white/20 leading-relaxed italic"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  This archive file has been sealed. All units have been claimed.
                  {product.unitRange && ` Unit range: [${product.unitRange}].`}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}