import type { Locale, QuestionnaireCatalog } from "../types";
import en from "./en";
import hi from "./hi";
import zh from "./zh";
import de from "./de";

export const CATALOGS: Record<Locale, QuestionnaireCatalog> = { en, hi, zh, de };

export function getCatalog(locale: Locale): QuestionnaireCatalog {
  return CATALOGS[locale] || en;
}

export { en, hi, zh, de };
