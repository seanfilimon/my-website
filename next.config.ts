import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
  },

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: true,
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['react-icons', 'gsap'],
  },
};

export default nextConfig;
