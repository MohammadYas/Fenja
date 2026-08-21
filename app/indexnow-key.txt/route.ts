import { INDEXNOW_KEY } from "@/lib/seo/indexnow";

// IndexNow-nøglefil: protokollen kræver at nøglen kan hentes på
// /{key}.txt for at bevise domæne-ejerskab. Vi serverer den på en fast sti
// og peger på den med keyLocation i ping'et (tilladt af specifikationen).
export const dynamic = "force-static";

export function GET() {
  return new Response(INDEXNOW_KEY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
