/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // x402 routes use nodejs runtime explicitly in their route.ts
  // Ensure webpack polyfills are not needed for server-side EIP-3009 parsing
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

module.exports = nextConfig;
