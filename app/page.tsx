"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type HoverState = "none" | "blackcat" | "xavier";

export default function Home() {
  const [hovered, setHovered] = useState<HoverState>("none");
  const router = useRouter();
  const xavierVideoRef = useRef<HTMLVideoElement>(null);
  const blackcatVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const xv = xavierVideoRef.current;
    const bv = blackcatVideoRef.current;
    if (!xv || !bv) return;

    if (hovered === "xavier") {
      xv.currentTime = 0;
      xv.play().catch(() => {});
      bv.pause();
    } else if (hovered === "blackcat") {
      bv.currentTime = 0;
      bv.play().catch(() => {});
      xv.pause();
    } else {
      xv.pause();
      bv.pause();
    }
  }, [hovered]);

  useEffect(() => {
    router.prefetch("/xavierlondon-art");
    router.prefetch("/blackcatarchive");
  }, [router]);

  const go = useCallback((e: React.MouseEvent, path: string) => {
    e.preventDefault();
    router.push(path);
  }, [router]);

  const bg =
    hovered === "blackcat" ? "bg-black"
    : hovered === "xavier"  ? "bg-[#f5f2ed]"
    : "bg-[#2a2a2a]";

  const text   = hovered === "xavier" ? "text-[#1a1a1a]" : "text-[#e8e4df]";
  const divider = hovered === "xavier" ? "bg-[#1a1a1a]/20" : "bg-[#e8e4df]/20";

  const xSize  = hovered === "xavier"   ? "text-[clamp(1.1rem,3vw,1.6rem)] opacity-100" : "text-[clamp(0.85rem,2.2vw,1.1rem)] opacity-60";
  const xDim   = hovered === "blackcat" ? "!opacity-20" : "";
  const xLine  = hovered === "xavier"   ? "scale-x-100 opacity-40" : "scale-x-0 opacity-0";
  const xColor = hovered === "xavier"   ? "bg-[#1a1a1a]" : "bg-[#e8e4df]";

  const bcSize = hovered === "blackcat" ? "text-[clamp(1.1rem,3vw,1.6rem)] opacity-100" : "text-[clamp(0.85rem,2.2vw,1.1rem)] opacity-60";
  const bcDim  = hovered === "xavier"   ? "!opacity-20" : "";
  const bcLine = hovered === "blackcat" ? "scale-x-100 opacity-40" : "scale-x-0 opacity-0";

  return (
    <main
      className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-700 ease-in-out relative overflow-hidden ${bg}`}
    >
      {/* Grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Xavier video */}
      <video
        ref={xavierVideoRef}
        aria-hidden="true"
        muted playsInline preload="auto" loop
        className="fixed inset-0 w-full h-full object-cover z-[1] pointer-events-none transition-opacity duration-700"
        style={{ opacity: hovered === "xavier" ? 0.55 : 0 }}
      >
        <source src="/xavier-transition.webm" type="video/webm" />
        <source src="/xavier-transition.mp4"  type="video/mp4" />
      </video>

      {/* Black Cat video */}
      <video
        ref={blackcatVideoRef}
        aria-hidden="true"
        muted playsInline preload="auto" loop
        className="fixed inset-0 w-full h-full object-cover z-[1] pointer-events-none transition-opacity duration-700"
        style={{ opacity: hovered === "blackcat" ? 0.55 : 0 }}
      >
        <source src="/blackcat-transition.webm" type="video/webm" />
        <source src="/blackcat-transition.mp4"  type="video/mp4" />
      </video>

      <nav className="relative z-10 flex flex-col items-center gap-0 select-none">

        {/* Xavier London Art */}
        <a
          href="/xavierlondon-art"
          className={`group relative block px-16 py-10 cursor-pointer transition-all duration-500 ease-out ${text}`}
          onMouseEnter={() => setHovered("xavier")}
          onMouseLeave={() => setHovered("none")}
          onClick={(e) => go(e, "/xavierlondon-art")}
        >
          <span
            className={`block font-light uppercase transition-all duration-500 ease-out ${xSize} ${xDim}`}
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif", letterSpacing: "0.3em" }}
          >
            Xavier London Art
          </span>
          <span
            aria-hidden="true"
            className={`absolute bottom-7 left-16 right-16 h-px transition-all duration-500 ease-out origin-left ${xLine} ${xColor}`}
          />
        </a>

        {/* Divider */}
        <div aria-hidden="true" className={`h-px w-12 transition-colors duration-700 ${divider}`} />

        {/* Black Cat Archive */}
        <a
          href="/blackcatarchive"
          className={`group relative block px-16 py-10 cursor-pointer transition-all duration-500 ease-out ${text}`}
          onMouseEnter={() => setHovered("blackcat")}
          onMouseLeave={() => setHovered("none")}
          onClick={(e) => go(e, "/blackcatarchive")}
        >
          <span
            className={`block font-light uppercase transition-all duration-500 ease-out ${bcSize} ${bcDim}`}
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif", letterSpacing: "0.3em" }}
          >
          The Black Cat Archive
          </span>
          <span
            aria-hidden="true"
            className={`absolute bottom-7 left-16 right-16 h-px transition-all duration-500 ease-out origin-left ${bcLine} bg-[#e8e4df]`}
          />
        </a>

      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&display=swap');
      `}</style>
    </main>
  );
}