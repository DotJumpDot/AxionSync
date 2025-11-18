import { Metadata } from "next";
import Providers from "./providers";
import HeaderWrapper from "@/Components/Header/HeaderWrapper";
import SiderWrapper from "@/Components/NavBar/SiderWrapper";
import LayoutWrapper from "./LayoutWrapper";
import "./globals.css";


export const metadata: Metadata = {
  title: "AxionSync",
  description: "AxionSync Application",
  keywords: ["AxionSync", "Next.js", "Application", "Thailand"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <HeaderWrapper />
          <SiderWrapper />
          <LayoutWrapper>{children}</LayoutWrapper>
          <div id="notification-root"></div>
        </Providers>
      </body>
    </html>
  );
}
