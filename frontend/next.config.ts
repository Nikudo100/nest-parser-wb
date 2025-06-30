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
      {
        protocol: 'https',
        hostname: '**.wbbasket.ru', // разрешаем все поддомены wbbasket.ru
        port: '',
        pathname: '**',
      },
    ],
  },
  allowedDevOrigins: [
    'http://109.172.39.82:3004',
    'http://109.172.39.82:3003',
  ],
};

export default nextConfig;
