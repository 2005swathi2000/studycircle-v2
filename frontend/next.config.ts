import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: [
          '**/backend/**',
          '**/database.sqlite**',
          '**/.git**',
          '**/node_modules/**'
        ]
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NODE_ENV === "production"
          ? "https://studycircle-v2.onrender.com/api/:path*"
          : "http://localhost:5000/api/:path*",
      },
    ];
  }
};

export default nextConfig;
