"use client";

/**
 * app/vault/page.tsx
 *
 * The Vault — IX Life easter egg.
 * URL: xavierlondon.art/vault
 * Not linked from anywhere visible. Found by those who know.
 *
 * Set your password below. Distribute via:
 *  - Newsletter hidden text / acrostic
 *  - 1-frame flash in Archive TV episodes
 *  - Alt text on social posts
 *  - Printed on inside of clothing tags
 *  - In the background of vlog footage (whiteboard, sticky note, etc.)
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ── CHANGE THIS ──────────────────────────────────────────────────────────────
const VAULT_PASSWORD = "NINTHLIFE";
// ─────────────────────────────────────────────────────────────────────────────

type State = "locked" | "wrong" | "shaking" | "unlocking" | "open";

export default function VaultPage() {
  const [input, setInput]       = useState("");
  const [state, setState]       = useState<State>("locked");
  const [attempts, setAttempts] = useState(0);
  const [glitch, setGlitch]     = useState(false);
  const [unlockStep, setUnlockStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check session
  useEffect(() => {
    if (sessionStorage.getItem("vault_unlocked") === "1") setState("open");
  }, []);

  // Random background glitch
  useEffect(() => {
    if (state === "open") return;
    const id = setInterval(() => {
      if (Math.random() > 0.82) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 60 + Math.random() * 100);
      }
    }, 2800);
    return () => clearInterval(id);
  }, [state]);

  // Unlock sequence
  useEffect(() => {
    if (state !== "unlocking") return;
    const steps = [300, 700, 1200, 1900];
    const timeouts = steps.map((t, i) =>
      setTimeout(() => {
        setUnlockStep(i + 1);
        if (i === steps.length - 1) {
          setTimeout(() => {
            sessionStorage.setItem("vault_unlocked", "1");
            setState("open");
          }, 400);
        }
      }, t)
    );
    return () => timeouts.forEach(clearTimeout);
  }, [state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const attempt = input.trim().toUpperCase();

    if (attempt === VAULT_PASSWORD) {
      setUnlockStep(0);
      setState("unlocking");
    } else {
      setAttempts((a) => a + 1);
      setState("shaking");
      setTimeout(() => setState("wrong"), 450);
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 460);
    }
  };

  // ── OPEN ─────────────────────────────────────────────────────────────────
  if (state === "open") return <VaultOpen />;

  // ── UNLOCKING ────────────────────────────────────────────────────────────
  if (state === "unlocking") {
    const lines = ["Verifying...", "Identity confirmed.", "Unlocking...", "Welcome to IX Life."];
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="space-y-3 text-center">
          {lines.slice(0, unlockStep).map((l, i) => (
            <p
              key={i}
              className="text-[10px] tracking-[0.5em] uppercase transition-opacity duration-500"
              style={{
                fontFamily: "'Courier Prime',monospace",
                color: i === unlockStep - 1 ? "rgba(232,228,223,0.6)" : "rgba(232,228,223,0.2)",
              }}
            >
              {l}
            </p>
          ))}
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap');`}</style>
      </div>
    );
  }

  // ── LOCKED ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#080808] flex flex-col items-center justify-center relative overflow-hidden"
      style={{ transform: glitch ? "translateX(1px)" : "none", transition: "transform 0.05s" }}
    >
      {/* Grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.09]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "100px 100px",
        }}
      />

      {/* Glitch color fringe */}
      {glitch && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-50"
          style={{ boxShadow: "inset 2px 0 0 rgba(255,0,60,0.12), inset -2px 0 0 rgba(0,200,255,0.12)" }}
        />
      )}

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col items-center gap-10 px-8 text-center ${state === "shaking" ? "shaking" : ""}`}
      >
        {/* IX mark */}
        <div className="relative select-none">
          <p
            className="text-[clamp(5rem,20vw,10rem)] font-light text-white/[0.04] leading-none"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
          >
            IX
          </p>
          <p
            className="absolute inset-0 flex items-center justify-center text-[8px] tracking-[0.8em] uppercase text-white/15"
            style={{ fontFamily: "'Courier Prime',monospace" }}
          >
            Ninth Life
          </p>
        </div>

        {/* Status */}
        <div>
          <p
            className="text-[8px] tracking-[0.65em] uppercase text-white/18 mb-3"
            style={{ fontFamily: "'Courier Prime',monospace" }}
          >
            {attempts > 0
              ? `Access denied — attempt ${attempts}`
              : "Restricted access"}
          </p>
          <h1
            className="text-[clamp(1rem,3.5vw,1.6rem)] font-light tracking-[0.2em] uppercase text-white/45"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
          >
            The Vault
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-[260px]">
          <input
            ref={inputRef}
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (state === "wrong") setState("locked");
            }}
            placeholder="— — — — — — — —"
            autoComplete="off"
            autoFocus
            className="w-full bg-transparent border-b py-3 text-center text-sm tracking-[0.5em] uppercase text-white/70 placeholder:text-white/12 focus:outline-none transition-colors duration-300"
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              borderColor: state === "wrong" ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.12)",
              color: state === "wrong" ? "rgba(239,68,68,0.5)" : undefined,
            }}
          />
          {state === "wrong" && (
            <p className="text-[8.5px] tracking-[0.4em] uppercase text-red-500/50" style={{ fontFamily: "'Courier Prime',monospace" }}>
              Incorrect
            </p>
          )}
          <button
            type="submit"
            className="mt-1 border border-white/12 px-10 py-3 text-[9px] tracking-[0.5em] uppercase text-white/35 hover:text-white/70 hover:border-white/35 transition-all duration-300"
            style={{ fontFamily: "'Courier Prime',monospace" }}
          >
            Enter
          </button>
        </form>

        {/* Back links */}
        <div className="flex items-center gap-5 mt-2">
          <Link
            href="/xavierlondon-art"
            className="text-[8px] tracking-[0.4em] uppercase text-white/12 hover:text-white/30 transition-colors duration-300"
            style={{ fontFamily: "'Cormorant Garamond',serif" }}
          >
            Xavier London
          </Link>
          <span className="text-white/8 text-[8px]">·</span>
          <Link
            href="/blackcatarchive"
            className="text-[8px] tracking-[0.4em] uppercase text-white/12 hover:text-white/30 transition-colors duration-300"
            style={{ fontFamily: "'Courier Prime',monospace" }}
          >
            Black Cat Archive
          </Link>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Courier+Prime&display=swap');
        .shaking { animation: shake 0.45s ease-in-out; }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

// ── Open / IX Life content ────────────────────────────────────────────────────

function VaultOpen() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#e8e4df]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "120px 120px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-8 pt-24 pb-32">
        <header className="text-center mb-28">
          <p
            className="text-[8px] tracking-[0.8em] uppercase text-white/18 mb-6"
            style={{ fontFamily: "'Courier Prime',monospace" }}
          >
            You found it.
          </p>
          <h1
            className="text-[clamp(4rem,15vw,8rem)] font-light leading-none text-white/75 mb-6"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
          >
            IX Life
          </h1>
          <p
            className="text-sm font-light text-white/28 max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond',serif" }}
          >
            Ninth Life. The space between Xavier London and Black Cat Archive.
            Collaborative works available to those who know where to look.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <div className="h-px w-16 bg-white/6" />
            <span className="text-[8px] tracking-[0.6em] text-white/12">✦</span>
            <div className="h-px w-16 bg-white/6" />
          </div>
        </header>

        {/* 
          ── ADD IX LIFE DROPS HERE ──
          Fetch from Sanity where brand == "ixlife"
          and render drop cards with DropCountdown component
        */}
        <div className="text-center py-20">
          <p
            className="text-[10px] tracking-[0.5em] uppercase text-white/15"
            style={{ fontFamily: "'Courier Prime',monospace" }}
          >
            First drop — coming soon
          </p>
        </div>

        <div className="flex items-center justify-center gap-8 mt-16 pt-8 border-t border-white/6">
          <Link
            href="/xavierlondon-art"
            className="text-[9px] tracking-[0.4em] uppercase text-white/18 hover:text-white/45 transition-colors duration-300"
            style={{ fontFamily: "'Cormorant Garamond',serif" }}
          >
            Xavier London Art
          </Link>
          <span className="text-white/8">·</span>
          <Link
            href="/blackcatarchive"
            className="text-[9px] tracking-[0.4em] uppercase text-white/18 hover:text-white/45 transition-colors duration-300"
            style={{ fontFamily: "'Courier Prime',monospace" }}
          >
            Black Cat Archive
          </Link>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Courier+Prime&display=swap');
      `}</style>
    </div>
  );
}