"use client";
// components/xavier/XavierVaultTrigger.tsx
//
// Appears as a near-invisible dot in the Xavier navbar.
// Looks like a printing artifact. On hover it barely brightens.
// On click: navigates to /vault

import Link from "next/link";

export function XavierVaultTrigger() {
  return (
    <Link
      href="/vault"
      aria-label=" "
      title=""
      className="group relative w-5 h-5 flex items-center justify-center"
    >
      {/* The dot — looks like a stray ink mark */}
      <span
        aria-hidden="true"
        className="block w-[3px] h-[3px] rounded-full bg-[#1a1a1a]/12 group-hover:bg-[#1a1a1a]/30 transition-colors duration-700"
      />
      {/* Faint IX that appears on hover — only if you're looking */}
      <span
        aria-hidden="true"
        className="absolute -top-4 left-1/2 -translate-x-1/2 text-[6px] text-[#1a1a1a]/0 group-hover:text-[#1a1a1a]/18 transition-all duration-700 select-none pointer-events-none whitespace-nowrap"
        style={{ fontFamily: "'Cormorant Garamond',serif" }}
      >
        IX
      </span>
    </Link>
  );
}