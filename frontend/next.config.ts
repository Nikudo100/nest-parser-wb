import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.wbstatic.net',
        port: '',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
