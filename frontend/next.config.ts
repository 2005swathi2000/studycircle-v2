import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
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
  }
};

export default nextConfig;
