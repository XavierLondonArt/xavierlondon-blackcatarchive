// sanity/schemas/series.ts

export const series = {
  name: "series",
  title: "Art Series",
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Series Title",
      description: "e.g. 'Archive Studies', 'Meridian', 'Quiet Weight'",
      validation: (R: any) => R.required(),
    },
    {
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title" },
      validation: (R: any) => R.required(),
    },
    {
      name: "year",
      type: "string",
      title: "Year / Period",
      description: "e.g. '2024' or '2023 – 2024'",
    },
    {
      name: "description",
      type: "array",
      title: "Series Description",
      description: "2–4 paragraphs. What drives this body of work?",
      of: [{ type: "block" }],
    },
    {
      name: "shortDescription",
      type: "text",
      title: "Short Description",
      rows: 2,
      description: "One sentence shown on the Collections overview card.",
    },
    {
      name: "coverImage",
      type: "image",
      title: "Cover Image",
      description: "Hero image shown on the Collections page.",
      options: { hotspot: true },
    },
    // NOTE: The authoritative relationship is product → series (via the
    // "series" reference field on each product). Assign pieces FROM the
    // product document, not here. This field is editorial-only reference.
    {
      name: "pieces",
      type: "array",
      title: "Pieces in this Series (reference only)",
      description:
        "Optional — for your own reference in Studio. Assign the series from each product's Series field instead. The Collections page uses that direction.",
      of: [{
        type: "reference",
        to: [{ type: "product" }],
        options: {
          // Fixed: was "xavier london art" — actual brand value is "xavier"
          filter: 'brand == "xavier" && category in ["art", "reproduction"]',
        },
      }],
    },
    {
      name: "featured",
      type: "boolean",
      title: "Feature on Collections page",
      initialValue: false,
    },
    {
      name: "order",
      type: "number",
      title: "Display Order",
      description: "Lower numbers appear first.",
    },
  ],

  preview: {
    select: {
      title: "title",
      year:  "year",
      media: "coverImage",
    },
    prepare({ title, year, media }: any) {
      return { title, subtitle: year ?? "", media };
    },
  },
};