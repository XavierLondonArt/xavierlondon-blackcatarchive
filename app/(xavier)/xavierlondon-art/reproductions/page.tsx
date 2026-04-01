"use client";

// app/(xavier)/xavierlondon-art/reproductions/page.tsx
// Limited edition fine art prints. Each is a reproduction of an original work.

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

function imgUrl(ref: string, projectId: string, w = 700) {
  return `https://cdn.sanity.io/images/${projectId}/production/${
    ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
  }?w=${w}&auto=format`;
}

export default function ReproductionsPage() {
  const [pieces, setPieces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;

  useEffect(() => {
    const query = encodeURIComponent(
      `*[_type=="product"&&brand=="xavier"&&category=="reproduction"]
      |order(featured desc,_createdAt desc){
        _id,title,slug,price,images[]{asset{_ref}},
        inventory,isOneOfOne,medium,year,editionSize,shortDescription,featured,
        series->{_id,title,slug}
      }`
    );
    fetch(`https://${projectId}.api.sanity.io/v2021-10-21/data/query/production?query=${query}`)
      .then(r => r.json())
      .then(d => { setPieces(d.result ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a]">

      {/* Header */}
      <div className="max-w-6xl mx-auto px-8 md:px-16 pt-20 pb-16 border-b border-[#1a1a1a]/8">
        <p className="text-[9px] tracking-[0.6em] uppercase text-[#1a1a1a]/30 mb-3"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Xavier London Art
        </p>
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light text-[#1a1a1a] leading-none mb-6"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Reproductions
        </h1>
        <p className="text-sm font-light text-[#1a1a1a]/42 leading-[1.85] max-w-lg"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Limited edition archival prints of original works. Each reproduction is
          produced to exacting standards — the same pigments, the same color depth —
          on heavyweight fine art paper. Numbered and signed.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-40">
          <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/25">Loading…</p>
        </div>
      )}

      {/* Grid */}
      {!loading && pieces.length > 0 && (
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-16
          grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">
          {pieces.map((piece, i) => {
            const src  = piece.images?.[0]?.asset?._ref ? imgUrl(piece.images[0].asset._ref, projectId) : null;
            const sold = piece.inventory === 0 && !piece.isOneOfOne;
            return (
              <Link key={piece._id} href={`/xavierlondon-art/shop/${piece.slug?.current}`}
                className="group block">

                {/* Image — square crop suits prints */}
                <div className={`relative ${i % 4 === 2 ? "aspect-[4/5]" : "aspect-square"} bg-[#ede9e2] overflow-hidden mb-5`}>
                  {src ? (
                    <Image src={src} alt={piece.title} fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      style={{ opacity: sold ? 0.4 : 0.88 }}
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] tracking-wider uppercase text-[#1a1a1a]/15">XLA</span>
                    </div>
                  )}
                  {sold && (
                    <div className="absolute inset-0 bg-[#f7f4ef]/55 flex items-center justify-center">
                      <span className="text-[7px] tracking-[0.4em] uppercase text-[#1a1a1a]/35 border border-[#1a1a1a]/12 px-2 py-1">
                        Sold Out
                      </span>
                    </div>
                  )}
                  {/* Edition badge */}
                  {piece.editionSize && !sold && (
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[7px] tracking-[0.3em] uppercase text-[#1a1a1a]/45 bg-[#f7f4ef]/85 px-2 py-1 border border-[#1a1a1a]/10"
                        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                        {piece.editionSize}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h3 className="text-base font-light text-[#1a1a1a] leading-snug group-hover:opacity-55 transition-opacity duration-300"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    {piece.title}
                  </h3>
                  {piece.year && (
                    <span className="text-[8px] text-[#1a1a1a]/28 mt-1 flex-shrink-0">{piece.year}</span>
                  )}
                </div>

                {piece.series?.title && (
                  <p className="text-[8px] tracking-[0.3em] uppercase text-[#1a1a1a]/25 mb-1"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    {piece.series.title}
                  </p>
                )}

                {piece.medium && (
                  <p className="text-[9px] text-[#1a1a1a]/30 mb-1"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    {piece.medium}
                  </p>
                )}

                <p className="text-[10px] tracking-wider text-[#1a1a1a]/40 mt-2">
                  {sold ? "—" : `$${piece.price?.toLocaleString()}`}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && pieces.length === 0 && (
        <div className="flex flex-col items-center justify-center py-48 text-center px-8">
          <p className="text-[clamp(1.4rem,3vw,2.2rem)] font-light text-[#1a1a1a]/12 mb-6"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            First reproductions arriving soon.
          </p>
          <Link href="/xavierlondon-art/fine-art"
            className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/35 hover:text-[#1a1a1a] transition-colors duration-300">
            Browse originals →
          </Link>
        </div>
      )}

      {/* Print quality note */}
      {!loading && pieces.length > 0 && (
        <section className="bg-[#f0ece4] border-t border-[#1a1a1a]/8 mt-16">
          <div className="max-w-5xl mx-auto px-8 md:px-16 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { label: "Paper",       body: "300 gsm fine art cotton rag. Acid-free and archival."          },
              { label: "Inks",        body: "12-colour Ultrachrome HDX pigment. 200+ year fade resistance." },
              { label: "Editions",    body: "Each print is numbered. Once an edition closes, it is retired." },
              { label: "Signature",   body: "Signed in pencil on the lower right."                          },
            ].map(({ label, body }) => (
              <div key={label}>
                <p className="text-[8px] tracking-[0.5em] uppercase text-[#1a1a1a]/28 mb-3"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  {label}
                </p>
                <p className="text-xs font-light text-[#1a1a1a]/48 leading-[1.85]"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="pb-16" />
    </div>
  );
}
