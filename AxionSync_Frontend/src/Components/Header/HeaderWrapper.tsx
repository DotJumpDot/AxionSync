"use client";

import Header from "@/Components/Header/Header";
import { usePathname } from "next/navigation";
import { locales, Locale } from "@/languages/config";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const normalizedPath = (() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      return `/${segments.slice(1).join("/")}` || "/";
    }
    return pathname;
  })();

  const hideHeaderRoutes = ["/", "/register", "/memo", "/profile"];
  const shouldHideHeader = hideHeaderRoutes.includes(normalizedPath);

  if (shouldHideHeader) return null;
  return <Header />;
}
