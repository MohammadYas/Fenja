import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Billeder serveres fra Supabase Storage via signerede URLs (NFR-6);
    // domænet tilføjes når ejeren har oprettet cloud-projektet (HANDOFF §6).
    remotePatterns: [],
  },
};

export default nextConfig;
