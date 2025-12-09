import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { Metadata } from "next";
import Providers from "../providers";
import HeaderWrapper from "@/Components/Header/HeaderWrapper";
import SiderWrapper from "@/Components/NavBar/SiderWrapper";
import LayoutWrapper from "../LayoutWrapper";
import { notFound } from "next/navigation";
import { locales, Locale } from "@/languages/config";

export const metadata: Metadata = {
  title: "AxionSync",
  description: "AxionSync Application",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;

  // Validate locale - if invalid, show 404
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Get messages for the current locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <HeaderWrapper />
            <SiderWrapper />
            <LayoutWrapper>{children}</LayoutWrapper>
            <div id="notification-root"></div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
