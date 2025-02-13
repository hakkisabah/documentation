import { defineConfig } from "astro/config"
import preact from "@astrojs/preact"
import react from "@astrojs/react"
import { astroCallouts } from "./integrations/astro-callouts"
import { solidityRemixCode } from "./integrations/solidity-remix"
import { youtubeEmbed } from "./integrations/youtube-embed"
import mdx from "@astrojs/mdx"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import sitemap from "@astrojs/sitemap"

import partytown from "@astrojs/partytown"

// https://astro.build/config
export default defineConfig({
  site: "https://docs.chain.link",
  legacy: {
    astroFlavoredMarkdown: true,
  },
  integrations: [
    preact(),
    react(),
    sitemap({ changefreq: "daily" }),
    astroCallouts(),
    solidityRemixCode(),
    youtubeEmbed(),
    mdx(),
    partytown({}),
  ],
  markdown: {
    drafts: true,
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "prepend",
        },
      ],
    ],
    syntaxHighlight: "prism",
    extendDefaultPlugins: true,
  },
})
