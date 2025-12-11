"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePageLoadingStore } from "@/Store/loading";
import { locales } from "@/languages/config";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const setLoading = usePageLoadingStore((s) => s.setLoading);

  useEffect(() => {
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const normalizedPath = (() => {
    const segments = pathname.split("/").filter(Boolean);
    if (
      segments.length > 0 &&
      locales.includes(segments[0] as (typeof locales)[number])
    ) {
      return `/${segments.slice(1).join("/")}` || "/";
    }
    return pathname;
  })();

  const HEADER_HEIGHT = 0;
  const SIDEBAR_WIDTH = 280;

  // ⛔ หน้าเหล่านี้ไม่ต้องการ margin (ตัวอย่าง)
  const noMarginRoutes = ["/", "/register", "/login"];

  const shouldRemoveMargin = noMarginRoutes.includes(normalizedPath);

  const style = shouldRemoveMargin
    ? {} // ไม่มี margin
    : {
        marginLeft: SIDEBAR_WIDTH,
        marginTop: HEADER_HEIGHT,
      };

  return <div style={style}>{children}</div>;
}
