"use client";

import Sidebar from "@/Components/NavBar/Sidebar";
import { usePathname } from "next/navigation";
import { locales, Locale } from "@/languages/config";

export default function SiderWrapper() {
  const pathname = usePathname();

  // Normalize path by removing locale prefix
  const normalizedPath = (() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      return `/${segments.slice(1).join("/")}` || "/";
    }
    return pathname;
  })();

  // ⛔ ใส่ path ที่ไม่ต้องการให้ Sidebar โชว์
  const hideSidebarRoutes = ["/", "/register", "/login"];

  const shouldHide = hideSidebarRoutes.includes(normalizedPath);

  if (shouldHide) return null;

  return <Sidebar />;
}
