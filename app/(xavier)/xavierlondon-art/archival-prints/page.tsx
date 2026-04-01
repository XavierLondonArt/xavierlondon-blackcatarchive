"use client";

// app/(xavier)/xavierlondon-art/archival-prints/page.tsx
// Each print can have two purchaseable tiers:
//   Limited edition — hand-signed, numbered, Certificate of Authenticity, higher price
//   Open edition   — digitally signed, no number, lower price
// Both tiers handled via separate Stripe price IDs stored in Sanity printEditions field.

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

function imgUrl(ref: string, projectId: string, w = 700) {
  return `https://cdn.sanity.io/images/${projectId}/production/${
    ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
  }?w=${w}&auto=format`;
}

// ── Edition selector modal ────────────────────────────────────────────────────

function EditionModal({
  print,
  projectId,
  onClose,
}: {
  print: any;
  projectId: string;
  onClose: () => void;
}) {
  const [selectedTier, setSelectedTier] = useState<"limited" | "open" | null>(null);
  const [buying, setBuying] = useState(false);
  const [error, setError]   = useState("");

  const ed      = print.printEditions ?? {};
  const hasLtd  = ed.limitedActive && ed.limitedStripePriceId;
  const hasOpen = ed.openActive    && ed.openStripePriceId;
  const ltdLeft = hasLtd ? Math.max(0, (ed.limitedSize ?? 0) - (ed.limitedSold ?? 0)) : 0;

  const handlePurchase = async () => {
    if (!selectedTier) return;
    const priceId = selectedTier === "limited" ? ed.limitedStripePriceId : ed.openStripePriceId;
    if (!priceId) { setError("This edition is not yet available for purchase."); return; }
    setError(""); setBuying(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand:         "xavier",
          stripePriceId: priceId,
          quantity:      1,
          productTitle:  `${print.title} — ${selectedTier === "limited" ? "Limited Edition" : "Open Edition"}`,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Checkout failed — please try again.");
    } catch { setError("Something went wrong. Please try again."); }
    finally   { setBuying(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(247,244,239,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="bg-[#f7f4ef] border border-[#1a1a1a]/12 max-w-lg w-full p-10 relative"
        onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-5 right-6 text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors text-xl leading-none">
          ×
        </button>

        <p className="text-[8px] tracking-[0.5em] uppercase text-[#1a1a1a]/28 mb-3"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Select edition
        </p>
        <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-light text-[#1a1a1a] leading-tight mb-8"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          {print.title}
        </h2>

        <div className="space-y-3 mb-8">

          {/* Limited edition — available */}
          {hasLtd && ltdLeft > 0 && (
            <button
              onClick={() => setSelectedTier("limited")}
              className="w-full text-left border p-5 transition-all duration-200"
              style={{
                borderColor:     selectedTier === "limited" ? "rgba(26,26,26,0.5)" : "rgba(26,26,26,0.12)",
                backgroundColor: selectedTier === "limited" ? "rgba(26,26,26,0.03)" : "transparent",
              }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-light text-[#1a1a1a] mb-1"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    Limited Edition
                  </p>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#1a1a1a]/38">
                    {ltdLeft} of {ed.limitedSize} remaining
                  </p>
                </div>
                <p className="text-base font-light text-[#1a1a1a]/70 flex-shrink-0"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  ${ed.limitedPrice}
                </p>
              </div>
              {ed.limitedIncludes?.length > 0 && (
                <ul className="space-y-1">
                  {ed.limitedIncludes.map((item: string) => (
                    <li key={item} className="flex items-center gap-2 text-[10px] text-[#1a1a1a]/45"
                      style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                      <span className="w-1 h-1 rounded-full bg-[#1a1a1a]/25 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          )}

          {/* Limited edition — sold out */}
          {hasLtd && ltdLeft === 0 && (
            <div className="w-full text-left border border-[#1a1a1a]/8 p-5 opacity-40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-light text-[#1a1a1a]"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  Limited Edition
                </p>
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#1a1a1a]/50">Sold out</p>
              </div>
            </div>
          )}

          {/* Open edition */}
          {hasOpen && (
            <button
              onClick={() => setSelectedTier("open")}
              className="w-full text-left border p-5 transition-all duration-200"
              style={{
                borderColor:     selectedTier === "open" ? "rgba(26,26,26,0.5)" : "rgba(26,26,26,0.12)",
                backgroundColor: selectedTier === "open" ? "rgba(26,26,26,0.03)" : "transparent",
              }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-light text-[#1a1a1a] mb-1"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    Open Edition
                  </p>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#1a1a1a]/38">
                    Unlimited run
                  </p>
                </div>
                <p className="text-base font-light text-[#1a1a1a]/70 flex-shrink-0"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  ${ed.openPrice}
                </p>
              </div>
              {ed.openIncludes?.length > 0 && (
                <ul className="space-y-1">
                  {ed.openIncludes.map((item: string) => (
                    <li key={item} className="flex items-center gap-2 text-[10px] text-[#1a1a1a]/45"
                      style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                      <span className="w-1 h-1 rounded-full bg-[#1a1a1a]/25 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          )}

        </div>

        {error && <p className="text-[10px] text-red-500/65 mb-4">{error}</p>}

        <button onClick={handlePurchase}
          disabled={!selectedTier || buying}
          className="w-full py-4 text-[9px] tracking-[0.5em] uppercase bg-[#1a1a1a] text-[#f7f4ef] hover:bg-[#2e2e2e] transition-colors duration-300 disabled:opacity-30"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          {buying ? "Redirecting…" : "Purchase"}
        </button>

        {ed.paperSpec && (
          <p className="text-[9px] text-[#1a1a1a]/28 mt-5 leading-relaxed text-center"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            {ed.paperSpec}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Print card ────────────────────────────────────────────────────────────────

function PrintCard({ print, projectId, onSelect }: {
  print: any;
  projectId: string;
  onSelect: (p: any) => void;
}) {
  const [hover, setHover] = useState(false);
  const src   = print.images?.[0]?.asset?._ref ? imgUrl(print.images[0].asset._ref, projectId) : null;
  const ed    = print.printEditions ?? {};
  const hasLtd  = ed.limitedActive && (ed.limitedSold ?? 0) < (ed.limitedSize ?? 0);
  const hasOpen = ed.openActive;

  // Only include the price of a tier if that tier is currently active.
  // This prevents an inactive open edition's lower price from pulling
  // down the "From $X" figure while only limited editions are on sale.
  const prices = [
    hasLtd  ? (ed.limitedPrice ?? null) : null,
    hasOpen ? (ed.openPrice   ?? null)  : null,
  ].filter((p): p is number => p !== null);
  const lowestPrice = prices.length ? Math.min(...prices) : null;

  return (
    <div className="group" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>

      {/* Image — links to detail page */}
      <Link href={`/xavierlondon-art/shop/${print.slug?.current}`}>
        <div className="relative aspect-square bg-[#ede9e2] overflow-hidden mb-5 cursor-pointer">
          {src ? (
            <Image src={src} alt={print.title} fill
              className="object-cover transition-transform duration-700 ease-out"
              style={{ opacity: hover ? 0.95 : 0.86, transform: hover ? "scale(1.04)" : "scale(1)" }}
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[8px] tracking-wider uppercase text-[#1a1a1a]/15">XLA</span>
            </div>
          )}

          {/* Edition status badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasLtd && (
              <span className="text-[7px] tracking-[0.3em] uppercase bg-[#f7f4ef]/90 text-[#1a1a1a]/55 border border-[#1a1a1a]/10 px-2 py-0.5"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                Ltd ed. — {(ed.limitedSize ?? 0) - (ed.limitedSold ?? 0)} left
              </span>
            )}
            {!hasLtd && ed.limitedActive && (
              <span className="text-[7px] tracking-[0.3em] uppercase bg-[#f7f4ef]/90 text-[#1a1a1a]/30 border border-[#1a1a1a]/8 px-2 py-0.5"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                Ltd edition sold out
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <Link href={`/xavierlondon-art/shop/${print.slug?.current}`}>
          <h3 className="text-base font-light text-[#1a1a1a] leading-snug hover:opacity-55 transition-opacity duration-300"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            {print.title}
          </h3>
        </Link>
        {print.year && <span className="text-[8px] text-[#1a1a1a]/25 mt-1 flex-shrink-0">{print.year}</span>}
      </div>

      {print.series?.title && (
        <p className="text-[8px] tracking-[0.3em] uppercase text-[#1a1a1a]/22 mb-1.5"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          {print.series.title}
        </p>
      )}

      {/* Price range + purchase CTA */}
      <div className="flex items-center justify-between gap-3 mt-2">
        <p className="text-[10px] tracking-wider text-[#1a1a1a]/38">
          {lowestPrice != null ? `From $${lowestPrice}` : "—"}
        </p>
        {(hasLtd || hasOpen) && (
          <button onClick={() => onSelect(print)}
            className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/40 border border-[#1a1a1a]/14 px-3 py-1.5 hover:bg-[#1a1a1a] hover:text-[#f7f4ef] hover:border-[#1a1a1a] transition-all duration-300"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            Purchase
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ArchivalPrintsPage() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
  const [prints, setPrints]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<any | null>(null);

  useEffect(() => {
    const query = encodeURIComponent(
      `*[_type=="product"&&brand=="xavier"&&category=="reproduction"]|order(featured desc,_createdAt desc){
        _id,title,slug,price,images[]{asset{_ref}},
        year,medium,shortDescription,featured,
        series->{_id,title,slug},
        printEditions{
          limitedActive,limitedSize,limitedSold,limitedPrice,limitedStripePriceId,limitedIncludes,
          openActive,openPrice,openStripePriceId,openIncludes,paperSpec
        }
      }`
    );
    fetch(`https://${projectId}.api.sanity.io/v2021-10-21/data/query/production?query=${query}`)
      .then(r => r.json())
      .then(d => { setPrints(d.result ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [projectId]);

  return (
    <>
      <div className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a]">

        {/* Header */}
        <div className="max-w-6xl mx-auto px-8 md:px-16 pt-20 pb-14 border-b border-[#1a1a1a]/8">
          <p className="text-[9px] tracking-[0.6em] uppercase text-[#1a1a1a]/28 mb-3"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            Xavier London Art
          </p>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light text-[#1a1a1a] leading-none mb-5"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            Archival Prints
          </h1>
          <p className="text-sm font-light text-[#1a1a1a]/40 max-w-lg leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            Limited edition and open edition prints of original works. Each piece
            offers two tiers — a numbered, hand-signed limited run and an open
            edition with a digital signature.
          </p>
        </div>

        {/* Edition explanation strip */}
        <div className="border-b border-[#1a1a1a]/6 bg-[#f0ece4]">
          <div className="max-w-6xl mx-auto px-8 md:px-16 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-5">
              <div className="w-px h-full bg-[#1a1a1a]/10 flex-shrink-0 self-stretch" />
              <div>
                <p className="text-[8px] tracking-[0.5em] uppercase text-[#1a1a1a]/35 mb-2"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  Limited Edition
                </p>
                <p className="text-xs font-light text-[#1a1a1a]/50 leading-relaxed"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  A fixed number of prints — hand-signed, hand-numbered, and sent with a
                  Certificate of Authenticity. When the edition closes, it is retired.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-px h-full bg-[#1a1a1a]/10 flex-shrink-0 self-stretch" />
              <div>
                <p className="text-[8px] tracking-[0.5em] uppercase text-[#1a1a1a]/35 mb-2"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  Open Edition
                </p>
                <p className="text-xs font-light text-[#1a1a1a]/50 leading-relaxed"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  No fixed quantity. Digitally signed — the signature is embedded in
                  the file and on the print margin. Available ongoing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-40">
            <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/22">Loading…</p>
          </div>
        )}

        {/* Print grid */}
        {!loading && prints.length > 0 && (
          <div className="max-w-6xl mx-auto px-8 md:px-16 py-16
            grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
            {prints.map((print) => (
              <PrintCard key={print._id} print={print} projectId={projectId}
                onSelect={setSelected} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && prints.length === 0 && (
          <div className="flex flex-col items-center justify-center py-48 text-center px-8">
            <p className="text-[clamp(1.4rem,3vw,2.2rem)] font-light text-[#1a1a1a]/12 mb-6"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              First prints arriving soon.
            </p>
            <p className="text-[8px] tracking-[0.5em] uppercase text-[#1a1a1a]/18 mb-8">
              Add a product in Sanity Studio with category "Reproduction" to display it here
            </p>
            <Link href="/xavierlondon-art/fine-art"
              className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/32 hover:text-[#1a1a1a] transition-colors duration-300">
              Browse originals →
            </Link>
          </div>
        )}

        {/* Print spec footer */}
        {!loading && prints.length > 0 && (
          <section className="bg-[#f0ece4] border-t border-[#1a1a1a]/8 mt-8">
            <div className="max-w-5xl mx-auto px-8 md:px-16 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
              {[
                { label: "Paper",     body: "300 gsm fine art cotton rag. Acid-free, archival."         },
                { label: "Inks",      body: "12-colour Ultrachrome HDX pigment. 200+ year fade rating." },
                { label: "Editions",  body: "Limited editions are hand-numbered and retired when sold." },
                { label: "Signature", body: "Limited: pencil on lower right. Open: embedded digital."  },
              ].map(({ label, body }) => (
                <div key={label}>
                  <p className="text-[8px] tracking-[0.5em] uppercase text-[#1a1a1a]/25 mb-3"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>{label}</p>
                  <p className="text-xs font-light text-[#1a1a1a]/45 leading-[1.85]"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>{body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="pb-16" />
      </div>

      {/* Edition selector modal */}
      {selected && (
        <EditionModal print={selected} projectId={projectId} onClose={() => setSelected(null)} />
      )}
    </>
  );
}