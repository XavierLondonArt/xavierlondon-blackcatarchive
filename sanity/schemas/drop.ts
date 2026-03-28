// sanity/schemas/drop.ts

export const drop = {
  name: "drop",
  title: "Drop",
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Drop Name",
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
      name: "brand",
      type: "string",
      title: "Brand",
      options: { list: [
        { title: "Black Cat Archive", value: "blackcat" },
        { title: "Xavier London Art", value: "xavier" },
        { title: "IX Life (Collab)", value: "ixlife" },
      ]},
    },
    {
      name: "dropTime",
      type: "datetime",
      title: "Drop Date & Time",
      description: "When this drop goes live",
      validation: (R: any) => R.required(),
    },
    {
      name: "coverImage",
      type: "image",
      title: "Cover Image",
      options: { hotspot: true },
    },
    {
      name: "teaser",
      type: "text",
      title: "Teaser Description",
      rows: 3,
    },
    {
      name: "totalUnits",
      type: "number",
      title: "Total Units",
    },
    {
      name: "products",
      type: "array",
      title: "Products in this Drop",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    },
    {
      name: "isLive",
      type: "boolean",
      title: "Drop is Live",
      description: "Flip this on at drop time to make products purchasable",
      initialValue: false,
    },
    {
      name: "soldOut",
      type: "boolean",
      title: "Sold Out",
      initialValue: false,
    },
  ],
  preview: {
    select: { title: "title", dropTime: "dropTime", media: "coverImage" },
    prepare({ title, dropTime, media }: any) {
      return {
        title,
        subtitle: dropTime ? new Date(dropTime).toLocaleString() : "No date set",
        media,
      };
    },
  },
};