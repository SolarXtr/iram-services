import type { NextConfig } from "next";

const nodeBuiltins = [
  'assert', 'buffer', 'crypto', 'dns', 'events', 'fs', 'net', 'path', 'querystring', 'stream', 'string_decoder', 'tls', 'url', 'util', 'util/types', 'zlib'
];

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        ...nodeBuiltins,
        ...nodeBuiltins.map(builtin => `node:${builtin}`)
      ];
    }
    return config;
  }
};

export default nextConfig;
