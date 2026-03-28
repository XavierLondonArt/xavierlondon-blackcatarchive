// sanity/schemas/archiveTv.ts
 
export const archiveTv = {
  name: "archiveTv",
  title: "Archive TV",
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Episode Title",
      validation: (R: any) => R.required(),
    },
    {
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title" },
    },
    {
      name: "season",
      type: "number",
      title: "Season",
      initialValue: 1,
    },
    {
      name: "episode",
      type: "number",
      title: "Episode Number",
    },
    {
      name: "youtubeUrl",
      type: "url",
      title: "YouTube URL",
      description: "Paste the full YouTube URL e.g. https://www.youtube.com/watch?v=XXXXX",
    },
    {
      name: "thumbnail",
      type: "image",
      title: "Thumbnail (optional — uses YouTube thumbnail if blank)",
      options: { hotspot: true },
    },
    {
      name: "description",
      type: "text",
      title: "Description",
      rows: 4,
    },
    {
      name: "publishedAt",
      type: "datetime",
      title: "Published At",
    },
    {
      name: "tags",
      type: "array",
      title: "Tags",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    },
  ],
  preview: {
    select: { title: "title", season: "season", episode: "episode", media: "thumbnail" },
    prepare({ title, season, episode, media }: any) {
      return {
        title,
        subtitle: `S${String(season).padStart(2,"0")}E${String(episode).padStart(2,"0")}`,
        media,
      };
    },
  },
};
 // sanity/schemas/manuscript.ts
 
export const manuscript = {
  name: "manuscript",
  title: "Manuscripts & Dispatches",
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
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
      ]},
    },
    {
      name: "coverImage",
      type: "image",
      title: "Cover Image",
      options: { hotspot: true },
    },
    {
      name: "excerpt",
      type: "text",
      title: "Excerpt",
      rows: 2,
    },
    {
      name: "body",
      type: "array",
      title: "Body",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "caption", type: "string", title: "Caption" },
          ],
        },
      ],
    },
    {
      name: "publishedAt",
      type: "datetime",
      title: "Published At",
    },
    {
      name: "tags",
      type: "array",
      title: "Tags",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    },
  ],
  preview: {
    select: { title: "title", publishedAt: "publishedAt", media: "coverImage" },
    prepare({ title, publishedAt, media }: any) {
      return {
        title,
        subtitle: publishedAt ? new Date(publishedAt).toLocaleDateString() : "Draft",
        media,
      };
    },
  },
};