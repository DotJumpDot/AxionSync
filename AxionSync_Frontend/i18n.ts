import { getRequestConfig } from "next-intl/server";
import { locales, Locale, defaultLocale } from "./src/languages/config";

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from request or use default
  let locale = await requestLocale;

  // Validate locale
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  // Import messages for the locale
  const messages = (await import(`./src/languages/${locale}/index`)).default;

  return {
    locale,
    messages,
  };
});
