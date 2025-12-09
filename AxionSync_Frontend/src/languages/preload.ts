// Preload translations for all locales to improve navigation performance
// This runs once at build/startup time
import { locales } from "./config";

type Messages = Record<string, unknown>;
const preloadedTranslations = new Map<string, Messages>();

export async function preloadTranslations() {
  // Preload all locales in parallel
  await Promise.all(
    locales.map(async (locale) => {
      try {
        const messages: Messages = (await import(`./${locale}/index`)).default;
        preloadedTranslations.set(locale, messages);
      } catch (error) {
        console.error(`Failed to preload translations for ${locale}:`, error);
      }
    })
  );
}

export function getPreloadedTranslation(locale: string) {
  return preloadedTranslations.get(locale);
}

export function hasPreloadedTranslation(locale: string) {
  return preloadedTranslations.has(locale);
}
