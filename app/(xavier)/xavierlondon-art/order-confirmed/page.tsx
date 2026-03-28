"use client";

// app/(xavier)/xavierlondon-art/order-confirmed/page.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useXavierCart } from "@/components/xavier/XavierCartContent";
import { Suspense } from "react";

function OrderConfirmedContent() {
  const searchParams            = useSearchParams();
  const sessionId               = searchParams.get("session_id");
  const { clearCart }           = useXavierCart();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Clear cart once we land on confirmation
    clearCart();
    setTimeout(() => setRevealed(true), 80);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a] flex flex-col items-center justify-center px-8 text-center"
      style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.8s ease" }}
    >
      {/* Mark */}
      <div className="w-16 h-16 border border-[#1a1a1a]/20 flex items-center justify-center mb-10">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <polyline points="20 6 9 17 4 12" stroke="rgba(26,26,26,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <p className="text-[9px] tracking-[0.6em] uppercase text-[#1a1a1a]/30 mb-6"
        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
        Xavier London Art
      </p>

      <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-light text-[#1a1a1a] leading-tight mb-6"
        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
        Order Confirmed
      </h1>

      <p className="text-base font-light text-[#1a1a1a]/50 leading-relaxed max-w-md mb-4"
        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
        Your order has been received. A confirmation will be sent to your email shortly.
      </p>

      <p className="text-sm font-light text-[#1a1a1a]/35 mb-14 leading-relaxed max-w-sm"
        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
        Each piece is handled with care and shipped within 5–7 business days.
      </p>

      {sessionId && (
        <p className="text-[8px] tracking-[0.3em] uppercase text-[#1a1a1a]/20 mb-10"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Order ref: {sessionId.slice(-12).toUpperCase()}
        </p>
      )}

      <div className="h-px w-16 bg-[#1a1a1a]/12 mb-10" />

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Link href="/xavierlondon-art/shop"
          className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/50 border border-[#1a1a1a]/18 px-8 py-3.5 hover:bg-[#1a1a1a] hover:text-[#f7f4ef] hover:border-[#1a1a1a] transition-all duration-300"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Continue browsing
        </Link>
        <Link href="/xavierlondon-art"
          className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors duration-300"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          ← Home
        </Link>
      </div>
    </div>
  );
}

export default function XavierOrderConfirmedPage() {
  return (
    <Suspense>
      <OrderConfirmedContent />
    </Suspense>
  );
}
