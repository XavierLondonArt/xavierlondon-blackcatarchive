// app/api/webhooks/stripe/route.ts

import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@sanity/client";

const resend = new Resend(process.env.RESEND_API_KEY);

// Write-enabled Sanity client — needs SANITY_API_TOKEN (Editor role) in Vercel env vars
const sanityWrite = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   "production",
  apiVersion: "2024-01-01",
  token:     process.env.SANITY_API_TOKEN,
  useCdn:    false,
});

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

    // ── 1. Expand line items to get price IDs, quantities, and product names ──
    const expanded = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items.data.price.product", "customer_details"],
    });

    const lineItems = expanded.line_items?.data ?? [];
    const customer  = expanded.customer_details;
    const brand     = session.metadata?.brand ?? "blackcat";
    const isXavier  = brand === "xavier";

    // ── 2. Decrement Sanity inventory ────────────────────────────────────
    // Use structured sizeItems metadata when available (apparel with per-size
    // quantities). Fall back to line-item-level decrement for non-apparel.
    const sizeItems: { priceId: string; size: string; qty: number }[] = (() => {
      try {
        return session.metadata?.sizeItems ? JSON.parse(session.metadata.sizeItems) : [];
      } catch { return []; }
    })();

    if (sizeItems.length > 0) {
      // Group by priceId so we fetch each product once
      const byPrice: Record<string, { size: string; qty: number }[]> = {};
      for (const si of sizeItems) {
        (byPrice[si.priceId] ??= []).push({ size: si.size, qty: si.qty });
      }

      for (const [priceId, entries] of Object.entries(byPrice)) {
        try {
          const product = await sanityWrite.fetch<{
            _id: string;
            inventory: number;
            sizeVariants: { _key: string; size: string; quantity: number }[];
          } | null>(
            `*[_type == "product" && stripePriceId == $priceId][0]{
              _id, inventory,
              sizeVariants[]{ _key, size, quantity }
            }`,
            { priceId }
          );
          if (!product) continue;

          let patch = sanityWrite.patch(product._id);
          let totalDeducted = 0;

          if (product.sizeVariants?.length > 0) {
            // Decrement each matching size variant
            for (const entry of entries) {
              if (entry.size === "N/A") { totalDeducted += entry.qty; continue; }
              const idx = product.sizeVariants.findIndex(v => v.size === entry.size);
              if (idx === -1) { totalDeducted += entry.qty; continue; }
              const newQty = Math.max(0, product.sizeVariants[idx].quantity - entry.qty);
              patch = patch.set({ [`sizeVariants[${idx}].quantity`]: newQty });
              totalDeducted += entry.qty;
              console.log(`✓ Size inventory: ${product._id} ${entry.size} → ${newQty}`);
            }
          } else {
            // No sizeVariants — fall back to total inventory
            for (const e of entries) totalDeducted += e.qty;
          }

          // Always decrement the total inventory field too
          if (typeof product.inventory === "number") {
            const newInv = Math.max(0, product.inventory - totalDeducted);
            patch = patch.set({ inventory: newInv });
            console.log(`✓ Total inventory: ${product._id} → ${newInv}`);
          }

          await patch.commit();
        } catch (err) {
          console.error("Inventory decrement failed for price", priceId, err);
        }
      }
    } else {
      // Non-apparel / legacy path: decrement total inventory by line item qty
      for (const item of lineItems) {
        const priceId = item.price?.id;
        const qty     = item.quantity ?? 1;
        if (!priceId) continue;
        try {
          const product = await sanityWrite.fetch<{ _id: string; inventory: number } | null>(
            `*[_type == "product" && stripePriceId == $priceId][0]{ _id, inventory }`,
            { priceId }
          );
          if (product && typeof product.inventory === "number") {
            const newInventory = Math.max(0, product.inventory - qty);
            await sanityWrite.patch(product._id).set({ inventory: newInventory }).commit();
            console.log(`✓ Inventory: ${product._id} → ${newInventory}`);
          }
        } catch (err) {
          console.error("Inventory decrement failed for price", priceId, err);
        }
      }
    }

    // ── 3. Build order summary rows ────────────────────────────────────────
    const orderItems = lineItems.map((item) => ({
      name:  (item.price?.product as any)?.name ?? "Item",
      qty:   item.quantity ?? 1,
      price: ((item.amount_total ?? 0) / 100).toFixed(2),
    }));

    const shipping = session.total_details?.amount_shipping ?? 0;
    const total    = ((session.amount_total ?? 0) / 100).toFixed(2);
    const orderRef = session.id.slice(-10).toUpperCase();
    const sizes    = session.metadata?.sizes ?? session.metadata?.size ?? "";
    const toEmail  = customer?.email ?? "";

    if (!toEmail) {
      console.warn("No customer email on session", session.id);
      return NextResponse.json({ received: true });
    }

    // ── 4. Send branded confirmation email ────────────────────────────────
    try {
      await resend.emails.send({
        from:    isXavier
          ? "Xavier London Art <orders@xavierlondon.art>"
          : "Black Cat Archive <orders@xavierlondon.art>",
        to:      toEmail,
        replyTo: "xavierlondonart@xavierlondon.art",
        subject: isXavier
          ? `Order confirmed — Xavier London Art (#${orderRef})`
          : `Archive receipt — Black Cat Archive (#${orderRef})`,
        html: isXavier
          ? xavierEmail({ orderRef, orderItems, total, sizes, shipping, customer })
          : blackcatEmail({ orderRef, orderItems, total, sizes, shipping, customer }),
      });
      console.log(`✓ Email sent → ${toEmail} | #${orderRef}`);
    } catch (err) {
      console.error("Resend email failed:", err);
    }
  }

  return NextResponse.json({ received: true });
}

