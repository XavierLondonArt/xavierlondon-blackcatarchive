// app/api/subscribe/route.ts
// Footer newsletter / drop-alert subscribe for both brands.
//
// Payload shape:
//   { email, brand: "xavier" | "blackcat" }
//
// What it does:
//   1. Adds the contact to the correct Resend audience
//   2. Sends a branded welcome email to the subscriber
//   3. Sends an internal heads-up to the owner
//
// Resend audience IDs live in env vars:
//   RESEND_XAVIER_AUDIENCE_ID  — Xavier London Art list
//   RESEND_BCA_AUDIENCE_ID     — Black Cat Archive list

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, brand } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const isXavier   = brand === "xavier";
    const audienceId = isXavier
      ? process.env.RESEND_XAVIER_AUDIENCE_ID
      : process.env.RESEND_BCA_AUDIENCE_ID;

    // ── 1. Add to Resend audience ──────────────────────────────────────────
    if (audienceId) {
      try {
        await resend.contacts.create({
          email,
          audienceId,
          unsubscribed: false,
        });
      } catch (err: any) {
        // "Contact already exists" is fine — still send the welcome email
        if (!err.message?.toLowerCase().includes("already")) {
          throw err;
        }
      }
    } else {
      console.warn(
        `No audience ID set for brand "${brand}". ` +
        `Add ${isXavier ? "RESEND_XAVIER_AUDIENCE_ID" : "RESEND_BCA_AUDIENCE_ID"} to env vars.`
      );
    }

    // ── 2. Welcome email → subscriber ─────────────────────────────────────
    await resend.emails.send({
      from:    isXavier
        ? "Xavier London Art <hello@xavierlondon.art>"
        : "Black Cat Archive <hello@xavierlondon.art>",
      to:      email,
      replyTo: "xavierlondonart@xavierlondon.art",
      subject: isXavier
        ? "You're on the list — Xavier London Art"
        : "Access granted — Black Cat Archive",
      html: isXavier ? welcomeXavier() : welcomeBCA(),
    });

    // ── 3. Internal heads-up → owner ──────────────────────────────────────
    await resend.emails.send({
      from:    isXavier
        ? "Xavier London Art <hello@xavierlondon.art>"
        : "Black Cat Archive <hello@xavierlondon.art>",
      to:      "xavierlondonart@xavierlondon.art",
      subject: isXavier
        ? `New subscriber — Xavier London Art`
        : `New subscriber — Black Cat Archive`,
      html: ownerAlert({ email, brand: isXavier ? "Xavier London Art" : "Black Cat Archive" }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── Welcome email templates ───────────────────────────────────────────────────

function welcomeXavier() {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f4ef;font-family:'Georgia',serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 32px;">

  <p style="font-size:9px;letter-spacing:5px;text-transform:uppercase;color:rgba(26,26,26,0.3);margin:0 0 40px;">
    Xavier London Art
  </p>

  <h1 style="font-size:30px;font-weight:300;color:#1a1a1a;margin:0 0 32px;line-height:1.25;">
    You're on the list.
  </h1>

  <div style="height:1px;background:rgba(26,26,26,0.1);margin-bottom:28px;"></div>

  <p style="font-size:14px;font-weight:300;color:rgba(26,26,26,0.6);line-height:1.85;margin:0 0 20px;">
    You'll hear from us when new works are added, collections go live,
    and limited editions open — and nothing else.
  </p>

  <p style="font-size:14px;font-weight:300;color:rgba(26,26,26,0.6);line-height:1.85;margin:0 0 40px;">
    We send infrequently. Each dispatch is worth opening.
  </p>

  <div style="height:1px;background:rgba(26,26,26,0.08);margin-bottom:24px;"></div>

  <p style="font-size:11px;color:rgba(26,26,26,0.28);line-height:1.7;margin:0;">
    Xavier London Art &nbsp;·&nbsp;
    <a href="https://xavierlondon.art/xavierlondon-art" style="color:rgba(26,26,26,0.38);">
      xavierlondon.art
    </a>
    &nbsp;·&nbsp;
    <a href="https://xavierlondon.art/xavierlondon-art" style="color:rgba(26,26,26,0.28);">
      Unsubscribe
    </a>
  </p>

</div></body></html>`;
}

function welcomeBCA() {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;">
<div style="max-width:560px;margin:0 auto;padding:48px 32px;">

  <p style="font-size:8px;letter-spacing:6px;text-transform:uppercase;color:rgba(232,228,223,0.2);margin:0 0 40px;">
    Black Cat Archive
  </p>

  <h1 style="font-size:30px;font-weight:400;color:#e8e4df;margin:0 0 8px;letter-spacing:0.03em;">
    Access granted.
  </h1>
  <p style="font-size:8px;letter-spacing:4px;text-transform:uppercase;color:rgba(232,228,223,0.18);margin:0 0 32px;">
    You're in.
  </p>

  <div style="height:1px;background:rgba(232,228,223,0.08);margin-bottom:28px;"></div>

  <p style="font-size:12px;color:rgba(232,228,223,0.5);line-height:1.9;margin:0 0 20px;">
    Drop alerts. Archive TV premieres. New entries to the catalog.
    That's what you'll get — nothing else.
  </p>

  <p style="font-size:12px;color:rgba(232,228,223,0.5);line-height:1.9;margin:0 0 40px;">
    Drops announce without warning. Being subscribed is the only way
    to know before units are gone.
  </p>

  <div style="height:1px;background:rgba(232,228,223,0.06);margin-bottom:24px;"></div>

  <p style="font-size:9px;color:rgba(232,228,223,0.18);line-height:1.7;margin:0;">
    Black Cat Archive &nbsp;·&nbsp;
    <a href="https://xavierlondon.art/blackcatarchive" style="color:rgba(232,228,223,0.28);">
      xavierlondon.art
    </a>
    &nbsp;·&nbsp;
    <a href="https://xavierlondon.art/blackcatarchive" style="color:rgba(232,228,223,0.18);">
      Unsubscribe
    </a>
  </p>

  <p style="font-size:7px;letter-spacing:4px;text-transform:uppercase;color:rgba(232,228,223,0.07);margin:28px 0 0;">
    BCA / SUBSCRIBER — LOGGED
  </p>

</div></body></html>`;
}

// ── Owner alert ───────────────────────────────────────────────────────────────

function ownerAlert({ email, brand }: { email: string; brand: string }) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#111;font-family:'Courier New',monospace;">
<div style="max-width:400px;margin:0 auto;padding:32px;">
  <p style="font-size:8px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.25);margin:0 0 20px;">
    New Subscriber — ${brand}
  </p>
  <p style="font-size:16px;color:rgba(255,255,255,0.8);margin:0;">
    ${email}
  </p>
</div></body></html>`;
}