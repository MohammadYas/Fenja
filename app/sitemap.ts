import type { MetadataRoute } from "next";
import { hentGuides } from "@/lib/guides";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenja.studio";

// SEO-basics (F-3): sitemap over de offentlige sider.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, priority: 1 },
    { url: `${BASE}/priser`, priority: 0.9 },
    { url: `${BASE}/laer`, priority: 0.8 },
    { url: `${BASE}/log-ind`, priority: 0.3 },
    ...hentGuides().map((guide) => ({
      url: `${BASE}/laer/${guide.slug}`,
      priority: 0.6,
    })),
    { url: `${BASE}/vilkaar`, priority: 0.2 },
    { url: `${BASE}/privatliv`, priority: 0.2 },
  ];
}
