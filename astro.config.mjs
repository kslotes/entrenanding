// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { satteri } from "@astrojs/markdown-satteri";
import { conceptLinksPlugin } from "./src/lib/concept-links-plugin.ts";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  integrations: [react()],
  markdown: {
    processor: satteri({ hastPlugins: [conceptLinksPlugin] }),
    shikiConfig: {
      // Colors only through CSS variables so code follows the theme toggle.
      themes: { light: "github-light", dark: "tokyo-night" },
      defaultColor: false,
    },
  },
});
