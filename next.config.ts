import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Needed for Prisma on Vercel serverless
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
