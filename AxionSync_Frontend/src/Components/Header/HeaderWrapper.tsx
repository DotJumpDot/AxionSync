"use client";

import Header from "@/Components/Header/Header";
import { usePathname } from "next/navigation";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const hideHeaderRoutes = ["/", "/register", "/memo"];
  const shouldHideHeader = hideHeaderRoutes.includes(pathname);

  if (shouldHideHeader) return null;
  return <Header />;
}
