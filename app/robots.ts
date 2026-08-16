import type { MetadataRoute } from "next";
import { site } from "@/lib/config";

const BASE = site.baseUrl;

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
