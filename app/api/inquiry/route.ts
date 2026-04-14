// app/api/inquiry/route.ts
// Handles 1-of-1 product inquiries for both brands.
// Sends two emails per submission:
//   1. Internal notification to the owner (with full message + reply-to set)
//   2. Auto-reply to the customer (confirms receipt, sets expectations)
//
// Payload shape:
//   { name, email, message, productTitle, productSlug, brand: "xavier" | "blackcat" }

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, productTitle, productSlug, brand } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isXavier  = brand === "xavier";
    const fromOwner = isXavier
      ? "Xavier London Art <inquiries@xavierlondon.art>"
      : "Black Cat Archive <inquiries@xavierlondon.art>";
    const shopPath  = isXavier
      ? `/xavierlondon-art/shop/${productSlug}`
      : `/blackcatarchive/shop/${productSlug}`;

    // ── 1. Internal notification → owner ──────────────────────────────────
    await resend.emails.send({
      from:    fromOwner,
      to:      "xavierlondonart@xavierlondon.art",
      replyTo: email,
      subject: isXavier
        ? `New inquiry — ${productTitle} (Xavier London Art)`
        : `New inquiry — ${productTitle} (Black Cat Archive)`,
      html: isXavier
        ? ownerEmailXavier({ name, email, message, productTitle, shopPath })
        : ownerEmailBCA({ name, email, message, productTitle, shopPath }),
    });

    // ── 2. Auto-reply → customer ──────────────────────────────────────────
    await resend.emails.send({
      from:    fromOwner,
      to:      email,
      replyTo: "xavierlondonart@xavierlondon.art",
      subject: isXavier
        ? `We received your inquiry — ${productTitle}`
        : `Inquiry received — ${productTitle}`,
      html: isXavier
        ? autoReplyXavier({ name, productTitle })
        : autoReplyBCA({ name, productTitle }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Inquiry email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── Owner notification templates ─────────────────────────────────────────────

function ownerEmailXavier({ name, email, message, productTitle, shopPath }: any) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f4ef;font-family:'Georgia',serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 32px;">
  <p style="font-size:9px;letter-spacing:5px;text-transform:uppercase;color:rgba(26,26,26,0.3);margin:0 0 32px;">
    Xavier London Art — New Inquiry
  </p>
  <h2 style="font-size:22px;font-weight:300;color:#1a1a1a;margin:0 0 4px;">${productTitle}</h2>
  <p style="font-size:11px;color:rgba(26,26,26,0.3);margin:0 0 32px;font-family:'Courier New',monospace;">
    xavierlondon.art${shopPath}
  </p>
  <div style="height:1px;background:rgba(26,26,26,0.1);margin-bottom:28px;"></div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr>
      <td style="padding:8px 0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(26,26,26,0.35);width:72px;vertical-align:top;">Name</td>
      <td style="padding:8px 0;font-size:14px;font-weight:300;color:#1a1a1a;">${name}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(26,26,26,0.35);vertical-align:top;">Email</td>
      <td style="padding:8px 0;font-size:14px;font-weight:300;">
        <a href="mailto:${email}" style="color:#1a1a1a;">${email}</a>
      </td>
    </tr>
  </table>
  <p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(26,26,26,0.35);margin:0 0 10px;">Message</p>
  <p style="font-size:14px;font-weight:300;color:rgba(26,26,26,0.7);line-height:1.8;white-space:pre-wrap;border-left:2px solid rgba(26,26,26,0.12);padding-left:16px;margin:0 0 32px;">
    ${message}
  </p>
  <div style="height:1px;background:rgba(26,26,26,0.08);margin-bottom:20px;"></div>
  <p style="font-size:11px;color:rgba(26,26,26,0.3);line-height:1.7;margin:0;">
    Reply to this email to respond directly to ${name}.
  </p>
</div></body></html>`;
}

function ownerEmailBCA({ name, email, message, productTitle, shopPath }: any) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;">
<div style="max-width:560px;margin:0 auto;padding:48px 32px;">
  <p style="font-size:8px;letter-spacing:6px;text-transform:uppercase;color:rgba(232,228,223,0.2);margin:0 0 32px;">
    Black Cat Archive — New Inquiry
  </p>
  <h2 style="font-size:22px;font-weight:400;color:#e8e4df;margin:0 0 4px;letter-spacing:0.03em;">${productTitle}</h2>
  <p style="font-size:10px;color:rgba(232,228,223,0.22);margin:0 0 32px;">
    xavierlondon.art${shopPath}
  </p>
  <div style="height:1px;background:rgba(232,228,223,0.08);margin-bottom:28px;"></div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr>
      <td style="padding:8px 0;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(232,228,223,0.25);width:64px;vertical-align:top;">Name</td>
      <td style="padding:8px 0;font-size:13px;color:rgba(232,228,223,0.75);">${name}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(232,228,223,0.25);vertical-align:top;">Email</td>
      <td style="padding:8px 0;font-size:13px;">
        <a href="mailto:${email}" style="color:rgba(232,228,223,0.65);">${email}</a>
      </td>
    </tr>
  </table>
  <p style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(232,228,223,0.25);margin:0 0 10px;">Message</p>
  <p style="font-size:13px;color:rgba(232,228,223,0.55);line-height:1.85;white-space:pre-wrap;border-left:1px solid rgba(232,228,223,0.12);padding-left:16px;margin:0 0 32px;">
    ${message}
  </p>
  <div style="height:1px;background:rgba(232,228,223,0.06);margin-bottom:20px;"></div>
  <p style="font-size:10px;color:rgba(232,228,223,0.2);line-height:1.7;margin:0;">
    Reply to this email to respond directly to ${name}.
  </p>
</div></body></html>`;
}

// ── Auto-reply templates ──────────────────────────────────────────────────────

function autoReplyXavier({ name, productTitle }: { name: string; productTitle: string }) {
  const firstName = name.split(" ")[0];
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f4ef;font-family:'Georgia',serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 32px;">
  <p style="font-size:9px;letter-spacing:5px;text-transform:uppercase;color:rgba(26,26,26,0.3);margin:0 0 32px;">
    Xavier London Art
  </p>
  <h1 style="font-size:28px;font-weight:300;color:#1a1a1a;margin:0 0 32px;line-height:1.3;">
    Thank you, ${firstName}.
  </h1>
  <div style="height:1px;background:rgba(26,26,26,0.1);margin-bottom:28px;"></div>
  <p style="font-size:14px;font-weight:300;color:rgba(26,26,26,0.6);line-height:1.85;margin:0 0 20px;">
    Your inquiry about <em>${productTitle}</em> has been received.
  </p>
  <p style="font-size:14px;font-weight:300;color:rgba(26,26,26,0.6);line-height:1.85;margin:0 0 32px;">
    We respond to all inquiries within 48 hours. Reply to this email if you
    have additional questions in the meantime.
  </p>
  <div style="height:1px;background:rgba(26,26,26,0.08);margin-bottom:24px;"></div>
  <p style="font-size:11px;color:rgba(26,26,26,0.3);line-height:1.7;margin:0;">
    Xavier London Art &nbsp;·&nbsp;
    <a href="https://xavierlondon.art/xavierlondon-art" style="color:rgba(26,26,26,0.4);">
      xavierlondon.art
    </a>
  </p>
</div></body></html>`;
}

function autoReplyBCA({ name, productTitle }: { name: string; productTitle: string }) {
  const firstName = name.split(" ")[0];
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;">
<div style="max-width:560px;margin:0 auto;padding:48px 32px;">
  <p style="font-size:8px;letter-spacing:6px;text-transform:uppercase;color:rgba(232,228,223,0.2);margin:0 0 32px;">
    Black Cat Archive
  </p>
  <h1 style="font-size:28px;font-weight:400;color:#e8e4df;margin:0 0 32px;letter-spacing:0.02em;">
    Inquiry received, ${firstName}.
  </h1>
  <div style="height:1px;background:rgba(232,228,223,0.08);margin-bottom:28px;"></div>
  <p style="font-size:12px;color:rgba(232,228,223,0.5);line-height:1.9;margin:0 0 20px;">
    Your inquiry about <em style="color:rgba(232,228,223,0.7);">${productTitle}</em> is in the archive.
  </p>
  <p style="font-size:12px;color:rgba(232,228,223,0.5);line-height:1.9;margin:0 0 32px;">
    We respond within 48 hours. Reply to this email if you have questions
    before then.
  </p>
  <div style="height:1px;background:rgba(232,228,223,0.06);margin-bottom:24px;"></div>
  <p style="font-size:9px;color:rgba(232,228,223,0.18);line-height:1.7;margin:0;">
    Black Cat Archive &nbsp;·&nbsp;
    <a href="https://xavierlondon.art/blackcatarchive" style="color:rgba(232,228,223,0.25);">
      xavierlondon.art
    </a>
  </p>
  <p style="font-size:7px;letter-spacing:4px;text-transform:uppercase;color:rgba(232,228,223,0.07);margin:28px 0 0;">
    BCA / INQUIRY — LOGGED
  </p>
</div></body></html>`;
}