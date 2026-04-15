"use client";

// app/(blackcat)/blackcatarchive/shop/[slug]/page.tsx
// 100% Sanity-driven — no hardcoded lore, no slug maps.
// To add a new drop: create the product in Sanity Studio, fill in all fields, publish.

import { useEffect, useState } from "react";
import { PortableText } from "@portabletext/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/blackcat/CartContent";

// ── Helpers ────────────────────────────────────────────────────────────────

function imgUrl(ref: string, projectId: string, w = 900) {
  return `https://cdn.sanity.io/images/${projectId}/production/${
    ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
  }?auto=format&w=${w}`;
}

const SIZE_CHART_FALLBACK = {
  headers: ["Size", "Body Length / HPS (in)", "Chest (in)", "Sleeve from Shoulder (in)"],
  rows: [] as string[][],
};

// ── Portable Text components ────────────────────────────────────────────────

const ptComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="mb-3 text-xs text-white/50 leading-[1.95]"
        style={{ fontFamily: "'Courier Prime',monospace" }}>
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="text-white/80 font-bold">{children}</strong>,
    em:     ({ children }: any) => <em className="italic text-white/60">{children}</em>,
  },
};

// ── SpecsAccordion ──────────────────────────────────────────────────────────

function SpecsAccordion({ specRows }: { specRows: Array<{ label: string; value: string }> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5 border border-white/8">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-200 hover:bg-white/[0.03]">
        <span className="text-[8px] tracking-[0.5em] uppercase text-white/35"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          Specifications
        </span>
        <span className="text-white/25 text-sm transition-transform duration-300 select-none"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", display: "inline-block" }}>
          +
        </span>
      </button>
      {open && (
        <div className="border-t border-white/8 px-4 py-4">
          <dl className="space-y-2.5">
            {specRows.map((row, i) => (
              <div key={i} className="flex gap-4">
                <dt className="text-[8px] tracking-[0.3em] uppercase text-white/25 w-28 flex-shrink-0 pt-0.5"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  {row.label}
                </dt>
                <dd className="text-[10px] text-white/50 leading-relaxed"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function ProductPage() {
  const { slug }    = useParams<{ slug: string }>();
  const projectId   = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
  const { addItem } = useCart();
  const router      = useRouter();

  const [product, setProduct]               = useState<any>(null);
  const [loading, setLoading]               = useState(true);
  const [activeImg, setActiveImg]           = useState(0);
  const [imgFade, setImgFade]               = useState(true);
  const [selectedSize, setSelectedSize]     = useState("");
  const [sizeChartOpen, setSizeChartOpen]   = useState(false);
  const [buying, setBuying]                 = useState(false);
  const [error, setError]                   = useState("");
  const [inquiry, setInquiry]               = useState({ name: "", email: "", message: "" });
  const [inquirySent, setInquirySent]       = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [revealed, setRevealed]             = useState(false);

  useEffect(() => { setTimeout(() => setRevealed(true), 80); }, []);

  useEffect(() => {
    if (!slug) return;
    const query = encodeURIComponent(
      `*[_type=="product"&&slug.current=="${slug}"&&brand=="blackcat"][0]{
        _id,title,slug,category,price,stripePriceId,
        images[]{asset{_ref},caption},
        inventory,description,shortDescription,
        isOneOfOne,hasApparel,isArchiveDrop,
        availableSizes,sizeChart,physicalSpecs,
        unitRange,archiveFileNumber,presale,presaleShipsBy,
        heroLore,hoverLore,
        archiveContext,constructionSpecs,
        closingLine,closingStamp
      }`
    );
    fetch(`https://${projectId}.api.sanity.io/v2021-10-21/data/query/production?query=${query}`)
      .then(r => r.json())
      .then(d => { setProduct(d.result); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug, projectId]);

  const changeImage = (i: number) => {
    if (i === activeImg) return;
    setImgFade(false);
    setTimeout(() => { setActiveImg(i); setImgFade(true); }, 220);
  };

  const images   = product?.images ?? [];
  const sealed   = !loading && product && product.inventory === 0;
  const lowStock = product?.inventory > 0 && product?.inventory <= 10;

  // isArchive: any archive signal present
  const isArchive = !!(
    product?.isArchiveDrop ||
    product?.archiveFileNumber ||
    product?.heroLore
  );

  // Does this product have extended lore sections?
  const hasLoreSections = !!(
    product?.archiveContext?.length ||
    product?.constructionSpecs?.length ||
    product?.closingLine ||
    product?.closingStamp
  );

  // Normalise size chart columns
  const normaliseCols = (raw: any): string[] => {
    if (Array.isArray(raw) && raw.length > 0) return raw;
    if (typeof raw === "string" && raw.length > 0) {
      const quoted = raw.match(/"([^"]+)"/g);
      if (quoted) return quoted.map((s: string) => s.replace(/"/g, "").trim());
      return raw.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const handleAddToCart = () => {
    if (product?.hasApparel && !selectedSize) { setError("Select a size to continue"); return; }
    if (!product?.stripePriceId) { setError("This item isn't available for purchase yet."); return; }
    setError("");
    addItem({
      productId:    product._id,
      slug:         product.slug?.current ?? slug ?? "",
      title:        product.title,
      price:        product.price,
      size:         selectedSize || "N/A",
      image:        product.images?.[0]?.asset?._ref
        ? `https://cdn.sanity.io/images/${projectId}/production/${
            product.images[0].asset._ref.replace("image-","").replace(/-([a-z]+)$/,".$1")
          }?w=200&auto=format`
        : undefined,
      stripePriceId: product.stripePriceId,
      inventory:    product.inventory,
    });
    // Flash confirmation then route to cart
    setBuying(true);
    setTimeout(() => { setBuying(false); router.push("/blackcatarchive/cart"); }, 600);
  };

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry.name || !inquiry.email || !inquiry.message) { setError("Please fill in all fields"); return; }
    setError(""); setInquiryLoading(true);
    try {
      const res  = await fetch("/api/inquiry", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inquiry, productTitle: product.title, productSlug: slug, brand: "blackcat" }),
      });
      const data = await res.json();
      if (data.success) setInquirySent(true);
      else setError(data.error ?? "Failed to send.");
    } catch { setError("Something went wrong."); }
    finally   { setInquiryLoading(false); }
  };

  // ── Loading / not found ──────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <p className="text-[9px] tracking-[0.5em] uppercase text-white/18"
        style={{ fontFamily: "'Courier Prime',monospace" }}>
        Accessing archive...
      </p>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-4">
      <p className="text-[10px] tracking-[0.5em] uppercase text-white/20"
        style={{ fontFamily: "'Courier Prime',monospace" }}>
        Product not found
      </p>
      <Link href="/blackcatarchive/shop"
        className="text-[9px] tracking-[0.4em] uppercase text-white/30 hover:text-white transition-colors"
        style={{ fontFamily: "'Courier Prime',monospace" }}>
        ← Purchase
      </Link>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#080808] text-[#e8e4df]"
      style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.6s ease" }}>

      {/* Grain */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 opacity-[0.055]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat", backgroundSize: "120px 120px",
        }}
      />

      {/* Back */}
      <div className="px-6 md:px-16 pt-10 pb-0 relative z-10">
        <Link href="/blackcatarchive/shop"
          className="text-[8px] tracking-[0.5em] uppercase text-white/18 hover:text-white/50 transition-colors duration-300"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          ← Purchase
        </Link>
      </div>

      {/* ════════════════════════════════════════════════════════
          HERO — only renders if heroLore is set in Sanity
      ════════════════════════════════════════════════════════ */}
      {isArchive && product.heroLore && (
        <section className="relative min-h-[65vh] flex flex-col justify-end px-6 md:px-16 pb-16 overflow-hidden">
          {/* Red fog */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
            style={{
              background: [
                "radial-gradient(ellipse 90% 55% at 50% 100%, rgba(155,12,12,0.2) 0%, transparent 65%)",
                "radial-gradient(ellipse 50% 40% at 25% 60%, rgba(90,6,6,0.1) 0%, transparent 60%)",
              ].join(", "),
            }}
          />
          {/* Faint product image */}
          {images[0]?.asset && (
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:    `url(${imgUrl(images[0].asset._ref, projectId)})`,
                backgroundSize:     "contain",
                backgroundPosition: "center 20%",
                backgroundRepeat:   "no-repeat",
                opacity:            0.06,
              }}
            />
          )}
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              {product.archiveFileNumber && (
                <>
                  <span className="text-[7px] tracking-[0.8em] uppercase text-white/20"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    File {product.archiveFileNumber}
                  </span>
                  <div className="h-px w-8 bg-white/12" />
                </>
              )}
              <span className="text-[7px] tracking-[0.5em] uppercase text-white/15"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                Black Cat Archive
              </span>
            </div>
            <h1 className="text-[clamp(3.5rem,10vw,7rem)] text-white leading-none mb-6"
              style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.03em", whiteSpace: "pre-line" }}>
              {product.title}
            </h1>
            <p className="text-sm text-white/42 leading-[1.9] max-w-md"
              style={{ fontFamily: "'Courier Prime',monospace", whiteSpace: "pre-line" }}>
              {product.heroLore}
            </p>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          PRODUCT — images + purchase panel
      ════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-16 py-14 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">

        {/* ── Images ── */}
        <div>
          <div className="relative aspect-square overflow-hidden bg-[#0f0f0f] border border-white/6 mb-2">
            {images[activeImg]?.asset ? (
              <img
                src={imgUrl(images[activeImg].asset._ref, projectId)}
                alt={images[activeImg].caption ?? product.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: imgFade ? 1 : 0, transition: "opacity 0.25s ease" }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[3rem] text-white/4 select-none"
                  style={{ fontFamily: "'Bebas Neue',sans-serif" }}>BCA</span>
              </div>
            )}
            {/* Red fog bottom */}
            <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(90,6,6,0.14), transparent)" }} />

            {/* Sealed overlay */}
            {sealed && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                style={{ background: "rgba(8,8,8,0.8)", backdropFilter: "blur(2px)" }}>
                <div className="relative flex items-center justify-center mb-4"
                  style={{ width:"90px", height:"90px", border:"1px solid rgba(180,15,15,0.32)", borderRadius:"50%" }}>
                  <div className="absolute inset-2 flex items-center justify-center"
                    style={{ border:"1px solid rgba(180,15,15,0.18)", borderRadius:"50%" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <line x1="6" y1="6" x2="18" y2="18" stroke="rgba(180,15,15,0.55)" strokeWidth="1" strokeLinecap="round"/>
                      <line x1="18" y1="6" x2="6"  y2="18" stroke="rgba(180,15,15,0.55)" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <p className="text-[10px] tracking-[0.7em] uppercase text-white/35 mb-1"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>Archive</p>
                <p className="text-[clamp(1.5rem,4vw,2rem)] text-white/50 leading-none"
                  style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.18em" }}>
                  Sealed
                </p>
                {product.unitRange && (
                  <p className="text-[7px] tracking-[0.5em] uppercase text-white/15 mt-3"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    [{product.unitRange}] — closed
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <>
              <div className="flex gap-2 flex-wrap">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => changeImage(i)}
                    className="relative overflow-hidden bg-[#0f0f0f] flex-shrink-0 transition-all duration-200"
                    style={{
                      width: "72px", height: "72px",
                      border: i === activeImg ? "1px solid rgba(232,228,223,0.35)" : "1px solid rgba(232,228,223,0.06)",
                    }}>
                    {img.asset && (
                      <img src={imgUrl(img.asset._ref, projectId, 200)} alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ opacity: i === activeImg ? 0.9 : 0.35 }} />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-1 flex-wrap">
                {images.map((img: any, i: number) => (
                  <p key={i} className="text-[7px] tracking-widest uppercase text-white/18 text-center"
                    style={{ width: "72px", fontFamily: "'Courier Prime',monospace" }}>
                    {img.caption ?? (i === 0 ? "Front" : i === 1 ? "Back" : `View ${i + 1}`)}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Purchase panel ── */}
        <div className="flex flex-col">

          {/* Category */}
          <p className="text-[8px] tracking-[0.4em] uppercase text-white/22 mb-2"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            {product.category}
            {product.unitRange && (
              <span className="ml-3 text-white/15">· [{product.unitRange}]</span>
            )}
          </p>

          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] text-white leading-none mb-3"
            style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
            {product.title}
          </h2>

          <p className="text-xl text-white/60 mb-4"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            {product.isOneOfOne ? "Inquiry only" : sealed ? "Sealed" : `$${product.price}`}
          </p>

          {/* Inventory indicator */}
          {!product.isOneOfOne && (
            <div className="flex items-center gap-2 mb-6 pb-5 border-b border-white/8">
              <span className="block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: sealed   ? "rgba(180,15,15,0.65)"
                            : lowStock ? "rgba(234,179,8,0.7)"
                            :            "rgba(74,222,128,0.55)",
                }} />
              <span className="text-[9px] tracking-[0.35em] uppercase"
                style={{
                  fontFamily: "'Courier Prime',monospace",
                  color: sealed   ? "rgba(180,15,15,0.55)"
                       : lowStock ? "rgba(234,179,8,0.6)"
                       :            "rgba(232,228,223,0.28)",
                }}>
                {sealed   ? "Archive sealed — no units remain"
                 : lowStock ? `${product.inventory} units remaining`
                 : `${product.inventory} available`}
              </span>
            </div>
          )}

          {/* Description — left border accent */}
          {product.description?.length > 0 && (
            <div className="mb-6 pb-6 border-b border-white/8">
              <div className="pl-4 border-l border-white/12">
                <PortableText value={product.description} components={ptComponents} />
              </div>
            </div>
          )}

          {/* Specs accordion — all product types */}
          {product.physicalSpecs?.specRows?.length > 0 && (
            <SpecsAccordion specRows={product.physicalSpecs.specRows} />
          )}

          {/* Size picker */}
          {product.hasApparel && !product.isOneOfOne && !sealed && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[8px] tracking-[0.5em] uppercase text-white/20"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  Size
                </p>
                <button onClick={() => setSizeChartOpen(s => !s)}
                  className="text-[8px] tracking-[0.3em] uppercase text-white/22 hover:text-white/55 transition-colors underline underline-offset-2"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  {sizeChartOpen ? "Close" : "Size chart"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {(product.availableSizes ?? []).map((size: string) => {
                  const display = size === "2XL" ? "XXL" : size;
                  return (
                    <button key={size} onClick={() => { setSelectedSize(size); setError(""); }}
                      className="px-4 py-2 text-[10px] tracking-[0.3em] uppercase transition-all duration-200"
                      style={{
                        fontFamily: "'Courier Prime',monospace",
                        border:     selectedSize === size ? "1px solid rgba(232,228,223,0.55)" : "1px solid rgba(232,228,223,0.1)",
                        color:      selectedSize === size ? "rgba(232,228,223,0.9)" : "rgba(232,228,223,0.3)",
                        background: selectedSize === size ? "rgba(232,228,223,0.04)" : "transparent",
                      }}>
                      {display}
                    </button>
                  );
                })}
              </div>

              {/* Size chart table */}
              {sizeChartOpen && product.sizeChart?.rows?.length > 0 && (() => {
                const cols = normaliseCols(product.sizeChart.columns);
                return (
                  <div className="overflow-x-auto border border-white/8 mb-3">
                    <table className="w-full text-[9px]"
                      style={{ fontFamily: "'Courier Prime',monospace", tableLayout: "fixed" }}>
                      <colgroup>
                        <col style={{ width: "56px" }} />
                        {cols.slice(1).map((_: string, i: number) => (
                          <col key={i} style={{ width: `${Math.floor(100 / Math.max(cols.slice(1).length, 1))}%` }} />
                        ))}
                      </colgroup>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(232,228,223,0.12)" }}>
                          {cols.map((h: string, i: number) => (
                            <th key={i} className="px-3 py-2.5 text-[8px] tracking-[0.25em] uppercase font-normal"
                              style={{ fontFamily: "'Courier Prime',monospace", color: "rgba(232,228,223,0.45)", textAlign: "left", whiteSpace: "normal", lineHeight: "1.4" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {product.sizeChart.rows.map((row: any) => (
                          <tr key={row.size}
                            onClick={() => { setSelectedSize(row.size); setError(""); }}
                            className="cursor-pointer transition-colors duration-150"
                            style={{
                              borderBottom: "1px solid rgba(232,228,223,0.05)",
                              background: selectedSize === row.size ? "rgba(232,228,223,0.05)" : undefined,
                            }}>
                            <td className="px-3 py-2.5 font-bold"
                              style={{ color: "rgba(232,228,223,0.70)", whiteSpace: "nowrap" }}>
                              {row.size}
                            </td>
                            {(row.measurements ?? []).map((v: string, i: number) => (
                              <td key={i} className="px-3 py-2.5"
                                style={{ color: "rgba(232,228,223,0.32)", whiteSpace: "nowrap" }}>
                                {v}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {product.sizeChart.note && (
                      <p className="px-3 py-2.5 text-[8px] leading-relaxed"
                        style={{ fontFamily: "'Courier Prime',monospace", color: "rgba(232,228,223,0.20)", borderTop: "1px solid rgba(232,228,223,0.08)" }}>
                        {product.sizeChart.note}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-[9px] tracking-[0.3em] text-red-400/60 mb-4"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              {error}
            </p>
          )}

          {/* Add to Cart button */}
          {!product.isOneOfOne && !sealed && (
            <button onClick={handleAddToCart} disabled={buying}
              className="group relative border border-white/25 py-4 text-[10px] tracking-[0.55em] uppercase overflow-hidden transition-colors duration-300 mb-3 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              <span className="relative z-10 text-white group-hover:text-black transition-colors duration-250">
                {buying ? "Added — going to cart..." : `Add to Cart — $${product.price}`}
              </span>
              <span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </button>
          )}

          {sealed && !product.isOneOfOne && (
            <div className="border py-4 text-center mb-3"
              style={{ borderColor: "rgba(180,15,15,0.2)" }}>
              <span className="text-[10px] tracking-[0.5em] uppercase"
                style={{ fontFamily: "'Courier Prime',monospace", color: "rgba(180,15,15,0.45)" }}>
                Archive Sealed
              </span>
            </div>
          )}


          {/* Presale notice */}
          {product.presale && !product.isOneOfOne && !sealed && (
            <div className="flex items-start gap-2 mb-4 px-3 py-2.5"
              style={{ background: "rgba(180,15,15,0.08)", border: "1px solid rgba(180,15,15,0.25)" }}>
              <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="rgba(220,80,80,0.7)" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <p className="text-[7.5px] tracking-[0.35em] uppercase mb-0.5"
                  style={{ fontFamily: "'Courier Prime',monospace", color: "rgba(220,80,80,0.8)" }}>
                  Pre-Sale Item
                </p>
                <p className="text-[7.5px] leading-relaxed"
                  style={{ fontFamily: "'Courier Prime',monospace", color: "rgba(232,228,223,0.35)" }}>
                  {product.presaleShipsBy || "Ships 7–14 business days after the presale window closes."}
                </p>
              </div>
            </div>
          )}

          {/* Security note */}
          {!product.isOneOfOne && !sealed && (
            <div className="flex items-start gap-2 mt-1 mb-4">
              <svg className="w-3 h-3 text-white/14 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-[7.5px] text-white/15 leading-relaxed"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                Secure checkout via Stripe. Card details never touch this server. US shipping only.
              </p>
            </div>
          )}

          {/* 1-of-1 inquiry form */}
          {product.isOneOfOne && (
            <div className="border border-white/10 p-6 mt-2">
              <p className="text-[9px] tracking-[0.5em] uppercase text-white/22 mb-5"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                Submit an Inquiry
              </p>
              {inquirySent ? (
                <p className="text-sm text-white/40 leading-relaxed"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  Inquiry received. We&apos;ll be in touch within 48 hours.
                </p>
              ) : (
                <form onSubmit={handleInquiry} className="flex flex-col gap-3">
                  <input type="text" placeholder="Your name" value={inquiry.name}
                    onChange={e => setInquiry(p => ({ ...p, name: e.target.value }))}
                    className="bg-transparent border border-white/10 px-4 py-2.5 text-xs text-white placeholder:text-white/18 focus:outline-none focus:border-white/28 transition-colors"
                    style={{ fontFamily: "'Courier Prime',monospace" }} />
                  <input type="email" placeholder="Your email" value={inquiry.email}
                    onChange={e => setInquiry(p => ({ ...p, email: e.target.value }))}
                    className="bg-transparent border border-white/10 px-4 py-2.5 text-xs text-white placeholder:text-white/18 focus:outline-none focus:border-white/28 transition-colors"
                    style={{ fontFamily: "'Courier Prime',monospace" }} />
                  <textarea placeholder="Tell us why this piece is for you" value={inquiry.message}
                    onChange={e => setInquiry(p => ({ ...p, message: e.target.value }))}
                    rows={4}
                    className="bg-transparent border border-white/10 px-4 py-2.5 text-xs text-white placeholder:text-white/18 focus:outline-none focus:border-white/28 transition-colors resize-none"
                    style={{ fontFamily: "'Courier Prime',monospace" }} />
                  {error && (
                    <p className="text-[9px] tracking-[0.3em] text-red-400/60"
                      style={{ fontFamily: "'Courier Prime',monospace" }}>
                      {error}
                    </p>
                  )}
                  <button type="submit" disabled={inquiryLoading}
                    className="border border-white/18 py-3 text-[10px] tracking-[0.5em] uppercase text-white/45 hover:text-white hover:border-white/45 transition-all duration-200 disabled:opacity-40"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    {inquiryLoading ? "Sending..." : "Send Inquiry"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          ARCHIVE SECTIONS — context, construction, closing stamp
          Only renders when fields are populated in Sanity
      ════════════════════════════════════════════════════════ */}
      {hasLoreSections && (
        <>
          {/* Section divider with label */}
          <div className="relative mx-6 md:mx-16 max-w-6xl">
            <div className="h-px bg-white/6" />
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 flex items-center gap-3 bg-[#080808] px-4">
              <div className="h-px w-6 bg-white/10" />
              <span className="text-[7px] tracking-[0.6em] uppercase text-white/15"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                Archive Record
              </span>
              <div className="h-px w-6 bg-white/10" />
            </div>
          </div>

          {/* ── CONTEXT + CONSTRUCTION — dark background section ── */}
          {(product.archiveContext?.length > 0 || product.constructionSpecs?.length > 0) && (
            <section className="bg-[#0d0d0d] border-y border-white/5 mt-6">
              <div className="px-6 md:px-16 py-16 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                  {/* Context paragraphs */}
                  {product.archiveContext?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <span className="text-[7px] tracking-[0.7em] uppercase text-white/20"
                          style={{ fontFamily: "'Courier Prime',monospace" }}>
                          — Context
                        </span>
                        <div className="h-px flex-1 bg-white/6" />
                      </div>
                      <div className="space-y-4 pl-4 border-l border-white/8">
                        {product.archiveContext.map((para: string, i: number) => (
                          <p key={i} className="text-sm text-white/45 leading-[1.95]"
                            style={{ fontFamily: "'Courier Prime',monospace" }}>
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Construction numbered list */}
                  {product.constructionSpecs?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <span className="text-[7px] tracking-[0.7em] uppercase text-white/20"
                          style={{ fontFamily: "'Courier Prime',monospace" }}>
                          — Construction
                        </span>
                        <div className="h-px flex-1 bg-white/6" />
                      </div>
                      <ul className="space-y-3">
                        {product.constructionSpecs.map((spec: string, i: number) => (
                          <li key={i} className="flex items-start gap-4">
                            <span className="text-[8px] text-white/18 mt-0.5 flex-shrink-0 tabular-nums"
                              style={{ fontFamily: "'Courier Prime',monospace" }}>
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="text-xs text-white/45 leading-relaxed"
                              style={{ fontFamily: "'Courier Prime',monospace" }}>
                              {spec}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            </section>
          )}

          {/* ── CLOSING STAMP ── */}
          {(product.closingLine || product.closingStamp) && (
            <section className="relative overflow-hidden py-24 px-6 md:px-16">
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(120,8,8,0.12) 0%, transparent 65%)",
                }}
              />
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <div className="flex items-center justify-center gap-3 mb-10">
                  <div className="h-px w-12 bg-white/8" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                  <div className="h-px w-12 bg-white/8" />
                </div>

                {product.closingLine && (
                  <p className="text-base text-white/30 leading-[1.9] mb-8 italic"
                    style={{ fontFamily: "'Courier Prime',monospace", whiteSpace: "pre-line" }}>
                    {product.closingLine}
                  </p>
                )}

                {product.closingStamp && (
                  <p className="text-[clamp(1.2rem,3.5vw,2rem)] text-white/55 leading-tight"
                    style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.1em" }}>
                    {product.closingStamp}
                  </p>
                )}

                {product.archiveFileNumber && (
                  <div className="flex items-center justify-center gap-4 mt-10">
                    <div className="h-px w-12 bg-white/6" />
                    <span className="text-[7px] tracking-[0.6em] text-white/12"
                      style={{ fontFamily: "'Courier Prime',monospace" }}>
                      BCA / FILE {product.archiveFileNumber}
                    </span>
                    <div className="h-px w-12 bg-white/6" />
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}