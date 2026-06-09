const isEdgeBuild = process.env.NEXT_RUNTIME === 'edge' || process.env.CLOUDFLARE_PAGES === '1' || process.env.CF_PAGES === '1';

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: isEdgeBuild ? [] : ['pg'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        'fs', 'net', 'tls', 'path', 'stream', 'dns', 'crypto', 'util', 'util/types', 'events', 'string_decoder', 'buffer', 'assert'
      );
    }
    return config;
  }
};

module.exports = nextConfig;
