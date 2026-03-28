// app/(blackcat)/blackcatarchive/archive-tv/[slug]/page.tsx

import { sanityClient, QUERIES } from "@/lib/sanity";
import Link from "next/link";

function getYouTubeId(url: string) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export const revalidate = 60;

export default async function EpisodePage({ params }: { params: { slug: string } }) {
  const ep = await sanityClient
    .fetch(QUERIES.episodeBySlug, { slug: params.slug })
    .catch(() => null);

  if (!ep) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/20 text-[10px] tracking-[0.5em] uppercase mb-4"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            Episode not found
          </p>
          <Link href="/blackcatarchive/archive-tv"
            className="text-[9px] tracking-[0.4em] uppercase text-white/30 hover:text-white transition-colors duration-200"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            ← Archive TV
          </Link>
        </div>
      </div>
    );
  }

  const ytId = ep.youtubeUrl ? getYouTubeId(ep.youtubeUrl) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4df]">

      {/* Back */}
      <div className="px-6 md:px-12 pt-10 pb-6">
        <Link href="/blackcatarchive/archive-tv"
          className="text-[9px] tracking-[0.4em] uppercase text-white/25 hover:text-white/60 transition-colors duration-200"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          ← Archive TV
        </Link>
      </div>

      {/* Video */}
      <div className="w-full bg-black">
        {ytId ? (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              title={ep.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video bg-[#111] flex items-center justify-center">
            <p className="text-white/20 text-[10px] tracking-[0.5em] uppercase"
              style={{ fontFamily: "'Courier Prime',monospace" }}>
              Video coming soon
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-6 md:px-12 py-12 max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[8px] tracking-[0.5em] uppercase text-white/25"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            S{String(ep.season).padStart(2,"0")}E{String(ep.episode).padStart(2,"0")}
          </span>
          {ep.publishedAt && (
            <>
              <span className="text-white/15 text-xs">·</span>
              <span className="text-[8px] tracking-[0.4em] uppercase text-white/20"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                {new Date(ep.publishedAt).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })}
              </span>
            </>
          )}
        </div>

        <h1 className="text-[clamp(2rem,6vw,4rem)] text-white leading-none mb-6"
          style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
          {ep.title}
        </h1>

        {ep.description && (
          <p className="text-sm text-white/40 leading-relaxed max-w-2xl"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            {ep.description}
          </p>
        )}

        {ep.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {ep.tags.map((tag: string) => (
              <span key={tag}
                className="text-[8px] tracking-[0.3em] uppercase px-3 py-1 border border-white/12 text-white/30"
                style={{ fontFamily: "'Courier Prime',monospace" }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}