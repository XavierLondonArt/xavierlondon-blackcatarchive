"use client";

// components/blackcat/ArchiveCard.tsx
//
// Fully Sanity-driven archive product card.
// - Default state: file label + title + tagline
// - Hover: cycles through product images (front → back) every 1.2s
//          lore text fades in over the image
// - Inventory 0: "SEALED" overlay replaces everything
// - All data comes from Sanity — no hardcoding needed

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface ArchiveCardProps {
  fileNumber: string;       // "00"
  title: string;            // "THE GUARDIAN"
  tagline: string;          // "Doberman. Diamond teeth. Red fog."
  unitRange: string;        // "00–49"
  hoverLore: string;        // lore text shown on hover
  href: string;             // link to product page
  images: SanityImage[];    // from Sanity — product.images array
  inventory: number;        // from Sanity — product.inventory
  price: number;
  status: "live" | "upcoming" | "sold";
  projectId: string;        // NEXT_PUBLIC_SANITY_PROJECT_ID
}

interface SanityImage {
  asset: { _ref: string };
}

function sanityImgUrl(ref: string, projectId: string, width = 800) {
  return `https://cdn.sanity.io/images/${projectId}/production/${
    ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
  }?w=${width}&auto=format`;
}

export function ArchiveCard({
  fileNumber,
  title,
  tagline,
  unitRange,
  hoverLore,
  href,
  images,
  inventory,
  price,
  status,
  projectId,
}: ArchiveCardProps) {
  const [hovered, setHovered]     = useState(false);
  const [imgIndex, setImgIndex]   = useState(0);
  const [imgFade, setImgFade]     = useState(true);
  const cycleRef                  = useRef<ReturnType<typeof setInterval> | null>(null);
  const sealed                    = inventory === 0;
  const hasImages                 = images?.length > 0;

  // Cycle images while hovered
  useEffect(() => {
    if (!hovered || images.length <= 1) {
      if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
      if (!hovered) { setImgIndex(0); setImgFade(true); }
      return;
    }

    // Start cycling immediately on hover
    cycleRef.current = setInterval(() => {
      setImgFade(false);
      setTimeout(() => {
        setImgIndex(prev => (prev + 1) % images.length);
        setImgFade(true);
      }, 220);
    }, 1600);

    return () => {
      if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
    };
  }, [hovered, images.length]);

  const currentImg = hasImages && images[imgIndex]?.asset
    ? sanityImgUrl(images[imgIndex].asset._ref, projectId)
    : null;

  return (
    <Link
      href={sealed ? "#" : href}
      onClick={e => sealed && e.preventDefault()}
      className="group relative flex flex-col overflow-hidden"
      style={{
        background:  "#272727",
        border:      hovered && !sealed
          ? "1px solid rgba(232,228,223,0.2)"
          : "1px solid rgba(232,228,223,0.07)",
        transition:  "border-color 0.4s ease",
        aspectRatio: "3 / 4",
        cursor:      sealed ? "default" : "pointer",
      }}
      onMouseEnter={() => !sealed && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* ── Background image — always present, opacity changes on hover ── */}
      {currentImg && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:    `url(${currentImg})`,
            backgroundSize:     "cover",
            backgroundPosition: "center top",
            opacity:            hovered && !sealed ? imgFade ? 0.28 : 0 : 0.06,
            transition:         imgFade
              ? "opacity 0.4s ease"
              : "opacity 0.2s ease",
          }}
        />
      )}

      {/* Red fog */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: hovered && !sealed
            ? "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(160,12,12,0.2) 0%, transparent 65%)"
            : "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(100,8,8,0.07) 0%, transparent 70%)",
          transition: "background 0.6s ease",
        }}
      />

      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.055]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize:   "120px 120px",
        }}
      />

      {/* Image cycle indicator dots — shows when hovered + multiple images */}
      {hovered && !sealed && images.length > 1 && (
        <div className="absolute top-3 right-3 z-20 flex gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className="block rounded-full transition-all duration-300"
              style={{
                width:      i === imgIndex ? "12px" : "4px",
                height:     "4px",
                background: i === imgIndex
                  ? "rgba(232,228,223,0.6)"
                  : "rgba(232,228,223,0.15)",
              }}
            />
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          SEALED OVERLAY — inventory = 0
      ════════════════════════════════════════════════════════ */}
      {sealed && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center"
          style={{
            background: "rgba(8,8,8,0.82)",
            backdropFilter: "blur(2px)",
          }}
        >
          {/* Red wax seal ring */}
          <div
            className="relative flex items-center justify-center mb-4"
            style={{
              width: "80px", height: "80px",
              border: "1px solid rgba(180,15,15,0.35)",
              borderRadius: "50%",
            }}
          >
            <div
              className="absolute inset-2 flex items-center justify-center"
              style={{
                border: "1px solid rgba(180,15,15,0.2)",
                borderRadius: "50%",
              }}
            >
              {/* X mark */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <line x1="6" y1="6" x2="18" y2="18" stroke="rgba(180,15,15,0.6)" strokeWidth="1" strokeLinecap="round"/>
                <line x1="18" y1="6" x2="6" y2="18" stroke="rgba(180,15,15,0.6)" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <p
            className="text-[11px] tracking-[0.7em] uppercase text-white/40 mb-1"
            style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.3em" }}
          >
            Archive
          </p>
          <p
            className="text-[clamp(1.4rem,3vw,1.8rem)] text-white/55 leading-none"
            style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.15em" }}
          >
            Sealed
          </p>
          <p
            className="text-[7px] tracking-[0.5em] uppercase text-white/18 mt-3"
            style={{ fontFamily: "'Courier Prime',monospace" }}
          >
            [{unitRange}] — closed
          </p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          CARD CONTENT
      ════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col flex-1 p-6">

        {/* ── DEFAULT STATE ── */}
        <div
          style={{
            opacity:        hovered ? 0 : 1,
            transform:      hovered ? "translateY(-5px)" : "translateY(0)",
            transition:     "opacity 0.28s ease, transform 0.28s ease",
            position:       hovered ? "absolute" : "relative",
            pointerEvents:  hovered ? "none" : "auto",
            inset:          hovered ? "24px" : "auto",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <span
              className="text-[7px] tracking-[0.7em] uppercase text-white/18"
              style={{ fontFamily: "'Courier Prime',monospace" }}
            >
              File
            </span>
            <span
              className="text-[7px] tracking-[0.5em] text-white/35"
              style={{ fontFamily: "'Courier Prime',monospace" }}
            >
              {fileNumber}
            </span>
          </div>

          <h3
            className="text-[clamp(1.8rem,4vw,2.4rem)] text-white leading-none mb-4"
            style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.04em" }}
          >
            {title}
          </h3>

          <p
            className="text-[11px] text-white/38 leading-relaxed"
            style={{ fontFamily: "'Courier Prime',monospace" }}
          >
            {tagline}
          </p>

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/7">
            <div className="flex flex-col gap-0.5">
              <span
                className="text-[8px] tracking-[0.4em] uppercase text-white/18"
                style={{ fontFamily: "'Courier Prime',monospace" }}
              >
                [{unitRange}]
              </span>
              <span
                className="text-[6px] tracking-[0.3em] uppercase text-white/10"
                style={{ fontFamily: "'Courier Prime',monospace" }}
              >
                00 held in archive
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!sealed && (
                <span
                  className="text-[8px] text-white/30"
                  style={{ fontFamily: "'Courier Prime',monospace" }}
                >
                  ${price}
                </span>
              )}
              <span
                className="text-[7px] tracking-[0.35em] uppercase px-2 py-0.5 border"
                style={{
                  fontFamily:  "'Courier Prime',monospace",
                  borderColor: status === "live"     ? "rgba(255,255,255,0.18)"
                             : status === "upcoming" ? "rgba(255,255,255,0.1)"
                             :                         "rgba(180,15,15,0.25)",
                  color:       status === "live"     ? "rgba(255,255,255,0.45)"
                             : status === "upcoming" ? "rgba(255,255,255,0.28)"
                             :                         "rgba(180,15,15,0.5)",
                }}
              >
                {status === "live" ? "Live" : status === "upcoming" ? "Upcoming" : "Sealed"}
              </span>
            </div>
          </div>
        </div>

        {/* ── HOVER STATE — lore over cycling image ── */}
        <div
          className="flex flex-col flex-1 justify-between"
          style={{
            opacity:       hovered ? 1 : 0,
            transform:     hovered ? "translateY(0)" : "translateY(8px)",
            transition:    "opacity 0.32s ease 0.06s, transform 0.32s ease 0.06s",
            position:      hovered ? "relative" : "absolute",
            inset:         hovered ? "auto" : "24px",
            pointerEvents: hovered ? "auto" : "none",
          }}
        >
          <span
            className="text-[7px] tracking-[0.7em] uppercase text-white/15 mb-5 block"
            style={{ fontFamily: "'Courier Prime',monospace" }}
          >
            File {fileNumber}
          </span>

          <p
            className="text-[11.5px] text-white/55 leading-[1.9] flex-1"
            style={{
              fontFamily: "'Courier Prime',monospace",
              whiteSpace: "pre-line",
            }}
          >
            {hoverLore}
          </p>

          {/* Image label — shows which view is active */}
          {images.length > 1 && (
            <p
              className="text-[7px] tracking-[0.5em] uppercase text-white/18 mt-4 mb-2"
              style={{ fontFamily: "'Courier Prime',monospace" }}
            >
              {imgIndex === 0 ? "Front" : imgIndex === 1 ? "Back" : `View ${imgIndex + 1}`}
            </p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <div className="h-px w-8 bg-white/15" />
            <span
              className="text-[9px] tracking-[0.5em] uppercase text-white/45 group-hover:text-white/75 transition-colors duration-300"
              style={{ fontFamily: "'Courier Prime',monospace" }}
            >
              Enter Archive →
            </span>
          </div>
        </div>

      </div>
    </Link>
  );
}