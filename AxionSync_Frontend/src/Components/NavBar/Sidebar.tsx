"use client";

import { useState, useEffect } from "react";
import {
  IconGauge,
  IconFingerprint,
  IconActivity,
  IconLogout,
  IconChevronRight,
} from "@tabler/icons-react";
import { Box, NavLink, Divider } from "@mantine/core";

const HEADER_HEIGHT = 83;

const data = [
  { icon: IconGauge, label: "Dashboard", description: "Item with description" },
  {
    icon: IconFingerprint,
    label: "Security",
    rightSection: <IconChevronRight size={16} stroke={1.5} />,
  },
  { icon: IconActivity, label: "Activity" },
];

export default function Sidebar() {
  const [active, setActive] = useState(0);
  const [dateTime, setDateTime] = useState("");

  // ⏱ Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setDateTime(now.toLocaleString("th-TH"));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🔐 logout ฟังก์ชันง่าย ๆ
  const handleLogout = () => {
    // localStorage.removeItem("access_token");
    // localStorage.removeItem("user");
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
          fontSize: "0.9rem",
          fontWeight: 500,
          backgroundColor: "#f3f3f3",
          height: "10vh",
        }}
      >
        {dateTime}
      </div>

      <Divider />

      {/* เมนูหลัก */}
      <div style={{ padding: "0px", flex: 1 }}>
        {data.map((item, index) => (
          <NavLink
            key={item.label}
            active={index === active}
            label={item.label}
            description={item.description}
            rightSection={item.rightSection}
            leftSection={<item.icon size={26} stroke={1.5} />}
            onClick={() => setActive(index)}
            color="orange"
            styles={{
              root: {
                height: 80,
                borderRadius: 10,
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
              description: {
                fontSize: "0.9rem",
              },
              section: {
                svg: { width: 26, height: 26, transition: "0.2s" },
              },
            }}
          />
        ))}
      </div>

      {/* 🔻 ปุ่ม Logout ชิดล่างสุด */}
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
              borderRadius: 10,
              paddingLeft: 16,
              paddingRight: 16,
              transition: "0.2s",
              cursor: "pointer",

              "&:hover": {
                backgroundColor: "red", // hover สีแดงอ่อน
                color: "red", // ตัวอักษรแดงเข้ม
              },
            },
            label: {
              fontSize: "1rem",
              fontWeight: 450,
            },
            section: {
              svg: { width: 26, height: 26 },
            },
          }}
        />
      </div>
    </Box>
  );
}
