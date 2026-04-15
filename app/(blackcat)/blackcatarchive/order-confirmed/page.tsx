"use client";

// app/(blackcat)/blackcatarchive/order-confirmed/page.tsx

import { useEffect, useState } from "react";
import { useSearchParams }     from "next/navigation";
import Link                    from "next/link";
import { useCart }             from "@/components/blackcat/CartContent";
import { Suspense }            from "react";

function OrderConfirmedContent() {
  const searchParams        = useSearchParams();
  const sessionId           = searchParams.get("session_id");
  const { clearCart }       = useCart();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    clearCart();
    setTimeout(() => setRevealed(true), 80);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4df] flex items-center justify-center px-8"
      style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.6s ease" }}>
      <div className="text-center max-w-sm">
        <p className="text-[clamp(3rem,10vw,6rem)] text-white/5 leading-none select-none mb-8"
          style={{ fontFamily:"'Bebas Neue',sans-serif" }}>
          ORDER
        </p>
        <p className="text-[8px] tracking-[0.7em] uppercase text-white/25 mb-4"
          style={{ fontFamily:"'Courier Prime',monospace" }}>
          Confirmed
        </p>
        <h1 className="text-2xl text-white mb-6"
          style={{ fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.03em" }}>
          You&apos;re in the archive.
        </h1>
        <p className="text-xs text-white/35 leading-relaxed mb-6"
          style={{ fontFamily:"'Courier Prime',monospace" }}>
          Order confirmed. A receipt has been sent to your email.
          Ships within 5–10 business days (US only).
          Check your spam folder if you don&apos;t see it.
        </p>

        {sessionId && (
          <p className="text-[7px] tracking-[0.5em] uppercase text-white/12 mb-10"
            style={{ fontFamily:"'Courier Prime',monospace" }}>
            File #{sessionId.slice(-10).toUpperCase()}
          </p>
        )}

        <Link href="/blackcatarchive/shop"
          className="text-[9px] tracking-[0.4em] uppercase text-white/30 hover:text-white transition-colors duration-200"
          style={{ fontFamily:"'Courier Prime',monospace" }}>
          ← Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense>
      <OrderConfirmedContent />
    </Suspense>
  );
}