// Pinger IndexNow med alle offentlige sider, så Bing/Yandex (og dermed
// ChatGPT-søgning) opdager selja.dk med det samme i stedet for at vente på
// crawl. Køres manuelt efter deploy af nye offentlige sider:
//   npx tsx scripts/indexnow-ping.ts
import { site } from "../lib/config";
import { hentGuides } from "../lib/guides";
import { INDEXNOW_KEY, INDEXNOW_KEY_LOCATION } from "../lib/seo/indexnow";

async function main() {
  const base = site.baseUrl;
  const urls = [
    `${base}/`,
    `${base}/priser`,
    `${base}/laer`,
    ...hentGuides().map((g) => `${base}/laer/${g.slug}`),
    `${base}/vilkaar`,
    `${base}/privatliv`,
  ];

  const svar = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(base).host,
      key: INDEXNOW_KEY,
      keyLocation: `${base}${INDEXNOW_KEY_LOCATION}`,
      urlList: urls,
    }),
  });

  console.log(`IndexNow: ${svar.status} ${svar.statusText} (${urls.length} URL'er)`);
  if (!svar.ok) console.log(await svar.text());
}

main().catch((fejl) => {
  console.error(fejl);
  process.exit(1);
});
