"use client";

// app/(blackcat)/blackcatarchive/cart/page.tsx

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/blackcat/CartContent";

export default function CartPage() {
  const { items, count, subtotal, removeItem, updateQty, clearCart } = useCart();
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
      // Build one Stripe line item per cart item
      const res  = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
    <div className="min-h-screen bg-[#080808] text-[#e8e4df]">

      {/* Grain */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat", backgroundSize: "120px 120px",
        }}
      />

      {/* Header */}
      <div className="px-6 md:px-16 pt-16 pb-10 border-b border-white/8 relative z-10">
        <p className="text-[7px] tracking-[0.8em] uppercase text-white/20 mb-3"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          Archive
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-[clamp(2.5rem,7vw,5rem)] text-white leading-none"
            style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
            Cart
            {count > 0 && (
              <span className="text-[1rem] text-white/25 ml-4"
                style={{ fontFamily: "'Courier Prime',monospace", letterSpacing: "0.2em" }}>
                [{count}]
              </span>
            )}
          </h1>
          {items.length > 0 && (
            <button onClick={clearCart}
              className="text-[8px] tracking-[0.4em] uppercase text-white/18 hover:text-white/45 transition-colors duration-200 mb-2"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-center px-8 relative z-10">
          <p className="text-[clamp(3rem,8vw,6rem)] text-white/4 leading-none select-none mb-6"
            style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
            Empty Archive
          </p>
          <p className="text-xs text-white/22 mb-10 tracking-widest uppercase"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            Nothing held here yet
          </p>
          <Link href="/blackcatarchive/shop"
            className="group relative border border-white/18 px-10 py-3.5 text-[9px] tracking-[0.4em] uppercase overflow-hidden transition-colors duration-300"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            <span className="relative z-10 text-white/45 group-hover:text-black transition-colors duration-250">
              Browse the Archive
            </span>
            <span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
          </Link>
        </div>
      )}

      {/* Cart contents */}
      {items.length > 0 && (
        <div className="relative z-10 px-6 md:px-16 py-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">

          {/* ── Item list ── */}
          <div className="space-y-1">
            {items.map(item => (
              <div key={item.id}
                className="flex gap-5 p-5 border border-white/6 hover:border-white/10 transition-colors duration-200 group">

                {/* Thumbnail */}
                <Link href={`/blackcatarchive/shop/${item.slug}`}
                  className="flex-shrink-0 relative overflow-hidden bg-[#111]"
                  style={{ width: "90px", height: "110px" }}>
                  {item.image ? (
                    <img src={item.image} alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/8 text-lg select-none"
                        style={{ fontFamily: "'Bebas Neue',sans-serif" }}>BCA</span>
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <Link href={`/blackcatarchive/shop/${item.slug}`}>
                      <h3 className="text-sm text-white/80 leading-snug hover:text-white transition-colors duration-200 line-clamp-2 mb-1"
                        style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.03em" }}>
                        {item.title}
                      </h3>
                    </Link>
                    {item.size !== "N/A" && (
                      <p className="text-[8px] tracking-[0.35em] uppercase text-white/25 mb-3"
                        style={{ fontFamily: "'Courier Prime',monospace" }}>
                        Size: {item.size === "2XL" ? "XXL" : item.size}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Qty controls */}
                    <div className="flex items-center border border-white/10">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-colors duration-150 text-sm"
                        aria-label="Decrease quantity">
                        −
                      </button>
                      <span className="w-8 text-center text-xs text-white/60 tabular-nums"
                        style={{ fontFamily: "'Courier Prime',monospace" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.inventory}
                        className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-colors duration-150 text-sm disabled:opacity-20 disabled:cursor-not-allowed"
                        aria-label="Increase quantity">
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-5">
                      <span className="text-sm text-white/55"
                        style={{ fontFamily: "'Courier Prime',monospace" }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[7px] tracking-[0.4em] uppercase text-white/15 hover:text-red-400/50 transition-colors duration-200"
                        style={{ fontFamily: "'Courier Prime',monospace" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order summary ── */}
          <div className="flex flex-col gap-0">
            <div className="border border-white/8 p-6 sticky top-6">
              <p className="text-[7px] tracking-[0.7em] uppercase text-white/20 mb-6"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                Order Summary
              </p>

              {/* Line items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-white/8">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-3">
                    <span className="text-[10px] text-white/40 leading-snug flex-1 line-clamp-2"
                      style={{ fontFamily: "'Courier Prime',monospace" }}>
                      {item.title}
                      {item.size !== "N/A" && (
                        <span className="text-white/20"> / {item.size === "2XL" ? "XXL" : item.size}</span>
                      )}
                      {item.quantity > 1 && (
                        <span className="text-white/20"> ×{item.quantity}</span>
                      )}
                    </span>
                    <span className="text-[10px] text-white/40 flex-shrink-0"
                      style={{ fontFamily: "'Courier Prime',monospace" }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping picker */}
              <div className="mb-6 pb-6 border-b border-white/8">
                <p className="text-[7px] tracking-[0.6em] uppercase text-white/20 mb-3"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  Shipping
                </p>
                <div className="space-y-2">
                  {([
                    { id: "standard", label: "Standard (USPS)", sub: "5–10 business days", price: SHIPPING_STANDARD },
                    { id: "priority", label: "Priority Mail",   sub: "2–4 business days",  price: SHIPPING_PRIORITY },
                  ] as const).map(opt => (
                    <label key={opt.id}
                      className="flex items-center justify-between gap-3 p-3 border cursor-pointer transition-colors duration-150"
                      style={{
                        borderColor: shippingOption === opt.id ? "rgba(232,228,223,0.25)" : "rgba(232,228,223,0.06)",
                        background:  shippingOption === opt.id ? "rgba(232,228,223,0.03)" : "transparent",
                      }}>
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: shippingOption === opt.id ? "rgba(232,228,223,0.5)" : "rgba(232,228,223,0.15)" }}>
                          {shippingOption === opt.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                          )}
                        </div>
                        <div>
                          <p className="text-[9px] text-white/55"
                            style={{ fontFamily: "'Courier Prime',monospace" }}>
                            {opt.label}
                          </p>
                          <p className="text-[7px] text-white/22"
                            style={{ fontFamily: "'Courier Prime',monospace" }}>
                            {opt.sub}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] text-white/40 flex-shrink-0"
                        style={{ fontFamily: "'Courier Prime',monospace" }}>
                        ${opt.price.toFixed(2)}
                      </span>
                      <input type="radio" className="sr-only"
                        checked={shippingOption === opt.id}
                        onChange={() => setShippingOption(opt.id)} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-[9px] text-white/30"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    Subtotal
                  </span>
                  <span className="text-[9px] text-white/45"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-white/30"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    Shipping
                  </span>
                  <span className="text-[9px] text-white/45"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    ${shippingCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/8">
                  <span className="text-xs text-white/60 tracking-wider"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    Total
                  </span>
                  <span className="text-sm text-white/80"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-[8px] tracking-[0.3em] text-red-400/60 mb-3"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  {error}
                </p>
              )}

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={checking}
                className="group relative w-full border border-white/25 py-4 text-[9px] tracking-[0.5em] uppercase overflow-hidden transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                <span className="relative z-10 text-white group-hover:text-black transition-colors duration-250">
                  {checking ? "Opening checkout..." : "Proceed to Checkout"}
                </span>
                <span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              </button>

              {/* Security note */}
              <div className="flex items-start gap-2 mt-4">
                <svg className="w-3 h-3 text-white/14 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-[7px] text-white/15 leading-relaxed"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  Secure checkout via Stripe. Card details never touch this server. US shipping only.
                </p>
              </div>

            </div>

            <Link href="/blackcatarchive/shop"
              className="text-[8px] tracking-[0.4em] uppercase text-white/18 hover:text-white/45 transition-colors duration-200 text-center mt-4"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              ← Continue shopping
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}