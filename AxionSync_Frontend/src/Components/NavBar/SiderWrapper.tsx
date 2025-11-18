"use client";

import Sidebar from "@/Components/NavBar/Sidebar";
import { usePathname } from "next/navigation";

export default function SiderWrapper() {
  const pathname = usePathname();

  // ⛔ ใส่ path ที่ไม่ต้องการให้ Sidebar โชว์
  const hideSidebarRoutes = ["/", "/register", "/login"];

  const shouldHide = hideSidebarRoutes.includes(pathname);

  if (shouldHide) return null;

  return <Sidebar />;
}
