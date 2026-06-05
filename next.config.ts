import type { NextConfig } from "next";

const isEdgeBuild = process.env.NEXT_RUNTIME === 'edge' || process.env.CLOUDFLARE_PAGES === '1' || process.env.CF_PAGES === '1';

const nextConfig: NextConfig = {
  serverExternalPackages: isEdgeBuild ? [] : ['pg'],
};

export default nextConfig;
