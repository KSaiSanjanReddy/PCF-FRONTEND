export type Locale = "en" | "hi" | "zh" | "de";

export const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
  { value: "zh", label: "中文" },
  { value: "de", label: "Deutsch" },
];

export const LOCALE_STORAGE_KEY = "sq_locale";

export type QuestionCopy = {
  label: string;
  help?: string;
  gateHint?: string;
  subsLabel?: string;
};

export type SectionCopy = {
  title: string;
  blurb: string;
};

export type QuestionnaireCatalog = {
  ui: Record<string, string>;
  validation: Record<string, string>;
  consent: {
    noticeTitle: string;
    noticeBody: string;
    reTechTitle: string;
    reTechIntro: string;
    eligibleHeading: string;
    excludedHeading: string;
    reTechItems: string[];
    reTechExcluded: string[];
    reTechCheckbox: string;
    procurementTitle: string;
    procurementIntro: string;
    acronymsHeading: string;
    acronyms: string[];
    procurementHeading: string;
    procurementItems: string[];
    procurementCheckbox: string;
    doubleTitle: string;
    doubleIntro: string;
    doubleItems: string[];
    doubleCheckbox: string;
  };
  sections: Record<string, SectionCopy>;
  questions: Record<string, Record<string, QuestionCopy>>;
  fields: Record<string, string>;
  options: Record<string, string>;
};

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>
) => string;
