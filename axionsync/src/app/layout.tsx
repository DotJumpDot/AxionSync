import { Metadata } from "next";
import HeaderWrapper from "@/Components/HeaderWrapper";

export const metadata: Metadata = {
  title: "AxionSync",
  description: "AxionSync Application",
  keywords: ["AxionSync", "Next.js", "Application", "Thailand"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <HeaderWrapper /> {/* ✅ ตัวนี้จะตัดสินใจเองว่าจะโชว์ Header หรือไม่ */}
        {children}
      </body>
    </html>
  );
}
