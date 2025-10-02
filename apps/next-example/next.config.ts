import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },
  transpilePackages: ['@openpass/sdk-js']
};

export default nextConfig;
