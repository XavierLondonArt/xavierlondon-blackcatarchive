// app/(xavier)/xavierlondon-art/journals/[slug]/page.tsx

import { sanityClient, XAVIER_QUERIES, urlFor } from "../../../../lib/sanity";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export const revalidate = 60;

const ptComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="mb-6 text-base font-light text-[#1a1a1a]/60 leading-[1.9]"
        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
        {children}
      </p>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-light text-[#1a1a1a] mt-12 mb-5 leading-snug"
        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-light text-[#1a1a1a]/80 mt-8 mb-4"
        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
        {children}
      </h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l border-[#1a1a1a]/15 pl-6 my-10 text-lg italic text-[#1a1a1a]/45 leading-relaxed"
        style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="text-[#1a1a1a]/80 font-medium">{children}</strong>,
    em:     ({ children }: any) => <em className="italic text-[#1a1a1a]/60">{children}</em>,
    link:   ({ value, children }: any) => (
      <a href={value?.href} target="_blank" rel="noreferrer"
        className="text-[#1a1a1a]/60 underline underline-offset-2 hover:text-[#1a1a1a] transition-colors duration-200">
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: any) => (
      <figure className="my-12 -mx-8 md:-mx-0">
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#ede9e2]">
          <Image
            src={urlFor(value).width(1400).url()}
            alt={value.caption ?? ""}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 860px"
          />
        </div>
        {value.caption && (
          <figcaption className="text-[9px] tracking-[0.3em] uppercase text-[#1a1a1a]/28 mt-3 text-center"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
};

// Next.js 15: params is a Promise — must be awaited
export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await sanityClient
    .fetch(XAVIER_QUERIES.xavierJournalBySlug, { slug })
    .catch(() => null);

  if (!post) notFound();

  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1a1a1a]">

      <div className="max-w-3xl mx-auto px-8 md:px-16 pt-20 pb-12">
        <nav className="flex items-center gap-3 text-[8px] tracking-[0.4em] uppercase text-[#1a1a1a]/28 mb-12">
          <Link href="/xavierlondon-art/journals"
            className="hover:text-[#1a1a1a] transition-colors duration-200">
            Journal
          </Link>
          <span>/</span>
          <span className="text-[#1a1a1a]/40 truncate max-w-[200px]">{post.title}</span>
        </nav>

        {dateStr && (
          <p className="text-[9px] tracking-[0.5em] uppercase text-[#1a1a1a]/28 mb-6"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            {dateStr}
          </p>
        )}

        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-light text-[#1a1a1a] leading-[1.1] mb-8"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg font-light text-[#1a1a1a]/50 leading-relaxed italic mb-10"
            style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
            {post.excerpt}
          </p>
        )}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {post.tags.map((tag: string) => (
              <span key={tag}
                className="text-[7px] tracking-[0.35em] uppercase text-[#1a1a1a]/30 border border-[#1a1a1a]/12 px-3 py-1"
                style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {post.coverImage && (
          <div className="relative w-full aspect-[16/9] bg-[#ede9e2] overflow-hidden mb-14">
            <Image
              src={urlFor(post.coverImage).width(1400).url()}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 860px"
            />
          </div>
        )}

        <div className="h-px w-16 bg-[#1a1a1a]/15 mb-14" />
      </div>

      {post.body && (
        <article className="max-w-3xl mx-auto px-8 md:px-16 pb-20">
          <PortableText value={post.body} components={ptComponents} />
        </article>
      )}

      <div className="max-w-3xl mx-auto px-8 md:px-16 py-12 border-t border-[#1a1a1a]/8">
        <Link href="/xavierlondon-art/journals"
          className="text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors duration-300">
          ← All journal entries
        </Link>
      </div>
    </div>
  );
}
