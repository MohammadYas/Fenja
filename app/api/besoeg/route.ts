import { NextResponse, type NextRequest } from "next/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// Cookieløs besøgs-registrering (21/8 nat). Gemmer ALDRIG IP eller identitet
// — kun sti, henvisnings-host, UTM og enhedsklasse. Svarer altid 204, så et
// fejlet kald aldrig påvirker brugeren.
const TILLADT_STI = /^\/[a-z0-9\-\/_%.]{0,299}$/i;

function klip(vaerdi: unknown, maks: number): string | null {
  if (typeof vaerdi !== "string") return null;
  const t = vaerdi.trim().slice(0, maks);
  return t.length > 0 ? t : null;
}

export async function POST(request: NextRequest) {
  try {
    const krop = (await request.json()) as Record<string, unknown>;
    const sti = typeof krop.sti === "string" ? krop.sti : "";
    if (!TILLADT_STI.test(sti)) return new NextResponse(null, { status: 204 });

    // Admin-siderne og API'et støjer kun — de tælles ikke
    if (sti.startsWith("/admin") || sti.startsWith("/api")) {
      return new NextResponse(null, { status: 204 });
    }

    let referrerHost: string | null = null;
    if (typeof krop.referrer === "string" && krop.referrer.length > 0) {
      try {
        const host = new URL(krop.referrer).host;
        // Interne henvisninger er navigation, ikke trafikkilder
        referrerHost = /selja\.(dk|netlify\.app)$/.test(host) ? null : host.slice(0, 200);
      } catch {
        referrerHost = null;
      }
    }

    const ua = request.headers.get("user-agent") ?? "";
    const enhed = /mobi|android|iphone|ipad/i.test(ua) ? "mobil" : ua ? "desktop" : "ukendt";

    const service = opretServiceKlient();
    await service.from("besoeg").insert({
      sti: sti.slice(0, 300),
      referrer_host: referrerHost,
      utm_source: klip(krop.utm_source, 120),
      utm_medium: klip(krop.utm_medium, 120),
      utm_campaign: klip(krop.utm_campaign, 160),
      utm_content: klip(krop.utm_content, 160),
      enhed,
    });
  } catch {
    // stille — statistik må aldrig vælte noget
  }
  return new NextResponse(null, { status: 204 });
}
