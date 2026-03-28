// app/api/stripe/webhook/route.ts

import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

// Tell Next.js NOT to parse the body — Stripe needs the raw bytes to verify signature
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    // TODO: decrement inventory in Sanity using sanityClient.patch()
    // TODO: send order confirmation email via Resend
    console.log("✓ Order completed:", session.id, "| Size:", session.metadata?.size);
  }

  return NextResponse.json({ received: true });
}