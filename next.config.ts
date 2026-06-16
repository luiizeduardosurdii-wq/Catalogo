import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  // Permite JS/HMR no emulador Android (10.0.2.2) e celular na rede local
  allowedDevOrigins: [
    "10.0.2.2",
    "10.0.2.2:3000",
    "192.168.0.6",
    "192.168.0.6:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
  ],
};

export default nextConfig;
