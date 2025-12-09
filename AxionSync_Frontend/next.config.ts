import type { NextConfig } from "next";
import * as dotenv from "dotenv";
import { resolve, join } from "path";
import createNextIntlPlugin from "next-intl/plugin";

// โหลด .env จากโฟลเดอร์ root ของ mono repo
dotenv.config({ path: resolve(__dirname, "../.env") });

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["antd"],

  // Optimize production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // inject env เข้า process.env ของ Next.js
  env: {
    NEXT_PUBLIC_BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
    NEXT_PUBLIC_X_API_KEY: process.env.X_API_KEY,
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["@mantine/core", "antd"],
  },
};

export default withNextIntl(nextConfig);
