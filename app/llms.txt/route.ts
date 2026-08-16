import { byggLlmsTxt } from "@/lib/seo/llms";

// /llms.txt — findbarhed for sprogmodeller (llmstxt.org). Statisk genereret,
// cachet i et døgn. Indholdet bygges af lib/seo/llms.ts ud fra config + copy.
export const dynamic = "force-static";

export function GET() {
  return new Response(byggLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
