// app/(xavier)/xavierlondon-art/journals/page.tsx

import { sanityClient, XAVIER_QUERIES, urlFor } from "../../../lib/sanity";
import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Journal — Xavier London Art" };
export const revalidate = 60;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default async function JournalsPage() {
  const posts = await sanityClient.fetch(XAVIER_QUERIES.xavierJournals).catch(() => []);

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a]">

      {/* Header */}
      <div className="max-w-6xl mx-auto px-8 md:px-16 pt-20 pb-14 border-b border-[#1a1a1a]/8">
        <p className="text-[9px] tracking-[0.6em] uppercase text-[#1a1a1a]/30 mb-3"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Writing
        </p>
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light text-[#1a1a1a] leading-none"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Journal
        </h1>
        <p className="text-sm font-light text-[#1a1a1a]/40 mt-4 max-w-md leading-relaxed"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          Notes from the studio. On process, material, and the spaces between.
        </p>
      </div>

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-48 text-center px-8">
          <p className="text-[clamp(1.5rem,4vw,2.5rem)] font-light text-[#1a1a1a]/12 leading-none mb-6"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            First entry arriving soon.
          </p>
          <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/22">
            Subscribe in the footer to be notified
          </p>
        </div>
      )}

      {/* Post list */}
      {posts.length > 0 && (
        <div className="max-w-6xl mx-auto px-8 md:px-16">

          {/* Featured first post */}
          {posts[0] && (
            <Link href={`/xavierlondon-art/journals/${posts[0].slug?.current}`}
              className="group grid grid-cols-1 md:grid-cols-5 gap-1 border-b border-[#1a1a1a]/8 py-12">
              {posts[0].coverImage && (
                <div className="md:col-span-2 relative aspect-[16/9] md:aspect-auto bg-[#ede9e2] overflow-hidden">
                  <Image
                    src={urlFor(posts[0].coverImage).width(900).url()}
                    alt={posts[0].title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-95 group-hover:scale-[1.03] transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </div>
              )}
              <div className={`${posts[0].coverImage ? "md:col-span-3" : "md:col-span-5"} flex flex-col justify-center md:px-10`}>
                <p className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 mb-5"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  {posts[0].publishedAt ? formatDate(posts[0].publishedAt) : "—"}
                </p>
                <h2 className="text-[clamp(1.4rem,3vw,2.2rem)] font-light text-[#1a1a1a] leading-snug mb-5 group-hover:opacity-60 transition-opacity duration-300"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  {posts[0].title}
                </h2>
                {posts[0].excerpt && (
                  <p className="text-sm font-light text-[#1a1a1a]/45 leading-relaxed line-clamp-3 mb-6"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    {posts[0].excerpt}
                  </p>
                )}
                <span className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/35 group-hover:text-[#1a1a1a] transition-colors duration-300">
                  Read →
                </span>
              </div>
            </Link>
          )}

          {/* Remaining posts */}
          {posts.slice(1).map((post: any) => (
            <Link key={post._id} href={`/xavierlondon-art/journals/${post.slug?.current}`}
              className="group grid grid-cols-1 md:grid-cols-4 gap-6 py-8 border-b border-[#1a1a1a]/6 hover:bg-[#f0ece4] transition-colors duration-300 px-0 md:-mx-2 md:px-2">
              {post.coverImage && (
                <div className="relative aspect-[3/2] bg-[#ede9e2] overflow-hidden">
                  <Image
                    src={urlFor(post.coverImage).width(400).url()}
                    alt={post.title}
                    fill
                    className="object-cover opacity-75 group-hover:opacity-90 transition-opacity duration-500"
                    sizes="200px"
                  />
                </div>
              )}
              <div className={`${post.coverImage ? "md:col-span-3" : "md:col-span-4"} flex flex-col justify-center`}>
                <p className="text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/28 mb-3"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                </p>
                <h3 className="text-xl font-light text-[#1a1a1a] leading-snug mb-3 group-hover:opacity-55 transition-opacity duration-300"
                  style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm font-light text-[#1a1a1a]/40 leading-relaxed line-clamp-2"
                    style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}

        </div>
      )}

      <div className="pb-32" />
    </div>
  );
}
