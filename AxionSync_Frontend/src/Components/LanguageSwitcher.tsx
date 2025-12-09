"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button, Dropdown, MenuProps } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useLocale } from "next-intl";
import { Locale, locales } from "@/languages/config";
import { useAuthStore } from "@/Store/auth";

const languages = [
  { key: "en", label: "English" },
  { key: "th", label: "ภาษาไทย" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { setLocale } = useAuthStore();

  const handleLanguageChange = (targetLocale: string) => {
    if (targetLocale === locale) return;

    const segments = pathname.split("/").filter(Boolean);

    // Replace or add locale in path
    if (
      segments[0] &&
      locales.includes(segments[0] as (typeof locales)[number])
    ) {
      segments[0] = targetLocale;
    } else {
      segments.unshift(targetLocale);
    }

    const newPath = `/${segments.join("/")}`;

    // Persist preference in auth store (already persisted in auth-store)
    setLocale(targetLocale as Locale);

    // Force refresh to reload translations
    router.push(newPath);
    router.refresh();
  };

  const items: MenuProps["items"] = languages.map((lang) => ({
    key: lang.key,
    label: (
      <span
        style={{
          fontWeight: locale === lang.key ? "bold" : "normal",
        }}
      >
        {lang.label}
      </span>
    ),
    onClick: () => handleLanguageChange(lang.key),
  }));

  const currentLanguage =
    languages.find((l) => l.key === locale)?.label || "English";

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
      <Button
        type="text"
        icon={
          <GlobalOutlined
            style={{ fontSize: "25px", color: "white" }}
            className="center"
          />
        }
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          minWidth: "120px",
        }}
      >
        <span style={{ fontSize: "20px", color: "white" }}>
          {currentLanguage}
        </span>
      </Button>
    </Dropdown>
  );
}
