"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Spin } from "antd";
import { usePageLoadingStore } from "@/Store/loading";

export default function PageLoadingProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoading = usePageLoadingStore((s) => s.isLoading);
  const setLoading = usePageLoadingStore((s) => s.setLoading);

  useEffect(() => {
    // Hide loading spinner after navigation completes
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 10000); // Fallback to hide after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isLoading, setLoading]);

  if (!isLoading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        zIndex: 9999,
        backdropFilter: "blur(2px)",
      }}
    >
      <Spin size="large" />
    </div>
  );
}
