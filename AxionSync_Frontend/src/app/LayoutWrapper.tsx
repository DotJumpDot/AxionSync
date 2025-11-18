"use client";

import { usePathname } from "next/navigation";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const HEADER_HEIGHT = 0;
  const SIDEBAR_WIDTH = 280;

  // ⛔ หน้าเหล่านี้ไม่ต้องการ margin (ตัวอย่าง)
  const noMarginRoutes = ["/", "/register", "/login"];

  const shouldRemoveMargin = noMarginRoutes.includes(pathname);

  const style = shouldRemoveMargin
    ? {} // ไม่มี margin
    : {
        marginLeft: SIDEBAR_WIDTH,
        marginTop: HEADER_HEIGHT,
      };

  return <div style={style}>{children}</div>;
}
