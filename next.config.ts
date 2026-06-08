import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Needed for Prisma on Vercel serverless
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
