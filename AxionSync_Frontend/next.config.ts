import type { NextConfig } from "next";
import * as dotenv from "dotenv";
import { resolve } from "path";

// โหลด .env จากโฟลเดอร์ root ของ mono repo
dotenv.config({ path: resolve(__dirname, "../.env") });

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["antd"],

  // inject env เข้า process.env ของ Next.js
  env: {
    NEXT_PUBLIC_BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
    NEXT_PUBLIC_X_API_KEY: process.env.X_API_KEY,
  },
};

export default nextConfig;
