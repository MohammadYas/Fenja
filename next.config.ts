import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
