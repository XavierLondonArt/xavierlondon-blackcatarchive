import { BlackCatVaultTrigger } from "@/components/blackcat/BlackCatVaultTrigger";
import { CartProvider }         from "@/components/blackcat/CartContent";
import { CartNavCount }         from "@/components/blackcat/CartNavCount";
import type { Metadata }        from "next";
import Link                     from "next/link";

export const metadata: Metadata = {
  title: { template: "%s | BLACK CAT ARCHIVE", default: "BLACK CAT ARCHIVE" },
  description: "Culture. Art. Transcendance. ARCHIVE. Est. from the underground.",
};

export default function BlackCatLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap"
      />

      <div
        className="min-h-screen bg-[#0a0a0a] text-[#e8e4df]"
        style={{ fontFamily: "'Courier Prime','Courier New',monospace" }}
      >
        {/* Heavy grain */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.055]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "120px 120px",
          }}
        />
        {/* Scan lines */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.04) 2px,rgba(255,255,255,0.04) 4px)",
          }}
        />

        {/* ── Navbar ── */}
        <header className="relative z-20 w-full border-b border-white/10">
          <nav className="flex items-center justify-between px-6 md:px-12 py-4">

            <Link href="/blackcatarchive" className="group flex flex-col leading-none select-none">
              <span className="text-[7px] tracking-[0.7em] uppercase text-white/25 -mt-0.5">
                THE
              </span>
              <span
                className="text-[clamp(1.4rem,3.5vw,2rem)] text-white tracking-[0.04em] group-hover:opacity-60 transition-opacity duration-200"
                style={{ fontFamily: "'Bebas Neue',sans-serif" }}
              >
                BLACK CAT
              </span>
              <span className="text-[7px] tracking-[0.7em] uppercase text-white/25 -mt-0.5">
                Archive
              </span>
            </Link>

            <ul className="hidden md:flex items-center gap-8">
              <BCNavLink href="/blackcatarchive/archive-tv">Archive TV</BCNavLink>
              <BCNavLink href="/blackcatarchive/blog">Manuscripts &amp; Dispatches</BCNavLink>
              <BCNavLink href="/blackcatarchive/shop">Purchase</BCNavLink>
              <BCNavLink href="/blackcatarchive/drops">Archive Records</BCNavLink>
              <BCNavLink href="/blackcatarchive/about">About</BCNavLink>
            </ul>

            <div className="flex items-center gap-5">
              <CartNavCount />
              <BlackCatVaultTrigger />
              <button aria-label="Menu" className="md:hidden flex flex-col gap-1.5 ml-2">
                <span className="block w-6 h-px bg-white/50" />
                <span className="block w-4 h-px bg-white/50" />
                <span className="block w-6 h-px bg-white/50" />
              </button>
            </div>

          </nav>
        </header>

        {/* Ticker */}
        <div className="relative z-20 overflow-hidden bg-white text-black py-1.5 border-b border-white/10">
          <div className="flex whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
            {Array(4).fill(null).map((_, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-5 px-5"
                style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "0.68rem", letterSpacing: "0.15em" }}
              >
                NEW DROP INCOMING
                <span className="inline-block w-1 h-1 bg-black rounded-full" />
                ARCHIVE TV PREMIERE
                <span className="inline-block w-1 h-1 bg-black rounded-full" />
                LIMITED UNITS
                <span className="inline-block w-1 h-1 bg-black rounded-full" />
                SUBSCRIBE FOR UPDATES
                <span className="inline-block w-1 h-1 bg-black rounded-full" />
              </span>
            ))}
          </div>
        </div>

        <main className="relative z-10">{children}</main>

        {/* ── Footer ── */}
        <footer className="relative z-10 mt-32 border-t border-white/10">
          <div className="px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

            <div className="md:col-span-2">
              <p
                className="text-[clamp(2.5rem,6vw,4rem)] text-white/8 leading-none mb-6 select-none"
                style={{ fontFamily: "'Bebas Neue',sans-serif" }}
              >
                THE<br />BLACK CAT<br />ARCHIVE
              </p>
              <p className="text-xs text-white/30 leading-relaxed max-w-xs">
                Culture. Art. Transcendance. ARCHIVE.<br />
                Est. from the underground.
              </p>
            </div>

            <div>
              <p className="text-[9px] tracking-[0.5em] uppercase text-white/22 mb-5">Navigate</p>
              <ul className="space-y-3">
                {[
                  ["Archive TV",              "/blackcatarchive/archive-tv"],
                  ["Manuscripts & Dispatches","/blackcatarchive/blog"],
                  ["Purchase",                "/blackcatarchive/shop"],
                  ["Archive Records",         "/blackcatarchive/drops"],
                  ["About",                   "/blackcatarchive/about"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-xs tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[9px] tracking-[0.5em] uppercase text-white/22 mb-5">Stay notified</p>
              <p className="text-xs text-white/30 leading-relaxed mb-5">Drop alerts. Archive TV. Nothing else.</p>
              <form className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="email"
                  className="bg-transparent border border-white/12 px-3 py-2.5 text-xs tracking-wider text-white placeholder:text-white/18 focus:outline-none focus:border-white/35 transition-colors duration-200"
                />
                <button
                  type="submit"
                  className="border border-white/18 py-2.5 text-[10px] tracking-[0.4em] uppercase text-white/50 hover:bg-white hover:text-black hover:border-white transition-all duration-200"
                >
                  Subscribe
                </button>
              </form>
            </div>

          </div>

          <div className="px-6 md:px-12 py-5 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[9px] tracking-[0.4em] uppercase text-white/18">
              © {new Date().getFullYear()} Black Cat Archive
            </p>
            <Link href="/" className="text-[9px] tracking-[0.4em] uppercase text-white/18 hover:text-white/45 transition-colors duration-200">
              ← Index
            </Link>
          </div>
        </footer>

      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </CartProvider>
  );
}

function BCNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-[10px] tracking-[0.35em] uppercase text-white/35 hover:text-white transition-colors duration-200 relative group"
      >
        {children}
        <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white transition-all duration-200 group-hover:w-full" />
      </Link>
    </li>
  );
}