"use client";

// app/(blackcat)/blackcatarchive/about/page.tsx

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { setTimeout(() => setRevealed(true), 80); }, []);

  return (
    <div
      className="min-h-screen bg-[#080808] text-[#e8e4df]"
      style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.7s ease" }}
    >
      {/* Grain overlay */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat", backgroundSize: "120px 120px",
        }}
      />

      {/* ════════════════════════════════════════════════════════
          HEADER — large atmospheric title
      ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[60vh] flex flex-col justify-end px-6 md:px-16 pb-16 overflow-hidden">
        {/* Red fog */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(140,10,10,0.14) 0%, transparent 65%)",
              "radial-gradient(ellipse 40% 60% at 10% 50%, rgba(80,5,5,0.08) 0%, transparent 60%)",
            ].join(", "),
          }}
        />
        <div className="relative z-10 max-w-4xl">
          <p className="text-[7px] tracking-[0.8em] uppercase text-white/20 mb-6"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            Black Cat Archive — Est. from the underground
          </p>
          <h1 className="text-[clamp(3rem,10vw,8rem)] text-white leading-[0.92] mb-8"
            style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.02em" }}>
            Culture.<br />Art.<br />Transcendence.
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-px w-16 bg-white/15" />
            <p className="text-[9px] tracking-[0.5em] uppercase text-white/25"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              Archive
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          MANIFESTO
      ════════════════════════════════════════════════════════ */}
      <section className="border-t border-white/6 bg-[#0d0d0d]">
        <div className="px-6 md:px-16 py-20 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="text-[7px] tracking-[0.8em] uppercase text-white/18 mb-8"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              — What we are
            </p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] text-white leading-none mb-8"
              style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
              Not a brand.<br />An archive.
            </h2>
            <div className="pl-4 border-l border-white/10 space-y-5">
              <p className="text-sm text-white/50 leading-[1.95]"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                The Black Cat Archive doesn't make products for everyone. It makes pieces for the people who already know — the ones who move through the world with intention, who build things in the dark before anyone notices.
              </p>
              <p className="text-sm text-white/50 leading-[1.95]"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                Every release is a file. Every piece carries a number. When the units are gone, the archive closes that chapter and it doesn't reopen.
              </p>
              <p className="text-sm text-white/50 leading-[1.95]"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                This isn't fast fashion. This isn't hype. This is documentation.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[7px] tracking-[0.8em] uppercase text-white/18 mb-8"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                — The system
              </p>
              <ul className="space-y-6">
                {[
                  { num: "01", title: "Limited by design", body: "Every archive file has a fixed unit count. No restocks. No reprints. The number on your piece is its place in history." },
                  { num: "02", title: "Unit 00 stays", body: "The first unit of every drop is held permanently in the archive. It never ships. It marks the record." },
                  { num: "03", title: "Constructed, not manufactured", body: "Each piece is built with intention. Heavyweight materials, deliberate finishes, details that reward attention." },
                  { num: "04", title: "The archive is the brand", body: "Archive TV, Manuscripts & Dispatches, the drops — it's one body of work. The clothes are just the part you can wear." },
                ].map(item => (
                  <li key={item.num} className="flex gap-5">
                    <span className="text-[8px] text-white/18 mt-1 flex-shrink-0 tabular-nums"
                      style={{ fontFamily: "'Courier Prime',monospace" }}>
                      {item.num}
                    </span>
                    <div>
                      <p className="text-xs text-white/65 mb-1"
                        style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.06em", fontSize: "0.85rem" }}>
                        {item.title}
                      </p>
                      <p className="text-xs text-white/35 leading-relaxed"
                        style={{ fontFamily: "'Courier Prime',monospace" }}>
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          DIVIDER — atmospheric
      ════════════════════════════════════════════════════════ */}
      <div className="relative py-20 px-6 md:px-16 overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(120,8,8,0.1) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[clamp(1rem,3vw,1.6rem)] text-white/35 leading-[1.8] italic"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            "Black Culture, Art & Transendence doesn't announce itself...<br />It's already in the room."
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-12 bg-white/8" />
            <span className="text-[7px] tracking-[0.6em] uppercase text-white/15"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              BCA
            </span>
            <div className="h-px w-12 bg-white/8" />
          </div>
        </div>
      </div>
          <img src="/ninthlifeticket.png" className="img-fluid ${3|rounded-top,rounded-right,rounded-bottom,rounded-left,rounded-circle,|}" alt="ninthlifeticket" width={180} height={180} style={{ margin: "2.5rem auto 1rem" }} />

      {/* ════════════════════════════════════════════════════════
          WHAT WE DO — three pillars
      ════════════════════════════════════════════════════════ */}
      <section className="border-t border-white/6 bg-[#0d0d0d]">
        <div className="px-6 md:px-16 py-20 max-w-5xl mx-auto">
          <p className="text-[7px] tracking-[0.8em] uppercase text-white/18 mb-12"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            — The work
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {[
              {
                label:   "Archive Records",
                slug:    "/blackcatarchive/shop",
                desc:    "Limited drops. Numbered units. Heavy materials, deliberate construction. Each release is a file in the system.",
                cta:     "Browse Archive →",
              },
              {
                label:   "Archive TV",
                slug:    "/blackcatarchive/archive-tv",
                desc:    "Raw documentation of the process. How things get made. Where the ideas come from. No filters.",
                cta:     "Watch →",
              },
              {
                label:   "Manuscripts",
                slug:    "/blackcatarchive/blog",
                desc:    "Dispatches from inside the work. Long-form thoughts on culture, art, craft, and what it means to build something real.",
                cta:     "Read →",
              },
            ].map(pillar => (
              <div key={pillar.label}
                className="border border-white/6 p-8 flex flex-col justify-between gap-8 hover:border-white/14 transition-colors duration-300">
                <div>
                  <h3 className="text-[clamp(1.4rem,3vw,2rem)] text-white leading-tight mb-4"
                    style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.03em" }}>
                    {pillar.label}
                  </h3>
                  <p className="text-xs text-white/35 leading-relaxed"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    {pillar.desc}
                  </p>
                </div>
                <Link href={pillar.slug}
                  className="text-[9px] tracking-[0.4em] uppercase text-white/30 hover:text-white transition-colors duration-200"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  {pillar.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CONTACT
      ════════════════════════════════════════════════════════ */}
      <section className="border-t border-white/6 px-6 md:px-16 py-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="text-[7px] tracking-[0.8em] uppercase text-white/18 mb-8"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              — Get in touch
            </p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] text-white leading-none mb-6"
              style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
              Questions.<br />Inquiries.<br />Proposals.
            </h2>
            <p className="text-xs text-white/35 leading-relaxed mb-8 max-w-sm"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              For 1-of-1 piece inquiries, press, wholesale, or anything else — reach out directly. We respond within 48 hours.
            </p>
            <a href="mailto:contact@xavierlondon.art"
              className="text-[9px] tracking-[0.4em] uppercase text-white/35 hover:text-white transition-colors duration-200 underline underline-offset-4"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              xavierlondon@xavierlondon.art
            </a>
          </div>

          <div>
            <p className="text-[7px] tracking-[0.8em] uppercase text-white/18 mb-8"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              — Stay in the loop
            </p>
            <p className="text-xs text-white/35 leading-relaxed mb-6"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              Drop alerts, Archive TV releases, manuscripts. Nothing else. No noise.
            </p>
            <form
              onSubmit={e => e.preventDefault()}
              className="flex flex-col gap-3 max-w-sm"
            >
              <input
                type="email"
                placeholder="your email"
                className="bg-transparent border border-white/10 px-4 py-3 text-xs text-white placeholder:text-white/18 focus:outline-none focus:border-white/30 transition-colors"
                style={{ fontFamily: "'Courier Prime',monospace" }}
              />
              <button
                type="submit"
                className="group relative border border-white/18 py-3 text-[9px] tracking-[0.4em] uppercase overflow-hidden transition-colors duration-300"
                style={{ fontFamily: "'Courier Prime',monospace" }}
              >
                <span className="relative z-10 text-white/45 group-hover:text-black transition-colors duration-250">
                  Subscribe to Archive
                </span>
                <span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}