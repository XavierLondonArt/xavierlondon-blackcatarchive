// sanity.config.ts — project root
import { defineConfig }  from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool }    from "@sanity/vision";
import { schemaTypes }   from "./sanity/schemas";

export default defineConfig({
  name:  "xavierlondon",
  title: "xavierlondon.art Studio",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   "production",

  // Tell Sanity Studio its base URL so routing works correctly
  basePath: "/studio",

  plugins: [structureTool(), visionTool()],

  schema: { types: schemaTypes },
});