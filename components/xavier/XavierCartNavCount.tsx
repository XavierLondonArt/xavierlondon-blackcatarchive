"use client";

// components/xavier/XavierCartNavCount.tsx
import Link from "next/link";
import { useXavierCart } from "./XavierCartContent";

export function XavierCartNavCount() {
  const { count } = useXavierCart();
  return (
    <li>
      <Link
        href="/xavierlondon-art/cart"
        className="text-[9.5px] tracking-[0.4em] uppercase text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors duration-300"
      >
        Bag {count > 0 ? `(${count})` : "(0)"}
      </Link>
    </li>
  );
}
