"use client";

// components/blackcat/CartNavCount.tsx
// Client component so the navbar can read live cart state.
// Renders as a link with the live item count.

import Link from "next/link";
import { useCart } from "@/components/blackcat/CartContent";

export function CartNavCount() {
  const { count } = useCart();
  return (
    <Link
      href="/blackcatarchive/cart"
      className="text-[10px] tracking-[0.3em] uppercase text-white/35 hover:text-white transition-colors duration-200"
    >
      Cart [{count}]
    </Link>
  );
}