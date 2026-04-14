"use client";

// app/(blackcat)/blackcatarchive/about/page.tsx

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#080808] text-[#e8e4df]"
      style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.8s ease" }}
    >
      {/* Grain overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "120px 120px",
        }}
      />

      {/* HEADER */}
      <section className="relative min-h-[60vh] flex flex-col justify-end px-6 md:px-16 pb-16 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(140,10,10,0.14) 0%, transparent 65%)",
              "radial-gradient(ellipse 40% 60% at 10% 50%, rgba(80,5,5,0.08) 0%, transparent 60%)",
            ].join(", "),
          }}
        />

        <div className="relative z-10 max-w-4xl">
          <p className="text-[7px] tracking-[0.8em] uppercase text-white/20 mb-6 font-mono">
            Black Cat Archive — Est. from the underground
          </p>

          <h1 className="text-[clamp(3rem,10vw,8rem)] text-white leading-[0.92] mb-8 font-display">
            Culture.<br />Art.<br />Transcendence.
          </h1>

          <div className="flex items-center gap-4">
            <div className="h-px w-16 bg-white/15" />
            <p className="text-[9px] tracking-[0.5em] uppercase text-white/25 font-mono">
              Archive
            </p>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="border-t border-white/6 bg-[#0d0d0d]">
        <div className="px-6 md:px-16 py-20 max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-[7px] tracking-[0.8em] uppercase text-white/18 mb-8 font-mono">
              — What we are
            </p>

            <h2 className="text-[clamp(2rem,5vw,3.5rem)] text-white leading-none mb-8 font-display">
              Not a brand.<br />An archive.
            </h2>

            <div className="pl-4 border-l border-white/10 space-y-6 text-sm text-white/50 leading-[1.9] font-mono">
              <p>
                The Black Cat Archive does not exist for everyone.
                It exists for those who already understand—
                those who move with intention,
                who build in the dark,
                who create before recognition arrives.
              </p>

              <p>
                This is not solely about clothing.
                Not solely about art.
              </p>

              <p>
                This is a conservation of the underground.
                A continuation of a tradition—
                to breathe life into nothing
                and make something that carries weight.
              </p>

              <p>
                What is released here are not products.
                They are artifacts.
              </p>

              <p>
                Every piece, every image, every record
                is part of a larger body—
                a living archive of process, memory,
                and cultural instinct.
              </p>

              <p>
                This is not fast fashion.
                This is not hype.
              </p>

              <p>
                This is documentation.
                This is preservation.
                This is refusal.
              </p>

              <p>
                Refusal to commodify what is sacred.
                Refusal to dilute what is intentional.
              </p>

              <p>This is The Archive.</p>

              <p className="text-white/70">— The Black Cat</p>
            </div>
          </div>

          {/* SYSTEM */}
          <div>
            <p className="text-[7px] tracking-[0.8em] uppercase text-white/18 mb-8 font-mono">
              — The system
            </p>

            <ul className="space-y-8">
              {[
                {
                  num: "01",
                  title: "Limited by design",
                  body: "Every archive file carries a fixed number. No restocks. No repetition. What exists is what was meant to exist.",
                },
                {
                  num: "02",
                  title: "Unit 00 stays",
                  body: "The first unit is never released. It remains within the archive—a permanent marker of origin.",
                },
                {
                  num: "03",
                  title: "Constructed, not manufactured",
                  body: "Each piece is built with care and intention. Material, weight, and detail are always deliberate.",
                },
                {
                  num: "04",
                  title: "The archive is the body",
                  body: "Archive TV. Manuscripts. Dispatches. Releases. All part of the same system. The garments are simply what can be worn.",
                },
              ].map((item) => (
                <li key={item.num} className="flex gap-5">
                  <span className="text-[8px] text-white/20 mt-1 tabular-nums font-mono">
                    {item.num}
                  </span>
                  <div>
                    <p className="text-xs text-white/70 mb-1 tracking-wider font-display">
                      {item.title}
                    </p>
                    <p className="text-xs text-white/35 leading-relaxed font-mono">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="relative py-20 px-6 md:px-16 text-center">
        <p className="text-[clamp(1rem,3vw,1.6rem)] text-white/35 italic font-mono leading-[1.8]">
          "Black Culture, Art & Transcendence doesn’t announce itself...
          it’s already in the room."
        </p>
      </div>

      {/* IMAGE FIXED */}
      <img
        src="/ninthlifeticket.png"
        alt="ninth life ticket"
        width={180}
        height={180}
        className="mx-auto mb-10 opacity-80"
      />

      {/* WORK */}
      <section className="border-t border-white/6 bg-[#0d0d0d]">
        <div className="px-6 md:px-16 py-20 max-w-5xl mx-auto">
          <p className="text-[7px] tracking-[0.8em] uppercase text-white/18 mb-12 font-mono">
            — The work
          </p>

          <div className="grid md:grid-cols-3 gap-1">
            {[
              {
                label: "Archive Records",
                slug: "/blackcatarchive/shop",
                desc: "Limited drops. Numbered units. Each release is a file within the system.",
                cta: "Browse Archive →",
              },
              {
                label: "Archive TV",
                slug: "/blackcatarchive/archive-tv",
                desc: "Raw documentation of process. Where things are formed before they are understood.",
                cta: "Watch →",
              },
              {
                label: "Manuscripts",
                slug: "/blackcatarchive/blog",
                desc: "Long-form records. Cultural thought, process, and philosophy preserved.",
                cta: "Read →",
              },
            ].map((p) => (
              <div
                key={p.label}
                className="border border-white/6 p-8 flex flex-col justify-between hover:border-white/14 transition"
              >
                <div>
                  <h3 className="text-2xl text-white mb-4 font-display">
                    {p.label}
                  </h3>
                  <p className="text-xs text-white/35 font-mono">
                    {p.desc}
                  </p>
                </div>

                <Link
                  href={p.slug}
                  className="text-[9px] tracking-[0.4em] uppercase text-white/30 hover:text-white font-mono"
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}