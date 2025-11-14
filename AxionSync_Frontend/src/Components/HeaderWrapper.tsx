"use client";

import Header from "@/Components/Header";
import { usePathname } from "next/navigation";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const hideHeaderRoutes = ["/", "/register"];
  const shouldHideHeader = hideHeaderRoutes.includes(pathname);

  if (shouldHideHeader) return null;
  return <Header />;
}
