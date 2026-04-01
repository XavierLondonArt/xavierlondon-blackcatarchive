// sanity.config.ts — project root
import { defineConfig }  from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool }    from "@sanity/vision";
import { schemaTypes }   from "./sanity/schemas";

export default defineConfig({
  name:  "xavierlondon",
  title: "xavierlondon.art Studio",

  projectId: "e8tv2u1f",   // hardcoded — not a secret, safe to commit
  dataset:   "production",

  basePath: "/studio",

  plugins: [structureTool(), visionTool()],

  schema: { types: schemaTypes },
});