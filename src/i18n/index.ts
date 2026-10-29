import type { Locale } from "../content/schema";
import { en, type TranslationKey } from "./en";
import { es } from "./es";

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, es };

export function useTranslations(locale: Locale) {
  return (key: TranslationKey) => dictionaries[locale][key];
}
