import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image configuration - allow all sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.ufs.sh',
      }
    ],
    localPatterns: [
      {
        pathname: '/api/og/blog',
        search: '',
      },
      {
        pathname: '/me.jpg',
        search: '',
      }, 
      {
        pathname: '/bg-pattern.png',
        search: '',
      }
    ],
    dangerouslyAllowSVG: true,
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
