// app/api/stripe/checkout/route.ts

import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

const SHIPPING_RATES = {
  standard: {
    shipping_rate_data: {
      type:         "fixed_amount" as const,
      fixed_amount: { amount: 699, currency: "usd" },
      display_name: "Standard Shipping (USPS)",
      delivery_estimate: {
        minimum: { unit: "business_day" as const, value: 7  },
        maximum: { unit: "business_day" as const, value: 14 },
      },
    },
  },
  priority: {
    shipping_rate_data: {
      type:         "fixed_amount" as const,
      fixed_amount: { amount: 1499, currency: "usd" },
      display_name: "Priority Mail (USPS)",
      delivery_estimate: {
        minimum: { unit: "business_day" as const, value: 2 },
        maximum: { unit: "business_day" as const, value: 4 },
      },
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const body    = await req.json();
    const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL;

    // Which brand is checking out — determines success/cancel URLs
    const brand: "blackcat" | "xavier" = body.brand === "xavier" ? "xavier" : "blackcat";

    if (!baseUrl) {
      return NextResponse.json(
        { error: "Site URL not configured." },
        { status: 500 }
      );
    }

    // ── Shipping options ──────────────────────────────────────────────────────
    // If the cart passed a shippingOption, honour it (customer already chose).
    // Single-item "Buy now" flows always show both options — no pre-selection.
    const isCartCheckout    = Array.isArray(body.cartItems) && body.cartItems.length > 0;
    const selectedShipping  = body.shippingOption as "standard" | "priority" | undefined;
    const shippingOptions   =
      isCartCheckout && selectedShipping && SHIPPING_RATES[selectedShipping]
        ? [SHIPPING_RATES[selectedShipping]]   // cart: use the one they picked
        : Object.values(SHIPPING_RATES);       // single-item buy-now: show both

    // ── Build line items ──────────────────────────────────────────────────────
    let lineItems: any[] = [];
    let metadata: Record<string, string> = {};

    if (isCartCheckout) {
      for (const item of body.cartItems) {
        if (!item.stripePriceId) {
          return NextResponse.json(
            { error: `"${item.productTitle}" isn't available for purchase yet.` },
            { status: 400 }
          );
        }
      }
      lineItems = body.cartItems.map((item: any) => ({
        price:    item.stripePriceId,
        quantity: item.quantity ?? 1,
      }));
      metadata.sizes = body.cartItems
        .filter((i: any) => i.size && i.size !== "N/A")
        .map((i: any) => `${i.productTitle}: ${i.size}`)
        .join(", ")
        .slice(0, 480);
      metadata.brand          = brand;
      metadata.shippingChoice = selectedShipping ?? "standard";
    } else {
      // Single-item direct checkout from product page
      const { stripePriceId, quantity, size, productTitle } = body;
      if (!stripePriceId) {
        return NextResponse.json({ error: "Missing price ID" }, { status: 400 });
      }
      lineItems = [{ price: stripePriceId, quantity: quantity ?? 1 }];
      metadata  = {
        size:         size         ?? "N/A",
        productTitle: productTitle ?? "",
        brand,
      };
    }

    // ── Create session ────────────────────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode:                 "payment",
      payment_method_types: ["card"],
      line_items:           lineItems,
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options:     shippingOptions,
      metadata,
      success_url: `${baseUrl}/${brand === "xavier" ? "xavierlondon-art" : "blackcatarchive"}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/${brand === "xavier" ? "xavierlondon-art" : "blackcatarchive"}/cart`,
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("Stripe checkout error:", err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? "Checkout failed — please try again." },
      { status: 500 }
    );
  }
}