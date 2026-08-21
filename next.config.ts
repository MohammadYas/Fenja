import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Uden denne gætter Next sig til workspace-roden ud fra nærmeste lockfile og
  // ramte en løs package-lock.json højere oppe i brugermappen. Serverbundlet
  // blev sporet fra den forkerte rod, og det deployede site svarede 502.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Billeder serveres fra Supabase Storage via signerede URLs (NFR-6);
    // domænet tilføjes når ejeren har oprettet cloud-projektet (HANDOFF §6).
    remotePatterns: [],
  },
  async redirects() {
    return [
      // STRATEGISKIFT 2026-08-15: Vinted-landingen ER forsiden nu;
      // /vinted-ruten består som permanent redirect.
      { source: "/vinted", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
