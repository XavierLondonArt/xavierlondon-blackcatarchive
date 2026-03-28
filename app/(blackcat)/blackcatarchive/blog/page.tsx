// app/(blackcat)/blackcatarchive/blog/page.tsx

import { sanityClient, QUERIES, urlFor } from "../../../lib/sanity";
import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Manuscripts & Dispatches" };
export const revalidate = 60;

export default async function ManuscriptsPage() {
  const posts = await sanityClient.fetch(QUERIES.manuscripts).catch(() => []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4df]">

      {/* Header */}
      <div className="px-6 md:px-12 pt-20 pb-12 border-b border-white/8">
        <p className="text-[8px] tracking-[0.7em] uppercase text-white/25 mb-3"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          Writing
        </p>
        <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] text-white leading-none"
          style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
          Manuscripts<br />&amp; Dispatches
        </h1>
        <p className="text-xs text-white/30 mt-4 max-w-md leading-relaxed"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          Observations. Process. Culture. Signals from the underground.
        </p>
      </div>

      {/* Empty */}
      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-center px-8">
          <p className="text-[clamp(3rem,10vw,6rem)] text-white/4 leading-none select-none mb-6"
            style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
            FIRST DISPATCH COMING
          </p>
          <p className="text-[9px] tracking-[0.5em] uppercase text-white/18"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            Subscribe for updates
          </p>
        </div>
      )}

      {/* Posts grid */}
      {posts.length > 0 && (
        <div className="px-6 md:px-12 py-16">
          {/* Featured first post */}
          {posts[0] && (
            <Link href={`/blackcatarchive/blog/${posts[0].slug?.current}`}
              className="group grid grid-cols-1 md:grid-cols-2 gap-1 mb-1 block">
              <div className="relative aspect-[16/9] md:aspect-auto bg-[#111] overflow-hidden">
                {posts[0].coverImage ? (
                  <Image
                    src={urlFor(posts[0].coverImage).width(1200).url()}
                    alt={posts[0].title}
                    fill
                    className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#111]" />
                )}
              </div>
              <div className="bg-[#0f0f0f] p-8 md:p-12 flex flex-col justify-end border border-white/5">
                <p className="text-[8px] tracking-[0.5em] uppercase text-white/22 mb-4"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  {posts[0].publishedAt
                    ? new Date(posts[0].publishedAt).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })
                    : "Recent"}
                </p>
                <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] text-white leading-tight mb-4 group-hover:opacity-70 transition-opacity duration-300"
                  style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
                  {posts[0].title}
                </h2>
                {posts[0].excerpt && (
                  <p className="text-xs text-white/35 leading-relaxed line-clamp-3 mb-6"
                    style={{ fontFamily: "'Courier Prime',monospace" }}>
                    {posts[0].excerpt}
                  </p>
                )}
                <span className="text-[9px] tracking-[0.4em] uppercase text-white/30 group-hover:text-white transition-colors duration-200"
                  style={{ fontFamily: "'Courier Prime',monospace" }}>
                  Read →
                </span>
              </div>
            </Link>
          )}

          {/* Remaining posts */}
          {posts.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mt-1">
              {posts.slice(1).map((post: any) => (
                <Link key={post._id}
                  href={`/blackcatarchive/blog/${post.slug?.current}`}
                  className="group bg-[#0f0f0f] border border-white/5 hover:border-white/12 transition-colors duration-300 flex flex-col">

                  {post.coverImage && (
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#111]">
                      <Image
                        src={urlFor(post.coverImage).width(600).url()}
                        alt={post.title}
                        fill
                        className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-[8px] tracking-[0.4em] uppercase text-white/20 mb-3"
                      style={{ fontFamily: "'Courier Prime',monospace" }}>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })
                        : "Draft"}
                    </p>
                    <h3 className="text-xl text-white leading-snug mb-3 group-hover:opacity-60 transition-opacity duration-300"
                      style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing:"0.02em" }}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-[10px] text-white/30 leading-relaxed line-clamp-3 flex-1"
                        style={{ fontFamily: "'Courier Prime',monospace" }}>
                        {post.excerpt}
                      </p>
                    )}
                    <span className="text-[8px] tracking-[0.4em] uppercase text-white/22 mt-4 group-hover:text-white transition-colors duration-200"
                      style={{ fontFamily: "'Courier Prime',monospace" }}>
                      Read →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}