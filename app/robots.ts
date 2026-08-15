import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenja.studio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // App-delen er personlig og bag login — ingen grund til crawling
      disallow: ["/oversigt", "/items", "/nyt-item", "/kreditter", "/konto", "/admin", "/api"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
