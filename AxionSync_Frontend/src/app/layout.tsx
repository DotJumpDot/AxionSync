import type { Metadata } from "next";
import "./globals.css";
import "antd/dist/reset.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AxionSync",
  description: "AxionSync Application",
  keywords: ["AxionSync", "Next.js", "Application", "Thailand"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
