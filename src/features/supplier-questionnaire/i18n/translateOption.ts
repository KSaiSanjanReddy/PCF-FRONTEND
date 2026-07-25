import type { Locale, TranslateFn } from "./types";
import { getCatalog } from "./catalogs";

/** Translate a stored English option value for display. */
export function translateOption(
  value: unknown,
  t: TranslateFn,
  locale?: Locale
): string {
  if (value === null || value === undefined || value === "") return "";
  const key = String(value);
  if (locale) {
    const fromCatalog = getCatalog(locale).options?.[key];
    if (fromCatalog) return fromCatalog;
  }
  const translated = t(`options.${key}`);
  if (translated === `options.${key}`) return key;
  return translated;
}

export function translateOptionLabel(
  label: string,
  value: unknown,
  t: TranslateFn
): string {
  const byValue = translateOption(value, t);
  if (byValue && byValue !== String(value)) return byValue;
  const byLabel = translateOption(label, t);
  if (byLabel && byLabel !== label) return byLabel;
  return label;
}
