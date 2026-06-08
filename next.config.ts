import type { NextConfig } from "next";

const isEdgeBuild = process.env.NEXT_RUNTIME === 'edge' || process.env.CLOUDFLARE_PAGES === '1' || process.env.CF_PAGES === '1';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'pg', 'pg-pool', 'pgpass'];
    }
    return config;
  }
};

export default nextConfig;
