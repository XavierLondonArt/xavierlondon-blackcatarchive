// app/(blackcat)/blackcatarchive/archive-tv/page.tsx

import { sanityClient, QUERIES } from "../../../lib/sanity";
import Link from "next/link";

function getYouTubeThumbnail(url: string) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
}

function getYouTubeId(url: string) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export const metadata = { title: "Archive TV" };
export const revalidate = 60;

export default async function ArchiveTVPage() {
  const episodes = await sanityClient.fetch(QUERIES.archiveTv).catch(() => []);

  // Group by season
  const seasons: Record<number, typeof episodes> = {};
  for (const ep of episodes) {
    const s = ep.season ?? 1;
    if (!seasons[s]) seasons[s] = [];
    seasons[s].push(ep);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4df]">

      {/* Header */}
      <div className="px-6 md:px-12 pt-20 pb-12 border-b border-white/8">
        <p className="text-[8px] tracking-[0.7em] uppercase text-white/25 mb-3"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          Video
        </p>
        <h1 className="text-[clamp(3rem,8vw,6rem)] text-white leading-none"
          style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
          Archive TV
        </h1>
        <p className="text-xs text-white/30 mt-4 max-w-md leading-relaxed"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          Culture. Process. Underground. New episodes drop without warning.
        </p>
      </div>

      {/* Empty state */}
      {episodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-center px-8">
          <p className="text-[clamp(3rem,10vw,6rem)] text-white/4 leading-none select-none mb-6"
            style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
            COMING SOON
          </p>
          <p className="text-[9px] tracking-[0.5em] uppercase text-white/20"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            Season 01 loading...
          </p>
        </div>
      )}

      {/* Seasons */}
      {Object.entries(seasons)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([season, eps]) => (
          <section key={season} className="px-6 md:px-12 py-16">

            <div className="flex items-center gap-4 mb-10">
              <p className="text-[9px] tracking-[0.6em] uppercase text-white/22"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                Season {String(season).padStart(2,"0")}
              </p>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
              {(eps as any[]).map((ep) => {
                const rawThumb = ep.thumbnail;
                // Sanity image objects come back as {} when field is set but no asset uploaded — guard against that
                const sanityThumbUrl = rawThumb?.asset?._ref
                  ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/production/${
                      rawThumb.asset._ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")
                    }?w=800&auto=format`
                  : null;
                const thumb: string | null = sanityThumbUrl
                  ?? (ep.youtubeUrl ? getYouTubeThumbnail(ep.youtubeUrl) : null);

                return (
                  <Link
                    key={ep._id}
                    href={`/blackcatarchive/archive-tv/${ep.slug?.current}`}
                    className="group relative overflow-hidden bg-[#111] aspect-video block"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={ep.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-400"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#111]" />
                    )}

                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)" }} />

                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border border-white/25 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                        <div className="w-0 h-0 ml-1"
                          style={{ borderTop:"5px solid transparent", borderBottom:"5px solid transparent", borderLeft:"9px solid rgba(255,255,255,0.8)" }} />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-[8px] tracking-widest text-white/30 mb-1"
                        style={{ fontFamily: "'Courier Prime',monospace" }}>
                        S{String(ep.season).padStart(2,"0")}E{String(ep.episode).padStart(2,"0")}
                      </p>
                      <h3 className="text-xl text-white leading-tight"
                        style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing:"0.03em" }}>
                        {ep.title}
                      </h3>
                      {ep.description && (
                        <p className="text-[10px] text-white/30 mt-1 line-clamp-2 leading-relaxed"
                          style={{ fontFamily: "'Courier Prime',monospace" }}>
                          {ep.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
    </div>
  );
}