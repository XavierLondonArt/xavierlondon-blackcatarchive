// app/api/inquiry/route.ts
// Handles 1-of-1 product inquiries — sends email via Resend

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, productTitle, productSlug } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await resend.emails.send({
      from:    "inquiries@xavierlondon.art",
      to:      "xavierlondonart@xavierlondon.art",
      replyTo: email,
      subject: `Inquiry: ${productTitle}`,
      html: `
        <div style="font-family: 'Courier New', monospace; max-width: 600px; padding: 32px; background: #0a0a0a; color: #e8e4df;">
          <p style="font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: rgba(232,228,223,0.4); margin-bottom: 24px;">
            BLACK CAT ARCHIVE — INQUIRY
          </p>
          <h2 style="font-size: 24px; margin-bottom: 8px; color: #fff;">${productTitle}</h2>
          <p style="font-size: 11px; color: rgba(232,228,223,0.3); margin-bottom: 32px;">
            /blackcatarchive/shop/${productSlug}
          </p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: rgba(232,228,223,0.4); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; width: 80px;">Name</td>
                <td style="padding: 8px 0; font-size: 13px;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: rgba(232,228,223,0.4); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Email</td>
                <td style="padding: 8px 0; font-size: 13px;"><a href="mailto:${email}" style="color: #e8e4df;">${email}</a></td></tr>
          </table>
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(232,228,223,0.1);">
            <p style="color: rgba(232,228,223,0.4); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;">Message</p>
            <p style="font-size: 13px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 40px; font-size: 10px; color: rgba(232,228,223,0.2);">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Inquiry email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}