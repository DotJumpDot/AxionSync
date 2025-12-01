"use client";

import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/core/styles/NavLink.css";
import "@mantine/core/styles.layer.css";
import { App as AntApp, ConfigProvider, theme } from "antd";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: { colorPrimary: "#1677ff" },
        }}
      >
        <AntApp>
          <NuqsAdapter>{children}</NuqsAdapter>
        </AntApp>
      </ConfigProvider>
    </MantineProvider>
  );
}
