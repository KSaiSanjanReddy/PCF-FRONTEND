import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Locale, QuestionnaireCatalog, TranslateFn } from "./types";
import { LOCALE_STORAGE_KEY, LOCALES } from "./types";
import { CATALOGS, en, getCatalog } from "./catalogs";

function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) =>
    vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : `{{${k}}}`
  );
}

/** Resolve dotted keys with special handling for fields/options (keys contain dots). */
function resolveKey(catalog: QuestionnaireCatalog, key: string): unknown {
  if (key.startsWith("fields.")) {
    return catalog.fields[key.slice("fields.".length)];
  }
  if (key.startsWith("options.")) {
    return catalog.options[key.slice("options.".length)];
  }
  if (key.startsWith("sections.")) {
    const rest = key.slice("sections.".length);
    const lastDot = rest.lastIndexOf(".");
    if (lastDot === -1) return undefined;
    const sectionId = rest.slice(0, lastDot);
    const prop = rest.slice(lastDot + 1);
    return catalog.sections[sectionId]?.[prop as "title" | "blurb"];
  }
  if (key.startsWith("questions.")) {
    // questions.<sectionId>.<num>.<prop>
    const rest = key.slice("questions.".length);
    const parts = rest.split(".");
    if (parts.length < 3) return undefined;
    const prop = parts[parts.length - 1];
    const num = parts[parts.length - 2];
    const sectionId = parts.slice(0, -2).join(".");
    const q = catalog.questions[sectionId]?.[num];
    return q?.[prop as keyof typeof q];
  }
  if (key.startsWith("ui.")) return catalog.ui[key.slice("ui.".length)];
  if (key.startsWith("validation."))
    return catalog.validation[key.slice("validation.".length)];
  if (key.startsWith("consent."))
    return (catalog.consent as Record<string, unknown>)[
      key.slice("consent.".length)
    ];
  return undefined;
}

function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw && LOCALES.some((l) => l.value === raw)) return raw as Locale;
  } catch {
    /* ignore */
  }
  return "en";
}

export function createTranslator(locale: Locale): TranslateFn {
  const catalog = CATALOGS[locale] || en;
  return (key, vars) => {
    const fromLocale = resolveKey(catalog, key);
    const fromEn = resolveKey(en, key);
    const raw =
      typeof fromLocale === "string"
        ? fromLocale
        : typeof fromEn === "string"
          ? fromEn
          : key;
    return interpolate(raw, vars);
  };
}

export type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
  catalog: QuestionnaireCatalog;
};

const QuestionnaireLocaleContext = createContext<LocaleContextValue | null>(
  null
);

export const QuestionnaireLocaleProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useMemo(() => createTranslator(locale), [locale]);
  const catalog = useMemo(() => getCatalog(locale), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t, catalog }),
    [locale, setLocale, t, catalog]
  );

  return (
    <QuestionnaireLocaleContext.Provider value={value}>
      {children}
    </QuestionnaireLocaleContext.Provider>
  );
};

export function useQuestionnaireLocale(): LocaleContextValue {
  const ctx = useContext(QuestionnaireLocaleContext);
  if (!ctx) {
    return {
      locale: "en",
      setLocale: () => undefined,
      t: createTranslator("en"),
      catalog: en,
    };
  }
  return ctx;
}

export { LOCALES, getCatalog };
