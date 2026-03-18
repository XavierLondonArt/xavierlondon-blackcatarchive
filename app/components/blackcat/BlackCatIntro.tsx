"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Stage = "idle" | "loading" | "enter" | "playing" | "done";

interface Props {
  children: React.ReactNode;
  introVideoSrc?: string;
}

const SESSION_KEY = "bca_intro_seen";
const LOAD_DURATION_MS = 3200; // how long 0→100% takes

export function BlackCatIntro({ children, introVideoSrc = "/blackcat-intro.mp4" }: Props) {
  const [stage, setStage]       = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut]   = useState(false);
  const videoRef                = useRef<HTMLVideoElement>(null);

  // ── Check session on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setStage("done");
    } else {
      setStage("loading");
    }
  }, []);

  // ── Loading bar 0 → 100 ─────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== "loading") return;

    const startTime = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTime;
      // Ease-out curve so it slows near 100
      const raw = elapsed / LOAD_DURATION_MS;
      const eased = 1 - Math.pow(1 - Math.min(raw, 1), 2.5);
      const pct = Math.floor(eased * 100);

      setProgress(pct);

      if (pct >= 100) {
        // Brief hold at 100 then move to enter
        setTimeout(() => setStage("enter"), 600);
        return;
      }
      requestAnimationFrame(tick);
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  // ── Play video once the element is in the DOM ───────────────────────────
  // This is the critical fix: we watch for stage === "playing" and then
  // play via useEffect, by which time the <video> ref is populated.
  useEffect(() => {
    if (stage !== "playing") return;

    const vid = videoRef.current;
    if (!vid) {
      // Element not ready yet — retry on next tick
      const id = setTimeout(() => {
        videoRef.current?.play().catch(finish);
      }, 50);
      return () => clearTimeout(id);
    }
    vid.play().catch(finish);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const finish = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setStage("done");
    }, 700);
  }, []);

  const handleEnter = useCallback(() => {
    setStage("playing");
  }, []);

  const handleSkip = useCallback(() => {
    finish();
  }, [finish]);

  // ── Done ─────────────────────────────────────────────────────────────────
  if (stage === "done") return <>{children}</>;
  if (stage === "idle") return null;

  return (
    <>
      {/* Site underneath — revealed during dissolve */}
      <div
        style={{
          opacity: fadeOut ? 1 : 0,
          transition: "opacity 0.7s ease-in",
          pointerEvents: fadeOut ? "auto" : "none",
        }}
      >
        {children}
      </div>

      {/* ── Overlay ── */}
      <div
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
        style={{
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.7s ease-in",
          pointerEvents: fadeOut ? "none" : "auto",
        }}
      >
        {/* Grain */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.11]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "120px 120px",
          }}
        />
        {/* Scan lines */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.05) 2px,rgba(255,255,255,0.05) 4px)",
          }}
        />

        {/* ── LOADING STAGE ── */}
        {stage === "loading" && (
          <div className="flex flex-col items-center gap-10 w-full max-w-xs px-8">
            {/* Big digital percentage */}
            <div className="relative">
              <span
                className="text-[clamp(4rem,18vw,7rem)] text-white leading-none tabular-nums select-none"
                style={{ fontFamily: "'Courier Prime', 'Courier New', monospace", letterSpacing: "-0.02em" }}
              >
                {String(progress).padStart(3, "\u2007")}
                <span className="text-[0.45em] text-white/40 ml-1">%</span>
              </span>
              {/* Glitch line — flickers randomly via CSS */}
              <div
                className="absolute left-0 right-0 h-px bg-white/15 pointer-events-none"
                style={{ top: "45%", animation: "glitch-line 3s steps(1) infinite" }}
              />
            </div>

            {/* Label */}
            <p
              className="text-[8px] tracking-[0.7em] uppercase text-white/25 -mt-4"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            >
              Initialising archive
            </p>

            {/* Progress bar */}
            <div className="w-full h-px bg-white/10 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-white/70 transition-none"
                style={{ width: `${progress}%` }}
              />
              {/* Travelling shimmer */}
              <div
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{
                  left: `${progress - 8}%`,
                  opacity: progress > 2 && progress < 100 ? 1 : 0,
                }}
              />
            </div>

            {/* Scrolling log lines */}
            <div
              className="w-full text-left space-y-1 opacity-20"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            >
              {progress > 10  && <p className="text-[8px] text-white/60 tracking-wider">→ loading asset manifest...</p>}
              {progress > 30  && <p className="text-[8px] text-white/60 tracking-wider">→ fetching archive records...</p>}
              {progress > 55  && <p className="text-[8px] text-white/60 tracking-wider">→ compiling drop index...</p>}
              {progress > 75  && <p className="text-[8px] text-white/60 tracking-wider">→ syncing archive tv...</p>}
              {progress >= 100 && <p className="text-[8px] text-white tracking-wider opacity-60">✓ ready.</p>}
            </div>
          </div>
        )}

        {/* ── ENTER STAGE ── */}
        {stage === "enter" && (
          <div className="flex flex-col items-center gap-12 text-center px-8">
            <div>
              <p
                className="text-[8px] tracking-[0.75em] uppercase text-white/25 mb-5"
                style={{ fontFamily: "'Courier Prime', monospace" }}
              >
                You have reached
              </p>
              <h1
                className="text-[clamp(3rem,12vw,7rem)] text-white leading-none"
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}
              >
                The Black Cat
                <br />
                Archive
              </h1>
            </div>

            <button
              onClick={handleEnter}
              className="group relative border border-white/25 px-14 py-4 text-[10px] tracking-[0.55em] uppercase text-white/55 overflow-hidden transition-colors duration-300"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            >
              <span className="relative z-10 group-hover:text-black transition-colors duration-250">
                Enter Archive
              </span>
              <span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </button>
          </div>
        )}

        {/* ── PLAYING STAGE ── */}
        {stage === "playing" && (
          <video
            ref={videoRef}
            src={introVideoSrc}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            onEnded={finish}
          />
        )}

        {/* Skip — always visible */}
        {!fadeOut && (
          <button
            onClick={handleSkip}
            className="absolute bottom-7 right-7 text-[8.5px] tracking-[0.4em] uppercase text-white/18 hover:text-white/50 transition-colors duration-300 z-10"
            style={{ fontFamily: "'Courier Prime', monospace" }}
          >
            Skip →
          </button>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Courier+Prime&display=swap');
        @keyframes glitch-line {
          0%,90%,100% { opacity: 0; top: 45%; }
          91%          { opacity: 1; top: 42%; }
          93%          { opacity: 0; top: 48%; }
          95%          { opacity: 1; top: 45%; }
          97%          { opacity: 0; }
        }
      `}</style>
    </>
  );
}