"use client";

import { NavLink } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/Store/auth";

export default function LogoutNav() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <NavLink
      label="Logout"
      leftSection={<IconLogout size={26} stroke={1.5} />}
      onClick={handleLogout}
      color="red"
      styles={{
        root: {
          height: 70,
          borderRadius: 10,
          marginBottom: 10,
          paddingLeft: 16,
          paddingRight: 16,
        },
        label: { fontSize: "1rem" },
        section: { svg: { width: 26, height: 26 } },
      }}
    />
  );
}
