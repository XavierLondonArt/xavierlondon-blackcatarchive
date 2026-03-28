"use client";
// components/blackcat/BlackCatVaultTrigger.tsx
//
// Appears as a "▓" block character in the Black Cat navbar.
// Looks exactly like a rendering glitch or corrupted data.
// A slow pulse animation makes it look like a broken pixel, not a link.
// On click: navigates to /vault

import Link from "next/link";

export function BlackCatVaultTrigger() {
  return (
    <Link
      href="/vault"
      aria-label=" "
      title=""
      className="group flex items-center"
    >
      <span
        aria-hidden="true"
        className="text-[10px] text-white/[0.07] group-hover:text-white/[0.18] transition-colors duration-700 select-none"
        style={{
          fontFamily: "'Courier Prime',monospace",
          animation: "glitch-pulse 5s ease-in-out infinite",
        }}
      >
        ▓
      </span>
      <style>{`
        @keyframes glitch-pulse {
          0%,100% { opacity: 1; }
          45%      { opacity: 0.6; }
          46%      { opacity: 1; }
          70%      { opacity: 0.4; transform: translateX(1px); }
          71%      { opacity: 1;   transform: translateX(0); }
        }
      `}</style>
    </Link>
  );
}