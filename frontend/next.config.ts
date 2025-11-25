/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",         // ⬅ evita next export
  experimental: {
    serverActions: false,
  },
};

module.exports = nextConfig;
