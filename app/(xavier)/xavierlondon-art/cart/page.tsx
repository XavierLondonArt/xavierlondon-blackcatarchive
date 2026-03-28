"use client";

// app/(xavier)/xavierlondon-art/cart/page.tsx

import { useState } from "react";
import Link from "next/link";
import { useXavierCart } from "@/components/xavier/XavierCartContent";

export default function XavierCartPage() {
  const { items, count, subtotal, removeItem, updateQty, clearCart } = useXavierCart();
  const [checking, setChecking] = useState(false);
  const [error, setError]       = useState("");

  const SHIPPING_STANDARD = 6.99;
  const SHIPPING_PRIORITY = 14.99;
  const [shippingOption, setShippingOption] = useState<"standard" | "priority">("standard");
  const shippingCost = shippingOption === "standard" ? SHIPPING_STANDARD : SHIPPING_PRIORITY;
  const total = subtotal + shippingCost;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setError(""); setChecking(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: "xavier",
          cartItems: items.map(i => ({
            stripePriceId: i.stripePriceId,
            quantity:      i.quantity,
            size:          i.size,
            productTitle:  i.title,
          })),
          shippingOption,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Checkout failed — please try again.");
    } catch { setError("Something went wrong. Please try again."); }
    finally   { setChecking(false); }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a]">

      {/* Header */}
      <div className="max-w-5xl mx-auto px-8 md:px-16 pt-16 pb-10 border-b border-[#1a1a1a]/8">
        <p className="text-[9px] tracking-[0.6em] uppercase text-[#1a1a1a]/30 mb-3"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Xavier London Art
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-light text-[#1a1a1a] leading-none"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            Your Bag
            {count > 0 && (
              <span className="text-base text-[#1a1a1a]/30 ml-4"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                ({count})
              </span>
            )}
          </h1>
          {items.length > 0 && (
            <button onClick={clearCart}
              className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/22 hover:text-[#1a1a1a]/50 transition-colors duration-200 mb-1"
              style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="max-w-5xl mx-auto px-8 md:px-16 py-40 text-center">
          <p className="text-[clamp(1.5rem,3vw,2rem)] font-light text-[#1a1a1a]/20 mb-8"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            Your bag is empty.
          </p>
          <Link href="/xavierlondon-art/shop"
            className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/40 border border-[#1a1a1a]/15 px-8 py-3.5 hover:bg-[#1a1a1a] hover:text-[#f7f4ef] hover:border-[#1a1a1a] transition-all duration-300"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            Browse collections
          </Link>
        </div>
      )}

      {/* Cart items + summary */}
      {items.length > 0 && (
        <div className="max-w-5xl mx-auto px-8 md:px-16 py-14 grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Line items */}
          <div className="lg:col-span-2 space-y-0">
            {items.map(item => (
              <div key={item.id}
                className="flex gap-6 py-7 border-b border-[#1a1a1a]/8">
                {/* Thumbnail */}
                <div className="w-20 aspect-[3/4] bg-[#ede9e2] flex-shrink-0 overflow-hidden">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-light text-[#1a1a1a] leading-snug mb-1"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    {item.title}
                  </h3>
                  {item.size !== "N/A" && (
                    <p className="text-[9px] tracking-[0.3em] uppercase text-[#1a1a1a]/35 mb-3">
                      Size: {item.size}
                    </p>
                  )}
                  <p className="text-sm font-light text-[#1a1a1a]/50 mb-4">
                    ${item.price.toFixed(2)}
                  </p>

                  <div className="flex items-center justify-between gap-4">
                    {/* Qty */}
                    <div className="flex items-center border border-[#1a1a1a]/15">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors duration-200 text-sm">
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-light text-[#1a1a1a]/70">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.inventory}
                        className="w-8 h-8 flex items-center justify-center text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors duration-200 text-sm disabled:opacity-20">
                        +
                      </button>
                    </div>

                    <button onClick={() => removeItem(item.id)}
                      className="text-[8px] tracking-[0.35em] uppercase text-[#1a1a1a]/22 hover:text-[#1a1a1a]/50 transition-colors duration-200">
                      Remove
                    </button>
                  </div>
                </div>

                {/* Line total */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-light text-[#1a1a1a]/60">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div>
            <div className="border border-[#1a1a1a]/10 p-7">
              <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/35 mb-7"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                Order Summary
              </p>

              {/* Shipping selector */}
              <div className="mb-7">
                <p className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 mb-3"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  Shipping
                </p>
                <div className="space-y-2">
                  {[
                    { value: "standard", label: "Standard (USPS)", sub: "5–10 business days", cost: SHIPPING_STANDARD },
                    { value: "priority", label: "Priority (USPS)",  sub: "2–4 business days",  cost: SHIPPING_PRIORITY },
                  ].map(opt => (
                    <label key={opt.value}
                      className="flex items-start gap-3 cursor-pointer group">
                      <div className="mt-0.5 w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors duration-200"
                        style={{
                          borderColor:     shippingOption === opt.value ? "rgba(26,26,26,0.6)" : "rgba(26,26,26,0.2)",
                          backgroundColor: shippingOption === opt.value ? "rgba(26,26,26,0.6)" : "transparent",
                        }}
                        onClick={() => setShippingOption(opt.value as "standard" | "priority")}>
                        {shippingOption === opt.value && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#f7f4ef]" />
                        )}
                      </div>
                      <div className="flex-1 flex justify-between gap-2"
                        onClick={() => setShippingOption(opt.value as "standard" | "priority")}>
                        <div>
                          <p className="text-xs font-light text-[#1a1a1a]/65"
                            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                            {opt.label}
                          </p>
                          <p className="text-[9px] text-[#1a1a1a]/30"
                            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                            {opt.sub}
                          </p>
                        </div>
                        <p className="text-xs font-light text-[#1a1a1a]/50 flex-shrink-0">
                          ${opt.cost.toFixed(2)}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-7 border-t border-[#1a1a1a]/8 pt-6">
                <div className="flex justify-between text-xs font-light text-[#1a1a1a]/50">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-light text-[#1a1a1a]/50">
                  <span>Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline border-t border-[#1a1a1a]/10 pt-4 mb-8">
                <span className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/40"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  Total
                </span>
                <span className="text-lg font-light text-[#1a1a1a]"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  ${total.toFixed(2)}
                </span>
              </div>

              {error && (
                <p className="text-[10px] text-red-500/70 mb-4 leading-relaxed">{error}</p>
              )}

              <button onClick={handleCheckout} disabled={checking}
                className="w-full py-4 text-[9px] tracking-[0.5em] uppercase bg-[#1a1a1a] text-[#f7f4ef] hover:bg-[#2e2e2e] transition-colors duration-300 disabled:opacity-50"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                {checking ? "Redirecting…" : "Proceed to checkout"}
              </button>

              <p className="text-[8px] text-[#1a1a1a]/22 text-center mt-4 leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                Secure checkout via Stripe. US shipping only.
              </p>
            </div>

            <div className="mt-6">
              <Link href="/xavierlondon-art/shop"
                className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors duration-300"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                ← Continue browsing
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
