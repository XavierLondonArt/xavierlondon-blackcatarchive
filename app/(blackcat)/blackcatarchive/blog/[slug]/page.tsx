// app/(blackcat)/blackcatarchive/blog/[slug]/page.tsx

import { sanityClient, QUERIES, urlFor } from "../../../../lib/sanity";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60;

const ptComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="mb-6 text-sm leading-[1.9] text-white/60"
        style={{ fontFamily: "'Courier Prime',monospace" }}>
        {children}
      </p>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl text-white mt-12 mb-4"
        style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing:"0.03em" }}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg text-white/80 mt-8 mb-3 tracking-wide"
        style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
        {children}
      </h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l border-white/20 pl-6 my-8 text-sm italic text-white/40 leading-relaxed"
        style={{ fontFamily: "'Courier Prime',monospace" }}>
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="text-white/90 font-bold">{children}</strong>,
    em:     ({ children }: any) => <em className="text-white/70 italic">{children}</em>,
    link:   ({ value, children }: any) => (
      <a href={value?.href} target="_blank" rel="noreferrer"
        className="text-white/70 underline hover:text-white transition-colors duration-200">
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: any) => (
      <figure className="my-10">
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#111]">
          <Image
            src={urlFor(value).width(1200).url()}
            alt={value.caption ?? ""}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
        {value.caption && (
          <figcaption className="text-[9px] tracking-[0.3em] uppercase text-white/25 mt-3 text-center"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
};

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await sanityClient
    .fetch(QUERIES.manuscriptBySlug, { slug: params.slug })
    .catch(() => null);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/20 text-[10px] tracking-[0.5em] uppercase mb-4"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            Dispatch not found
          </p>
          <Link href="/blackcatarchive/blog"
            className="text-[9px] tracking-[0.4em] uppercase text-white/30 hover:text-white transition-colors"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            ← All dispatches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4df]">

      {/* Cover */}
      {post.coverImage && (
        <div className="relative w-full aspect-[21/9] overflow-hidden bg-[#111]">
          <Image
            src={urlFor(post.coverImage).width(1600).url()}
            alt={post.title}
            fill
            className="object-cover opacity-60"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0"
            style={{ background:"linear-gradient(to bottom, transparent 40%, rgba(10,10,10,1) 100%)" }} />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 md:px-8 py-16">

        {/* Back */}
        <Link href="/blackcatarchive/blog"
          className="text-[8px] tracking-[0.5em] uppercase text-white/20 hover:text-white/50 transition-colors duration-200 block mb-12"
          style={{ fontFamily: "'Courier Prime',monospace" }}>
          ← Manuscripts &amp; Dispatches
        </Link>

        {/* Meta */}
        {post.publishedAt && (
          <p className="text-[8px] tracking-[0.5em] uppercase text-white/22 mb-4"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            {new Date(post.publishedAt).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })}
          </p>
        )}

        <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] text-white leading-none mb-8"
          style={{ fontFamily: "'Bebas Neue',sans-serif" }}>
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-sm text-white/40 leading-relaxed mb-10 pb-10 border-b border-white/8"
            style={{ fontFamily: "'Courier Prime',monospace" }}>
            {post.excerpt}
          </p>
        )}

        {/* Body */}
        {post.body && <PortableText value={post.body} components={ptComponents} />}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-white/8">
            {post.tags.map((tag: string) => (
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