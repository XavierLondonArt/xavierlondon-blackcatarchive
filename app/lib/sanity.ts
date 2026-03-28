// lib/sanity.ts
import { createClient } from "next-sanity";
import imageUrlBuilder  from "@sanity/image-url";

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   "production",
  apiVersion: "2024-01-01",
  useCdn:    process.env.NODE_ENV === "production",
});

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (source: any) => builder.image(source);

// ── GROQ queries ─────────────────────────────────────────────────────────────

export const QUERIES = {

  // All BCA products (shop page)
  bcaProducts: `
    *[_type == "product" && brand == "blackcat"] | order(_createdAt desc) {
      _id, title, slug, category, price, images, inventory,
      isOneOfOne, hasApparel, availableSizes, dimensions, featured
    }
  `,

  // Single product by slug
  productBySlug: `
    *[_type == "product" && slug.current == $slug][0] {
      _id, title, slug, category, price, stripePriceId, images, inventory,
      description, isOneOfOne, hasApparel, availableSizes, dimensions, brand
    }
  `,

  // BCA drops
  bcaDrops: `
    *[_type == "drop" && brand == "blackcat"] | order(dropTime desc) {
      _id, title, slug, dropTime, coverImage, teaser, totalUnits,
      isLive, soldOut,
      products[]-> { _id, title, slug, price, images, inventory }
    }
  `,

  // Archive TV episodes
  archiveTv: `
    *[_type == "archiveTv"] | order(season asc, episode asc) {
      _id, title, slug, season, episode, youtubeUrl, thumbnail, description,
      publishedAt, tags
    }
  `,

  // Single episode
  episodeBySlug: `
    *[_type == "archiveTv" && slug.current == $slug][0] {
      _id, title, slug, season, episode, youtubeUrl, thumbnail, description,
      publishedAt, tags
    }
  `,

  // Manuscripts & Dispatches
  manuscripts: `
    *[_type == "manuscript" && brand == "blackcat"] | order(publishedAt desc) {
      _id, title, slug, coverImage, excerpt, publishedAt, tags
    }
  `,

  // Single post
  manuscriptBySlug: `
    *[_type == "manuscript" && slug.current == $slug][0] {
      _id, title, slug, coverImage, excerpt, body, publishedAt, tags
    }
  `,
};
// ── Xavier London Art queries (appended) ───────────────────────────────────

export const XAVIER_QUERIES = {

  xavierProducts: `
    *[_type == "product" && brand == "xavier"] | order(featured desc, _createdAt desc) {
      _id, title, slug, category, price, images, inventory,
      isOneOfOne, hasApparel, availableSizes, featured, shortDescription
    }
  `,

  xavierProductBySlug: `
    *[_type == "product" && slug.current == $slug && brand == "xavier"][0] {
      _id, title, slug, category, price, stripePriceId, images, inventory,
      description, shortDescription, isOneOfOne, hasApparel, availableSizes,
      sizeChart, physicalSpecs, featured
    }
  `,

  xavierJournals: `
    *[_type == "manuscript" && brand == "xavier"] | order(publishedAt desc) {
      _id, title, slug, coverImage, excerpt, publishedAt, tags
    }
  `,

  xavierJournalBySlug: `
    *[_type == "manuscript" && slug.current == $slug && brand == "xavier"][0] {
      _id, title, slug, coverImage, excerpt, body, publishedAt, tags
    }
  `,
};
