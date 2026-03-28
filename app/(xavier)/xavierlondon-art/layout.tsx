import { XavierVaultTrigger }   from "@/components/xavier/XavierVaultTrigger";
import { XavierCartProvider }   from "@/components/xavier/XavierCartContent";
import { XavierCartNavCount }   from "@/components/xavier/XavierCartNavCount";
import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: { template: "%s — Xavier London Art", default: "Xavier London Art" },
  description: "Fine art and considered clothing. A study in quiet luxury.",
};

export default function XavierLayout({ children }: { children: React.ReactNode }) {
  return (
    <XavierCartProvider>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap"
      />

      <div
        className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a]"
        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
      >
        {/* Grain */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.022]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "150px 150px",
          }}
        />

        {/* ── Navbar ── */}
        <header className="relative z-20 w-full">
          <div className="border-b border-[#1a1a1a]/8 py-2 text-center">
            <p className="text-[9px] tracking-[0.55em] uppercase text-[#1a1a1a]/30">
              New collection launching soon
            </p>
          </div>

          <nav className="relative flex items-center justify-between px-8 md:px-16 py-5 border-b border-[#1a1a1a]/10">

            <ul className="hidden md:flex items-center gap-10">
              <XavierNavLink href="/xavierlondon-art/shop">Collections</XavierNavLink>
              <XavierNavLink href="/xavierlondon-art/shop?category=art">Fine Art</XavierNavLink>
              <XavierNavLink href="/xavierlondon-art/shop?category=clothing">Wearables</XavierNavLink>
            </ul>

            <Link
              href="/xavierlondon-art"
              className="absolute left-1/2 -translate-x-1/2 text-center group select-none"
            >
              <span className="block text-[clamp(0.8rem,1.8vw,1rem)] font-light tracking-[0.45em] uppercase text-[#1a1a1a] transition-opacity duration-300 group-hover:opacity-50">
                Xavier London
              </span>
              <span className="block text-[7.5px] tracking-[0.7em] uppercase text-[#1a1a1a]/30 mt-0.5">
                Art &amp; Apparel
              </span>
            </Link>

            <ul className="flex items-center gap-8 ml-auto">
              <XavierNavLink href="/xavierlondon-art/journals">Journal</XavierNavLink>
              <XavierNavLink href="/xavierlondon-art/about">About</XavierNavLink>
              <XavierCartNavCount />
              <li><XavierVaultTrigger/></li>
            </ul>

          </nav>
        </header>

        <main className="relative z-10">{children}</main>

        {/* ── Footer ── */}
        <footer className="relative z-10 border-t border-[#1a1a1a]/10 mt-32 px-8 md:px-16 py-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">

            <div>
              <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/35 mb-5">Navigate</p>
              <ul className="space-y-2.5">
                {["Collections","Fine Art","Wearables","Journal","About"].map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-sm font-light text-[#1a1a1a]/45 hover:text-[#1a1a1a] transition-colors duration-300 tracking-wide">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/35 mb-5">Info</p>
              <ul className="space-y-2.5">
                {["Shipping & Returns","Size Guide","Care Instructions","Press"].map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-sm font-light text-[#1a1a1a]/45 hover:text-[#1a1a1a] transition-colors duration-300 tracking-wide">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/35 mb-5">Stay in touch</p>
              <p className="text-sm font-light text-[#1a1a1a]/40 leading-relaxed mb-5 tracking-wide">
                Dispatches from the studio. New works, limited editions, quiet observations.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-transparent border border-[#1a1a1a]/18 px-4 py-2.5 text-sm font-light tracking-wide placeholder:text-[#1a1a1a]/22 focus:outline-none focus:border-[#1a1a1a]/45 transition-colors duration-300"
                />
                <button
                  type="submit"
                  className="border border-l-0 border-[#1a1a1a]/18 px-5 py-2.5 text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/50 hover:bg-[#1a1a1a] hover:text-[#f7f4ef] hover:border-[#1a1a1a] transition-all duration-300"
                >
                  Join
                </button>
              </form>
            </div>

          </div>

          <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-[#1a1a1a]/8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/22">
              © {new Date().getFullYear()} Xavier London Art. All rights reserved.
            </p>
            <Link href="/" className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/22 hover:text-[#1a1a1a]/50 transition-colors duration-300">
              ← Back to index
            </Link>
          </div>
        </footer>

      </div>
    </XavierCartProvider>
  );
}

function XavierNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="relative text-[9.5px] tracking-[0.4em] uppercase text-[#1a1a1a]/45 hover:text-[#1a1a1a] transition-colors duration-300 group"
      >
        {children}
        <span className="absolute -bottom-px left-0 w-0 h-px bg-[#1a1a1a]/35 transition-all duration-300 group-hover:w-full" />
      </Link>
    </li>
  );
}