// ── Email templates ──────────────────────────────────────────────────────────

interface EmailData {
  orderRef:   string;
  orderItems: { name: string; qty: number; price: string }[];
  total:      string;
  sizes:      string;
  shipping:   number;
  customer:   any;
}

function xavierEmail({ orderRef, orderItems, total, sizes, shipping, customer }: EmailData) {
  const shippingLabel = shipping === 1499
    ? "Priority Mail (2–4 business days)"
    : "Standard Shipping (7–14 business days)";

  const rows = orderItems.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(26,26,26,0.07);font-size:13px;color:rgba(26,26,26,0.7);font-family:'Georgia',serif;">
        ${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(26,26,26,0.07);font-size:13px;color:rgba(26,26,26,0.7);text-align:right;font-family:'Georgia',serif;">
        $${i.price}
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f4ef;font-family:'Georgia',serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 32px;">

  <p style="font-size:9px;letter-spacing:5px;text-transform:uppercase;color:rgba(26,26,26,0.3);margin:0 0 32px;">
    Xavier London Art
  </p>

  <h1 style="font-size:32px;font-weight:300;color:#1a1a1a;margin:0 0 8px;letter-spacing:0.02em;">
    Order Confirmed
  </h1>
  <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(26,26,26,0.3);margin:0 0 40px;">
    #${orderRef}
  </p>

  <div style="height:1px;background:rgba(26,26,26,0.1);margin-bottom:32px;"></div>

  <p style="font-size:14px;font-weight:300;color:rgba(26,26,26,0.6);line-height:1.8;margin:0 0 32px;">
    Thank you${customer?.name ? `, ${customer.name.split(" ")[0]}` : ""}.
    Your order has been received and is being prepared with care.
    Each piece ships within 7–14 business days.
  </p>

  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">${rows}</table>

  ${sizes ? `
  <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(26,26,26,0.3);margin:8px 0 4px;">Sizes</p>
  <p style="font-size:13px;color:rgba(26,26,26,0.55);margin:0 0 16px;font-family:'Georgia',serif;">${sizes}</p>
  ` : ""}

  <table style="width:100%;border-collapse:collapse;margin:16px 0 32px;">
    <tr>
      <td style="padding:6px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(26,26,26,0.3);">Shipping</td>
      <td style="padding:6px 0;font-size:13px;color:rgba(26,26,26,0.55);text-align:right;">${shippingLabel}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;font-size:13px;font-weight:500;color:#1a1a1a;border-top:1px solid rgba(26,26,26,0.1);">Total</td>
      <td style="padding:10px 0;font-size:13px;font-weight:500;color:#1a1a1a;text-align:right;border-top:1px solid rgba(26,26,26,0.1);">$${total}</td>
    </tr>
  </table>

  ${customer?.address ? `
  <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(26,26,26,0.3);margin:0 0 6px;">Ships to</p>
  <p style="font-size:13px;color:rgba(26,26,26,0.55);line-height:1.7;margin:0 0 32px;">
    ${customer.address.line1 ?? ""}
    ${customer.address.line2 ? "<br>" + customer.address.line2 : ""}
    <br>${customer.address.city ?? ""}, ${customer.address.state ?? ""} ${customer.address.postal_code ?? ""}
  </p>
  ` : ""}

  <div style="height:1px;background:rgba(26,26,26,0.08);margin-bottom:24px;"></div>

  <p style="font-size:11px;color:rgba(26,26,26,0.3);line-height:1.7;margin:0;">
    Questions? Reply to this email or reach us at
    <a href="mailto:xavierlondonart@xavierlondon.art" style="color:rgba(26,26,26,0.5);">
      xavierlondonart@xavierlondon.art
    </a>
  </p>

</div></body></html>`;
}

function blackcatEmail({ orderRef, orderItems, total, sizes, shipping, customer }: EmailData) {
  const shippingLabel = shipping === 1499
    ? "Priority Mail (2–4 business days)"
    : "Standard Shipping (7–14 business days)";

  const rows = orderItems.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(232,228,223,0.06);font-size:12px;color:rgba(232,228,223,0.6);font-family:'Courier New',monospace;">
        ${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(232,228,223,0.06);font-size:12px;color:rgba(232,228,223,0.6);text-align:right;font-family:'Courier New',monospace;">
        $${i.price}
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;">
<div style="max-width:560px;margin:0 auto;padding:48px 32px;">

  <p style="font-size:8px;letter-spacing:6px;text-transform:uppercase;color:rgba(232,228,223,0.2);margin:0 0 40px;">
    Black Cat Archive — Order Receipt
  </p>

  <h1 style="font-size:34px;font-weight:400;color:#e8e4df;margin:0 0 6px;letter-spacing:0.04em;font-family:'Arial Black',sans-serif;">
    YOU'RE IN THE ARCHIVE.
  </h1>
  <p style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:rgba(232,228,223,0.22);margin:0 0 40px;">
    #${orderRef}
  </p>

  <div style="height:1px;background:rgba(232,228,223,0.08);margin-bottom:32px;"></div>

  <p style="font-size:12px;color:rgba(232,228,223,0.45);line-height:1.85;margin:0 0 32px;">
    Order confirmed${customer?.name ? `, ${customer.name.split(" ")[0]}` : ""}.
    Your piece is being prepared. Ships within 7–14 business days. US only.
  </p>

  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">${rows}</table>

  ${sizes ? `
  <p style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(232,228,223,0.2);margin:8px 0 4px;">Sizes</p>
  <p style="font-size:12px;color:rgba(232,228,223,0.4);margin:0 0 16px;">${sizes}</p>
  ` : ""}

  <table style="width:100%;border-collapse:collapse;margin:16px 0 32px;">
    <tr>
      <td style="padding:6px 0;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(232,228,223,0.2);">Shipping</td>
      <td style="padding:6px 0;font-size:11px;color:rgba(232,228,223,0.35);text-align:right;">${shippingLabel}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;font-size:12px;color:rgba(232,228,223,0.7);border-top:1px solid rgba(232,228,223,0.08);">Total</td>
      <td style="padding:10px 0;font-size:12px;color:rgba(232,228,223,0.7);text-align:right;border-top:1px solid rgba(232,228,223,0.08);">$${total}</td>
    </tr>
  </table>

  ${customer?.address ? `
  <p style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(232,228,223,0.2);margin:0 0 6px;">Ships to</p>
  <p style="font-size:12px;color:rgba(232,228,223,0.4);line-height:1.7;margin:0 0 32px;">
    ${customer.address.line1 ?? ""}
    ${customer.address.line2 ? "<br>" + customer.address.line2 : ""}
    <br>${customer.address.city ?? ""}, ${customer.address.state ?? ""} ${customer.address.postal_code ?? ""}
  </p>
  ` : ""}

  <div style="height:1px;background:rgba(232,228,223,0.06);margin-bottom:24px;"></div>

  <p style="font-size:10px;color:rgba(232,228,223,0.18);line-height:1.8;margin:0;">
    Questions? Reply to this email —
    <a href="mailto:xavierlondonart@xavierlondon.art" style="color:rgba(232,228,223,0.3);">
      xavierlondonart@xavierlondon.art
    </a>
  </p>

  <p style="font-size:7px;letter-spacing:4px;text-transform:uppercase;color:rgba(232,228,223,0.08);margin:32px 0 0;">
    BCA / FILE #${orderRef} — CLOSED
  </p>

</div></body></html>`;
}