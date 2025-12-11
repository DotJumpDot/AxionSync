"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  IconGauge,
  IconFingerprint,
  IconActivity,
  IconLogout,
  IconChevronRight,
  IconClock,
  IconReport,
  IconBookmark,
} from "@tabler/icons-react";
import { Box, NavLink, Divider } from "@mantine/core";
import { useAuthStore } from "@/Store/auth";
import { usePageLoadingStore } from "@/Store/loading";

const data = [
  {
    icon: IconGauge,
    label: "Main Menu",
    description: "",
    rightSection: <IconChevronRight size={16} stroke={1.5} />,
  },
  {
    icon: IconFingerprint,
    label: "Todo",
    description: "",
    rightSection: <IconChevronRight size={16} stroke={1.5} />,
  },
  {
    icon: IconActivity,
    label: "Memo",
    description: "",
    rightSection: <IconChevronRight size={16} stroke={1.5} />,
  },
  {
    icon: IconBookmark,
    label: "Bookmark",
    description: "",
    rightSection: <IconChevronRight size={16} stroke={1.5} />,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { logout } = useAuthStore();
  const setPageLoading = usePageLoadingStore((s) => s.setLoading);
  const [active, setActive] = useState(0);
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setDateTime(now.toLocaleString("th-TH"));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    setPageLoading(true);
    logout();
    window.location.href = "/";
  };

  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "280px",
        height: "100vh",
        backgroundColor: "#f3f3f3",
        boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo and Branding */}
      <div
        style={{
          padding: "15px 12px",
          paddingLeft: "25px",
          height: "83px",
          display: "flex",
          justifyContent: "left",
          alignItems: "center",
          gap: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "var(--color-primary)",
            borderRadius: "50%",
          }}
        ></div>
        <h1
          style={{
            fontSize: "1.2rem",
            margin: 0,
            fontWeight: 600,
            color: "white",
          }}
        >
          AxionSync
        </h1>
      </div>

      {/* DateTime */}
      <div
        style={{
          padding: "15px 12px",
          fontSize: "1.3rem",
          fontWeight: 500,
          backgroundColor: "#f3f3f3",
          height: "10vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <IconClock size={35} stroke={2} />
        <div
          style={{
            fontVariantNumeric: "tabular-nums",
            minWidth: "180px",
            textAlign: "center",
          }}
        >
          {dateTime}
        </div>
      </div>

      <Divider />

      {/* Menu Items */}
      <div style={{ padding: "0px", flex: 1 }}>
        {data.map((item, index) => {
          const isActive = index === active;

          return (
            <NavLink
              key={item.label}
              active={isActive}
              label={item.label}
              description={item.description}
              leftSection={<item.icon size={26} stroke={1.5} />}
              rightSection={
                isActive && item.rightSection ? (
                  <IconChevronRight size={16} stroke={1.5} />
                ) : null
              }
              onClick={() => {
                setActive(index);
                let targetPath = "";
                if (item.label === "Main Menu")
                  targetPath = `/${locale}/mainmenu`;
                if (item.label === "Todo") targetPath = `/${locale}/todo`;
                if (item.label === "Memo") targetPath = `/${locale}/memo`;
                if (item.label === "Bookmark")
                  targetPath = `/${locale}/bookmark`;
                if (targetPath && pathname !== targetPath) {
                  setPageLoading(true);
                  router.push(targetPath);
                }
              }}
              color="orange"
              styles={{
                root: {
                  height: 80,
                  borderRadius: 0,
                  marginBottom: 0,
                  paddingLeft: 16,
                  paddingRight: 16,
                  transition: "0.2s",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "var(--mantine-color-orange-light)",
                    color: "var(--mantine-color-orange-9)",
                  },
                },
                label: {
                  fontSize: "1rem",
                  fontWeight: 450,
                },
                section: {
                  svg: { width: 26, height: 26, transition: "0.2s" },
                },
              }}
            />
          );
        })}
      </div>

      {/* profile */}
      <div style={{ padding: "0px", marginBottom: "0px" }}>
        <NavLink
          active
          variant="subtle"
          label="Profile"
          leftSection={<IconReport size={26} stroke={1.5} />}
          color="#1900ff"
          onClick={() => {
            const targetPath = `/${locale}/profile`;
            if (pathname !== targetPath) {
              setPageLoading(true);
              router.push(targetPath);
            }
          }}
          styles={{
            root: {
              height: 80,
              borderRadius: 0,
              paddingLeft: 16,
              paddingRight: 16,
              transition: "0.2s",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#ffe5e5",
                color: "red",
              },
            },
            label: {
              fontSize: "1rem",
              fontWeight: 450,
            },
          }}
        />
        {/* Logout */}
        <NavLink
          active
          variant="subtle"
          label="Logout"
          leftSection={<IconLogout size={26} stroke={1.5} />}
          color="red"
          onClick={handleLogout}
          styles={{
            root: {
              height: 80,
              borderRadius: 0,
              paddingLeft: 16,
              paddingRight: 16,
              transition: "0.2s",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#ffe5e5",
                color: "red",
              },
            },
            label: {
              fontSize: "1rem",
              fontWeight: 450,
            },
          }}
        />
      </div>
    </Box>
  );
}
