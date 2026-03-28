// sanity/schemaTypes/product.ts

export const product = {
  name: "product",
  title: "Product",
  type: "document",
  groups: [
    { name: "core",      title: "Core Info"       },
    { name: "media",     title: "Images"          },
    { name: "pricing",   title: "Pricing & Stock" },
    { name: "specs",     title: "Specs & Sizing"  },
    { name: "display",   title: "Display Options" },
  ],
  fields: [

    // ── Core ──────────────────────────────────────────────────────────────
    {
      name: "title",
      type: "string",
      title: "Product Name",
      group: "core",
      validation: (R: any) => R.required(),
    },
    {
      name: "slug",
      type: "slug",
      title: "Slug",
      group: "core",
      options: { source: "title" },
      validation: (R: any) => R.required(),
    },
    {
      name: "brand",
      type: "string",
      title: "Brand",
      group: "core",
      options: {
        list: [
          { title: "Black Cat Archive", value: "blackcat" },
          { title: "Xavier London Art", value: "xavier"   },
        ],
      },
      validation: (R: any) => R.required(),
    },
    {
      name: "category",
      type: "string",
      title: "Category",
      group: "core",
      description: "Pick the closest group. Use Archival for 1-of-1 inquiry-only pieces.",
      options: {
        list: [
          { title: "Apparel — T-shirts, hoodies, clothing",           value: "apparel"      },
          { title: "Accessories — Jewelry, keychains, wearables",     value: "accessories"  },
          { title: "Collectibles — Cards, stickers, comics, zines",   value: "collectibles" },
          { title: "Art & Objects — Prints, sculptures, flags",       value: "art"          },
          { title: "Archival — 1-of-1 unique pieces (inquiry only)",  value: "archival"     },
        ],
        layout: "radio",
      },
      validation: (R: any) => R.required(),
    },
    {
      name: "description",
      type: "array",
      title: "Description",
      group: "core",
      description: "Full product description shown on the product page and in the sealed archive modal.",
      of: [{ type: "block" }],
    },
    {
      name: "shortDescription",
      type: "text",
      title: "Short Description",
      group: "core",
      rows: 2,
      description: "One or two lines shown on cards and the archive catalog. Keep it punchy.",
    },

    // ── Media ─────────────────────────────────────────────────────────────
    {
      name: "images",
      type: "array",
      title: "Images",
      group: "media",
      description: "Upload front first, then back, then detail shots.",
      of: [{
        type: "image",
        options: { hotspot: true },
        fields: [{
          name: "caption",
          type: "string",
          title: "Caption (e.g. Front, Back, Detail)",
        }],
      }],
    },

    // ── Pricing & Stock ───────────────────────────────────────────────────
    {
      name: "price",
      type: "number",
      title: "Price (USD)",
      group: "pricing",
    },
    {
      name: "stripePriceId",
      type: "string",
      title: "Stripe Price ID",
      group: "pricing",
      description: "From Stripe Dashboard → Products → Price ID (starts with price_...)",
    },
    {
      name: "inventory",
      type: "number",
      title: "Stock Count",
      group: "pricing",
      description: "Set to 0 to seal this item. Sealed items appear in the archive catalog with a modal.",
    },

    // ── Specs & Sizing ────────────────────────────────────────────────────
    {
      name: "hasApparel",
      type: "boolean",
      title: "Has Size Variants (apparel)",
      group: "specs",
      description: "Turn on for any clothing item.",
      initialValue: false,
    },

    // Size chart — fully editable per product
    // Each row is one size with its own measurements
    {
      name: "sizeChart",
      type: "object",
      title: "Size Chart",
      group: "specs",
      hidden: ({ document }: any) => !document?.hasApparel,
      description: "Define column headers and one row per size. Customers see this on the product page.",
      fields: [
        {
          name: "columns",
          type: "array",
          title: "Column Headers",
          description: 'e.g. ["Size", "Chest (in)", "Length (in)", "Sleeve (in)"]',
          of: [{ type: "string" }],
          options: { layout: "tags" },
        },
        {
          name: "rows",
          type: "array",
          title: "Size Rows",
          of: [{
            type: "object",
            name: "sizeRow",
            title: "Size",
            fields: [
              {
                name: "size",
                type: "string",
                title: "Size Label",
                description: "e.g. S, M, L, XL, One Size",
              },
              {
                name: "measurements",
                type: "array",
                title: "Measurements",
                description: "One value per column header (in the same order)",
                of: [{ type: "string" }],
              },
            ],
            preview: {
              select: { title: "size", subtitle: "measurements" },
              prepare({ title, subtitle }: any) {
                return {
                  title,
                  subtitle: Array.isArray(subtitle) ? subtitle.join(" / ") : "",
                };
              },
            },
          }],
        },
        {
          name: "note",
          type: "string",
          title: "Size Chart Note",
          description: 'e.g. "When between sizes, size up." or "Measurements are in inches."',
        },
      ],
    },

    // Available sizes checkboxes
    {
      name: "availableSizes",
      type: "array",
      title: "Available Sizes",
      group: "specs",
      description: "Check all sizes currently in stock.",
      of: [{ type: "string" }],
      options: {
        list: ["XXS","XS","S","M","L","XL","XXL","3XL","One Size"],
        layout: "grid",
      },
      hidden: ({ document }: any) => !document?.hasApparel,
    },

    // Physical dimensions for non-apparel items
    {
      name: "physicalSpecs",
      type: "object",
      title: "Product Specifications",
      group: "specs",
      description: "Add spec lines for any product — material, fit, construction details, etc. Shown as a click-to-open accordion on the product page.",
      fields: [
        {
          name: "specRows",
          type: "array",
          title: "Spec Lines",
          description: 'Each line is a label/value pair. e.g. label: "Material", value: "300 GSM heavyweight cotton" or label: "Dimensions", value: "12 × 18 in"',
          of: [{
            type: "object",
            name: "specRow",
            title: "Spec",
            fields: [
              {
                name: "label",
                type: "string",
                title: "Label",
                description: 'e.g. "Dimensions", "Material", "Edition", "Weight"',
              },
              {
                name: "value",
                type: "string",
                title: "Value",
                description: 'e.g. "12 × 18 in", "220 GSM matte", "1 of 1"',
              },
            ],
            preview: {
              select: { title: "label", subtitle: "value" },
            },
          }],
        },
      ],
    },

    // ── Display Options ───────────────────────────────────────────────────
    {
      name: "isOneOfOne",
      type: "boolean",
      title: "1-of-1 (Inquiry Only)",
      group: "display",
      description: "Shows an inquiry form instead of Add to Cart. Always true for Archival category.",
      initialValue: false,
    },
    {
      name: "isArchiveDrop",
      type: "boolean",
      title: "Archive Drop Card",
      group: "display",
      description: "Shows this product as a lore-driven Archive File card at the top of the shop.",
      initialValue: false,
    },
    {
      name: "featured",
      type: "boolean",
      title: "Featured on Homepage",
      group: "display",
      description: "Appears in the hero and Archive Records grid on the Black Cat home page.",
      initialValue: false,
    },
    {
      name: "archiveFileNumber",
      type: "string",
      title: "Archive File Number",
      group: "display",
      description: 'For Archive Drop Cards only. e.g. "00", "01". Shown as FILE 00.',
    },
    {
      name: "hoverLore",
      type: "text",
      title: "Hover Lore (Archive Card)",
      group: "display",
      rows: 3,
      description: "Short atmospheric text shown when hovering the archive card on the shop page. 1-3 lines.",
    },
    {
      name: "heroLore",
      type: "text",
      title: "Hero Lore (Product Page)",
      group: "display",
      rows: 4,
      description: "The atmospheric lore shown in the large hero section at the top of the product page.",
    },
    {
      name: "archiveContext",
      type: "array",
      title: "Archive Context (paragraphs)",
      group: "display",
      description: "Each item is one paragraph in the Context section below the purchase panel. Add 2–4 paragraphs.",
      of: [{ type: "text", rows: 3 }],
    },
    {
      name: "constructionSpecs",
      type: "array",
      title: "Construction Details (numbered list)",
      group: "display",
      description: "Numbered bullet points shown in the Construction column. e.g. '300 GSM heavyweight cotton'",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    },
    {
      name: "closingLine",
      type: "text",
      title: "Closing Line (italic)",
      group: "display",
      rows: 2,
      description: "The italic closing thought shown before the stamp. e.g. 'Some pieces are made to be worn.\nOthers hold their place in the archive.'",
    },
    {
      name: "closingStamp",
      type: "string",
      title: "Closing Stamp",
      group: "display",
      description: "The final bold statement. e.g. 'Every Good Archive Needs a Loyal Watch Dog.'",
    },
    {
      name: "unitRange",
      type: "string",
      title: "Unit Range",
      group: "display",
      description: 'e.g. "00/50". Unit 00 is always held in the archive.',
    },
  ],

  preview: {
    select: {
      title:    "title",
      category: "category",
      brand:    "brand",
      media:    "images.0",
    },
    prepare({ title, category, brand, media }: any) {
      const CAT: Record<string, string> = {
        apparel:      "Apparel",
        accessories:  "Accessories",
        collectibles: "Collectibles",
        art:          "Art & Objects",
        archival:     "Archival",
      };
      const BRAND: Record<string, string> = {
        blackcat: "BCA",
        xavier:   "XLA",
      };
      return {
        title,
        subtitle: [BRAND[brand] ?? brand, CAT[category] ?? category].filter(Boolean).join(" · "),
        media,
      };
    },
  },
};