/**
 * Centralized configuration for questionnaire and Data Quality Rating (DQR) settings
 */

// Data Quality Rating Configuration
export const DQR_CONFIG = {
  // Technological Representativeness (TeR) - Level 2 Options
  TER_LEVEL2_OPTIONS: [
    "Site specific technology",
    "Similar process technology",
    "Industry average technology",
    "Proxy process",
    "Mismatch",
  ],

  // Temporal Representativeness (TiR) - Level 1 Options
  TIR_LEVEL1_OPTIONS: ["Applicable", "Derived", "Not Applicable"],

  // Temporal Representativeness (TiR) - Level 2 Options
  TIR_LEVEL2_OPTIONS: [
    "Data Period < 1 Year",
    "1Y < Data Period < 3Y",
    "3Y < Data Period < 5Y",
    "5Y < Data Period < 10Y",
    "Data Period > 10 Year",
  ],

  // Geographical Representativeness (GR) - Level 2 Options
  GR_LEVEL2_OPTIONS: [
    "Site Specific",
    "Country Specific",
    "Regional",
    "Global",
    "Mismatch",
  ],

  // Primary Data Share (PDS) Options
  PDS_OPTIONS: ["Primary", "Secondary", "Proxy"],

  // Completeness (C) Options
  C_OPTIONS: ["Required", "Optional"],
};

