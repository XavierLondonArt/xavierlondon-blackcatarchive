"use client";

// app/(xavier)/xavierlondon-art/shop/[slug]/page.tsx

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { useXavierCart } from "@/components/xavier/XavierCartContent";

// ── Helpers ──────────────────────────────────────────────────────────────────

function imgUrl(ref: string, projectId: string, w = 1000) {
  return `https://cdn.sanity.io/images/${projectId}/production/${
    ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
  }?auto=format&w=${w}`;
}

// ── Portable Text components ─────────────────────────────────────────────────

const ptComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="mb-4 text-sm font-light text-[#1a1a1a]/60 leading-[1.9]"
        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="text-[#1a1a1a]/80 font-medium">{children}</strong>,
    em:     ({ children }: any) => <em className="italic text-[#1a1a1a]/55">{children}</em>,
  },
};

// ── Specs accordion ──────────────────────────────────────────────────────────

function SpecsAccordion({ specRows }: { specRows: Array<{ label: string; value: string }> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[#1a1a1a]/10">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/40"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Specifications
        </span>
        <span className="text-[#1a1a1a]/30 transition-transform duration-300 select-none text-lg leading-none"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", display: "inline-block" }}>
          +
        </span>
      </button>
      {open && (
        <div className="pb-5">
          <dl className="space-y-3">
            {specRows.map((row, i) => (
              <div key={i} className="flex gap-6">
                <dt className="text-[8px] tracking-[0.35em] uppercase text-[#1a1a1a]/30 w-24 flex-shrink-0 pt-0.5"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  {row.label}
                </dt>
                <dd className="text-sm font-light text-[#1a1a1a]/55 leading-relaxed"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
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

// ── Size chart accordion ─────────────────────────────────────────────────────

function SizeChart({ sizeChart }: { sizeChart: any }) {
  const [open, setOpen] = useState(false);
  if (!sizeChart?.columns?.length) return null;
  return (
    <div className="border-t border-[#1a1a1a]/10">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/40"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Size Guide
        </span>
        <span className="text-[#1a1a1a]/30 transition-transform duration-300 select-none text-lg leading-none"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", display: "inline-block" }}>
          +
        </span>
      </button>
      {open && (
        <div className="pb-5 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {sizeChart.columns.map((col: string, i: number) => (
                  <th key={i} className="text-left text-[8px] tracking-[0.3em] uppercase text-[#1a1a1a]/35 py-2 pr-6 border-b border-[#1a1a1a]/8 font-normal whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizeChart.rows?.map((row: any, i: number) => (
                <tr key={i} className="border-b border-[#1a1a1a]/5">
                  <td className="py-2.5 pr-6 font-light text-[#1a1a1a]/70">{row.size}</td>
                  {row.measurements?.map((m: string, j: number) => (
                    <td key={j} className="py-2.5 pr-6 font-light text-[#1a1a1a]/45">{m}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {sizeChart.note && (
            <p className="text-[10px] text-[#1a1a1a]/30 mt-3 italic"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              {sizeChart.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function XavierProductPage() {
  const { slug }    = useParams<{ slug: string }>();
  const projectId   = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
  const { addItem } = useXavierCart();
  const router      = useRouter();

  const [product, setProduct]             = useState<any>(null);
  const [loading, setLoading]             = useState(true);
  const [activeImg, setActiveImg]         = useState(0);
  const [fade, setFade]                   = useState(true);
  const [selectedSize, setSelectedSize]   = useState("");
  const [buying, setBuying]               = useState(false);
  const [addedToCart, setAddedToCart]     = useState(false);
  const [error, setError]                 = useState("");
  const [revealed, setRevealed]           = useState(false);

  // Inquiry form state
  const [inquiry, setInquiry]             = useState({ name: "", email: "", message: "" });
  const [inquirySent, setInquirySent]     = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  useEffect(() => { setTimeout(() => setRevealed(true), 60); }, []);

  useEffect(() => {
    if (!slug) return;
    const query = encodeURIComponent(
      `*[_type=="product"&&slug.current=="${slug}"&&brand=="xavier"][0]{
        _id,title,slug,category,price,stripePriceId,
        images[]{asset{_ref},caption},
        inventory,description,shortDescription,
        isOneOfOne,hasApparel,availableSizes,sizeChart,physicalSpecs
      }`
    );
    fetch(`https://${projectId}.api.sanity.io/v2021-10-21/data/query/production?query=${query}`)
      .then(r => r.json())
      .then(d => { setProduct(d.result ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug, projectId]);

  const changeImg = (i: number) => {
    if (i === activeImg) return;
    setFade(false);
    setTimeout(() => { setActiveImg(i); setFade(true); }, 220);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.hasApparel && !selectedSize) { setError("Please select a size."); return; }
    setError("");
    addItem({
      productId:    product._id,
      slug:         product.slug?.current,
      title:        product.title,
      price:        product.price,
      size:         selectedSize || "N/A",
      image:        product.images?.[0]?.asset?._ref
                      ? imgUrl(product.images[0].asset._ref, projectId, 400)
                      : undefined,
      stripePriceId: product.stripePriceId ?? "",
      inventory:    product.inventory,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  const handleBuyNow = async () => {
    if (!product?.stripePriceId) { setError("This piece is not yet available for direct purchase."); return; }
    if (product.hasApparel && !selectedSize) { setError("Please select a size."); return; }
    setError(""); setBuying(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand:        "xavier",
          stripePriceId: product.stripePriceId,
          quantity:     1,
          size:         selectedSize || "N/A",
          productTitle: product.title,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Checkout failed — please try again.");
    } catch { setError("Something went wrong. Please try again."); }
    finally   { setBuying(false); }
  };

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry.name || !inquiry.email || !inquiry.message) return;
    setInquiryLoading(true);
    try {
      await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inquiry, productTitle: product.title, productSlug: slug }),
      });
      setInquirySent(true);
    } catch {}
    finally { setInquiryLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
        <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/25"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] flex flex-col items-center justify-center gap-6">
        <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/30">Work not found</p>
        <Link href="/xavierlondon-art/shop"
          className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors duration-300">
          ← Return to collections
        </Link>
      </div>
    );
  }

  const images    = product.images ?? [];
  const sold      = product.inventory === 0 && !product.isOneOfOne;
  const isInquiry = product.isOneOfOne || product.category === "archival";
  const mainSrc   = images[activeImg]?.asset?._ref ? imgUrl(images[activeImg].asset._ref, projectId) : null;

  return (
    <div className="min-h-screen bg-[#f7f4ef]"
      style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.6s ease" }}>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-8 md:px-16 pt-8">
        <nav className="flex items-center gap-3 text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/30">
          <Link href="/xavierlondon-art/shop" className="hover:text-[#1a1a1a] transition-colors duration-200">
            Collections
          </Link>
          <span>/</span>
          <span className="text-[#1a1a1a]/50">{product.title}</span>
        </nav>
      </div>

      {/* Main product area */}
      <div className="max-w-6xl mx-auto px-8 md:px-16 py-12 grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">

        {/* ── Image column ── */}
        <div>
          {/* Main image */}
          <div className="relative aspect-[3/4] bg-[#ede9e2] overflow-hidden mb-3">
            {mainSrc ? (
              <img src={mainSrc} alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: fade ? 1 : 0, transition: "opacity 0.25s ease" }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/18"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  Xavier London Art
                </span>
              </div>
            )}
            {sold && (
              <div className="absolute inset-0 bg-[#f7f4ef]/60 flex items-center justify-center">
                <span className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/40 border border-[#1a1a1a]/15 px-4 py-2"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  Acquired
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img: any, i: number) => {
                const tsrc = img.asset?._ref ? imgUrl(img.asset._ref, projectId, 200) : null;
                return (
                  <button key={i} onClick={() => changeImg(i)}
                    className="relative flex-shrink-0 w-16 aspect-square overflow-hidden transition-opacity duration-200"
                    style={{ opacity: i === activeImg ? 1 : 0.45 }}>
                    {tsrc && <img src={tsrc} alt="" className="w-full h-full object-cover" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Info column ── */}
        <div className="flex flex-col">

          {/* Category */}
          <p className="text-[8px] tracking-[0.5em] uppercase text-[#1a1a1a]/30 mb-4"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            {product.category === "art" ? "Fine Art" : product.category}
          </p>

          {/* Title */}
          <h1 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-light text-[#1a1a1a] leading-tight mb-3"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            {product.title}
          </h1>

          {/* Short desc */}
          {product.shortDescription && (
            <p className="text-sm font-light text-[#1a1a1a]/50 leading-relaxed mb-5"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              {product.shortDescription}
            </p>
          )}

          {/* Price */}
          <p className="text-lg font-light text-[#1a1a1a]/70 mb-8 tracking-wide">
            {isInquiry ? "Inquiry only" : sold ? "—" : `$${product.price}`}
          </p>

          {/* Description */}
          {product.description && (
            <div className="mb-8 border-t border-[#1a1a1a]/8 pt-6">
              <PortableText value={product.description} components={ptComponents} />
            </div>
          )}

          {/* ── Add to cart / inquiry ── */}
          {!isInquiry && !sold && (
            <div className="space-y-4 mb-8">
              {/* Size selector */}
              {product.hasApparel && product.availableSizes?.length > 0 && (
                <div>
                  <p className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/35 mb-3">
                    Select size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.availableSizes.map((size: string) => (
                      <button key={size} onClick={() => setSelectedSize(size)}
                        className="px-4 py-2 text-xs tracking-widest uppercase border transition-all duration-200"
                        style={{
                          fontFamily:       "'Cormorant Garamond','Georgia',serif",
                          borderColor:      selectedSize === size ? "rgba(26,26,26,0.6)" : "rgba(26,26,26,0.15)",
                          color:            selectedSize === size ? "rgba(26,26,26,0.85)" : "rgba(26,26,26,0.4)",
                          backgroundColor:  selectedSize === size ? "rgba(26,26,26,0.04)" : "transparent",
                        }}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p className="text-[10px] text-red-500/70 tracking-wide">{error}</p>
              )}

              <div className="flex flex-col gap-2.5">
                <button onClick={handleAddToCart}
                  className="w-full py-3.5 text-[9px] tracking-[0.5em] uppercase border border-[#1a1a1a]/20 text-[#1a1a1a]/60 hover:border-[#1a1a1a]/50 hover:text-[#1a1a1a] hover:bg-[#1a1a1a]/[0.02] transition-all duration-300"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  {addedToCart ? "Added to bag ✓" : "Add to bag"}
                </button>
                {product.stripePriceId && (
                  <button onClick={handleBuyNow} disabled={buying}
                    className="w-full py-3.5 text-[9px] tracking-[0.5em] uppercase bg-[#1a1a1a] text-[#f7f4ef] hover:bg-[#2e2e2e] transition-colors duration-300 disabled:opacity-50"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    {buying ? "Redirecting…" : "Purchase now"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Inquiry form ── */}
          {isInquiry && (
            <div className="mb-8">
              {!inquirySent ? (
                <form onSubmit={handleInquiry} className="space-y-4">
                  <p className="text-[8px] tracking-[0.5em] uppercase text-[#1a1a1a]/30 mb-5"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    Inquire about this work
                  </p>
                  {[
                    { key: "name",    placeholder: "Your name",    type: "text"  },
                    { key: "email",   placeholder: "Your email",   type: "email" },
                    { key: "message", placeholder: "Your message", type: "textarea" },
                  ].map(f => (
                    f.type === "textarea" ? (
                      <textarea key={f.key} rows={4}
                        placeholder={f.placeholder}
                        value={inquiry[f.key as keyof typeof inquiry]}
                        onChange={e => setInquiry(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full bg-transparent border-b border-[#1a1a1a]/15 py-3 text-sm font-light text-[#1a1a1a] placeholder:text-[#1a1a1a]/25 focus:outline-none focus:border-[#1a1a1a]/40 transition-colors duration-300 resize-none"
                        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                      />
                    ) : (
                      <input key={f.key} type={f.type}
                        placeholder={f.placeholder}
                        value={inquiry[f.key as keyof typeof inquiry]}
                        onChange={e => setInquiry(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full bg-transparent border-b border-[#1a1a1a]/15 py-3 text-sm font-light text-[#1a1a1a] placeholder:text-[#1a1a1a]/25 focus:outline-none focus:border-[#1a1a1a]/40 transition-colors duration-300"
                        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
                      />
                    )
                  ))}
                  <button type="submit" disabled={inquiryLoading}
                    className="w-full py-3.5 text-[9px] tracking-[0.5em] uppercase bg-[#1a1a1a] text-[#f7f4ef] hover:bg-[#2e2e2e] transition-colors duration-300 disabled:opacity-50 mt-2"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    {inquiryLoading ? "Sending…" : "Send inquiry"}
                  </button>
                </form>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm font-light text-[#1a1a1a]/60 mb-2"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    Inquiry received.
                  </p>
                  <p className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/30">
                    I'll be in touch shortly.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Specs + size chart accordions */}
          {product.physicalSpecs?.specRows?.length > 0 && (
            <SpecsAccordion specRows={product.physicalSpecs.specRows} />
          )}
          {product.hasApparel && product.sizeChart && (
            <SizeChart sizeChart={product.sizeChart} />
          )}

          {/* Back link */}
          <div className="mt-10 pt-6 border-t border-[#1a1a1a]/8">
            <Link href="/xavierlondon-art/shop"
              className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors duration-300">
              ← All collections
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
      `}</style>
    </div>
  );
}
