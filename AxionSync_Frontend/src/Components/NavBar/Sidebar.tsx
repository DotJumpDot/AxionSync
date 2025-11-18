"use client";

import { useState, useEffect } from "react";
import {
  IconGauge,
  IconFingerprint,
  IconActivity,
  IconLogout,
  IconChevronRight,
  IconClock,
} from "@tabler/icons-react";
import { Box, NavLink, Divider } from "@mantine/core";
import { useAuthStore } from "@/Store/auth";

const HEADER_HEIGHT = 83;

const authStore = useAuthStore.getState();

const data = [
  {
    icon: IconGauge,
    label: "Dashboard",
    description: "",
    rightSection: <IconChevronRight size={16} stroke={1.5} />,
  },
  {
    icon: IconFingerprint,
    label: "Security",
    description: "",
    rightSection: <IconChevronRight size={16} stroke={1.5} />,
  },
  {
    icon: IconActivity,
    label: "Activity",
    description: "",
    rightSection: <IconChevronRight size={16} stroke={1.5} />,
  },
];

export default function Sidebar() {
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
    authStore.logout();
    window.location.href = "/";
  };

  return (
    <Box
      style={{
        position: "fixed",
        top: HEADER_HEIGHT,
        left: 0,
        width: "280px",
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        backgroundColor: "#f3f3f3",
        boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* เวลา-วันที่ */}
      <div
        style={{
          padding: "15px 12px",
          fontSize: "1.3rem",
          fontWeight: 500,
          backgroundColor: "#f3f3f3",
          height: "10vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <IconClock size={35} stroke={2} />
        {dateTime}
      </div>

      <Divider />

      {/* เมนูหลัก */}
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
              onClick={() => setActive(index)}
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

      {/* Logout */}
      <div style={{ padding: "0px", marginBottom: "0px" }}>
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
