// app/api/stripe/checkout/route.ts

import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL;

    if (!baseUrl) {
      return NextResponse.json(
        { error: "Site URL not configured." },
        { status: 500 }
      );
    }

    // ── Determine if this is a cart checkout or single-item ─────────────────
    const isCartCheckout = Array.isArray(body.cartItems) && body.cartItems.length > 0;

    let lineItems: any[] = [];
    let metadata: Record<string, string> = {};

    if (isCartCheckout) {
      // Multi-item cart — validate all items have a Stripe price ID
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
      // Store sizes in metadata (Stripe metadata has a 500 char limit per value)
      metadata.sizes = body.cartItems
        .filter((i: any) => i.size && i.size !== "N/A")
        .map((i: any) => `${i.productTitle}: ${i.size}`)
        .join(", ")
        .slice(0, 480);
    } else {
      // Single-item direct checkout from product page
      const { stripePriceId, quantity, size, productTitle } = body;
      if (!stripePriceId) {
        return NextResponse.json({ error: "Missing price ID" }, { status: 400 });
      }
      lineItems = [{ price: stripePriceId, quantity: quantity ?? 1 }];
      metadata = {
        size:         size         ?? "N/A",
        productTitle: productTitle ?? "",
      };
    }

    // ── Shipping options ─────────────────────────────────────────────────────
    const shippingOptions = [
      {
        shipping_rate_data: {
          type:         "fixed_amount" as const,
          fixed_amount: { amount: 699, currency: "usd" },
          display_name: "Standard Shipping (USPS)",
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 5  },
            maximum: { unit: "business_day" as const, value: 10 },
          },
        },
      },
      {
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
    ];

    // ── Create session ───────────────────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode:                 "payment",
      payment_method_types: ["card"],
      line_items:           lineItems,
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options:     shippingOptions,
      metadata,
      success_url: `${baseUrl}/blackcatarchive/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/blackcatarchive/cart`,
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