/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose", // helps with modern ESM deps
  },
  webpack(config) {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    return config
  },
  reactStrictMode: true,
  trailingSlash: true,
};

module.exports = nextConfig;
