"use client";

import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/core/styles/NavLink.css";
import "@mantine/core/styles.layer.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <MantineProvider>{children}</MantineProvider>;
}
