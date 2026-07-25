/**
 * Generates English questionnaire catalog from layout + schema extraction.
 * Run: node scripts/generate-en-catalog.mjs
 */
import fs from "fs";

const src = fs.readFileSync("src/config/questionnaireSchemaV3.ts", "utf8");
const layout = fs.readFileSync(
  "src/features/supplier-questionnaire/fullform/layout.ts",
  "utf8"
);

function stripNum(label) {
  return (label || "")
    .replace(/^\d+(\.\d+)?[a-z]?\.?\s*/i, "")
    .replace(/\s*\((optional)\)\s*$/i, "")
    .trim();
}

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const sections = {};
const sectionRe = /{\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)"/g;
let m;
while ((m = sectionRe.exec(src))) {
  sections[m[1]] = { title: m[2], blurb: "" };
}

// blurbs from SECTION_META
const metaBlock = layout.match(/SECTION_META[\s\S]*?=\s*\{([\s\S]*?)\n\};/);
if (metaBlock) {
  const blurbRe =
    /(\w+):\s*\{\s*blurb:\s*(?:"((?:\\.|[^"\\])*)"|([\s\S]*?)),?\s*\}/g;
  // simpler line-based
  const idBlurb =
    /([a-z0-9_]+):\s*\{\s*blurb:\s*\n?\s*"((?:\\.|[^"\\])*)"/g;
  while ((m = idBlurb.exec(metaBlock[1]))) {
    const id = m[1];
    const blurb = m[2].replace(/\\"/g, '"');
    if (!sections[id]) sections[id] = { title: id, blurb: "" };
    sections[id].blurb = blurb;
  }
  // multi-line blurbs
  const multi =
    /([a-z0-9_]+):\s*\{\s*blurb:\s*\n?\s*"((?:\\.|[^"\\])*)"\s*\+\s*\n?\s*"((?:\\.|[^"\\])*)"/g;
  while ((m = multi.exec(metaBlock[1]))) {
    const id = m[1];
    const blurb = (m[2] + m[3]).replace(/\\"/g, '"');
    if (sections[id]) sections[id].blurb = blurb;
  }
}

// Hardcode blurbs from known layout (more reliable)
const BLURBS = {
  general_information:
    "Please read and acknowledge the items below, then add a few details to identify this submission.",
  section_a_company_product:
    "Tell us who you are and which product this footprint describes.",
  section_b_scope_period:
    "Define the time period the data covers and the boundary of the assessment.",
  section_c_bom: "Break down what one unit of the product is made of.",
  section_d_energy_process:
    "Capture manufacturing energy, process emissions and waste.",
  section_e_packaging: "Account for packaging materials, transport and waste.",
  section_f_transport: "Record outbound transport legs for the product.",
  section_g_biobased:
    "Only needed if the product or packaging contains bio-based feedstock.",
  section_h_methodology:
    "Standards, characterisation factors and allocation choices.",
  section_i_boundary_dqr:
    "Define the assessment boundary and rate your data quality.",
  section_j_verification:
    "Certification, verification and attestation details.",
  section_k_other: "Anything else we should know.",
};
for (const [id, blurb] of Object.entries(BLURBS)) {
  if (!sections[id]) sections[id] = { title: id, blurb };
  else sections[id].blurb = blurb;
}

const LABEL_OVERRIDES = {
  "company.legal_name": "Company legal name",
  "company.bpn": "Business Partner Number (BPNL)",
  "company.other_identifier": "Other identifier (DUNS / VAT / CIN)",
  "product.name": "Product name",
  "product.declared_unit": "Declared unit",
  "methodology.mass_balancing_used": "Mass balancing used?",
  "scope_period.reference_start": "Reference period: start",
  "scope_period.reference_end": "Reference period: end",
};

const fields = {};
const fieldRe = /name:\s*"([^"]+)",\s*label:\s*"((?:\\.|[^"\\])*)"/g;
while ((m = fieldRe.exec(src))) {
  const name = m[1];
  const label = stripNum(m[2].replace(/\\"/g, '"'));
  fields[name] = LABEL_OVERRIDES[name] || label;
}
Object.assign(fields, LABEL_OVERRIDES);

const options = {};
const optionConsts = [
  "YES_NO",
  "REGIONS",
  "DECLARED_UNITS",
  "PRODUCTION_PERIODS",
  "MASS_UNITS",
  "QUANTITY_UNITS",
  "ENERGY_UNITS",
  "FUEL_UNITS",
  "GAS_UNITS",
  "MATERIALS",
  "PROCESSES",
  "ELECTRICITY_TYPES",
  "RENEWABLE_SOURCING",
  "FUEL_CARRIERS",
  "PROCESS_GASES",
  "FOSSIL_BIOGENIC",
  "WASTE_TYPES",
  "TREATMENT_TYPES",
  "PACKAGING_TYPES",
  "TRANSPORT_MODES",
  "BIOMASS_FEEDSTOCKS",
  "PCF_TYPES",
  "SYSTEM_BOUNDARIES",
  "BIOBASED_PRESENT",
  "VOLUME_TYPES",
];
for (const name of optionConsts) {
  const re = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`);
  const block = src.match(re);
  if (!block) continue;
  const itemRe = /"((?:\\.|[^"\\])*)"/g;
  while ((m = itemRe.exec(block[1]))) {
    const v = m[1].replace(/\\"/g, '"');
    options[v] = v;
  }
}
for (const name of ["PACKAGING_INCLUDE", "OUTBOUND_TRANSPORT"]) {
  const re = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`);
  const block = src.match(re);
  if (!block) continue;
  const pairRe =
    /label:\s*"((?:\\.|[^"\\])*)",\s*value:\s*"((?:\\.|[^"\\])*)"/g;
  while ((m = pairRe.exec(block[1]))) {
    const label = m[1].replace(/\\"/g, '"');
    const value = m[2].replace(/\\"/g, '"');
    options[value] = label;
  }
}

// Questions from SECTION_LAYOUT — parse group objects roughly
const questions = {};
const layoutBlock = layout.match(
  /SECTION_LAYOUT[\s\S]*?=\s*\{([\s\S]*)\n\};/
);
if (layoutBlock) {
  // Split by section keys
  const secRe = /(general_information|section_[a-k]_[a-z_]+):\s*\[/g;
  const indices = [];
  while ((m = secRe.exec(layoutBlock[1]))) {
    indices.push({ id: m[1], start: m.index + m[0].length });
  }
  for (let i = 0; i < indices.length; i++) {
    const id = indices[i].id;
    const start = indices[i].start;
    const end =
      i + 1 < indices.length ? indices[i + 1].start : layoutBlock[1].length;
    const chunk = layoutBlock[1].slice(start, end);
    // Find groups
    const groups = [];
    const groupStarts = [];
    const gRe = /\{\s*(?:\/\/[^\n]*\n\s*)*(?:num:\s*"([^"]+)",)?/g;
    // Better: extract each { ... } at top level of array — use num/label/help/gateHint/subsLabel
    let depth = 0;
    let cur = "";
    let inStr = false;
    let escC = false;
    for (let j = 0; j < chunk.length; j++) {
      const c = chunk[j];
      if (escC) {
        cur += c;
        escC = false;
        continue;
      }
      if (c === "\\" && inStr) {
        cur += c;
        escC = true;
        continue;
      }
      if (c === '"' && !escC) inStr = !inStr;
      if (!inStr) {
        if (c === "{") {
          if (depth === 0) cur = "{";
          else cur += c;
          depth++;
          continue;
        }
        if (c === "}") {
          depth--;
          cur += c;
          if (depth === 0) {
            groups.push(cur);
            cur = "";
          }
          continue;
        }
      }
      if (depth > 0) cur += c;
    }

    questions[id] = {};
    for (const g of groups) {
      const numM = g.match(/num:\s*"([^"]+)"/);
      const key = numM ? numM[1] : "submission";
      const labelM = g.match(/label:\s*\n?\s*"((?:\\.|[^"\\])*)"/);
      const labelM2 = g.match(
        /label:\s*\n?\s*"((?:\\.|[^"\\])*)"\s*\+\s*\n?\s*"((?:\\.|[^"\\])*)"/
      );
      let label = "";
      if (labelM2) label = (labelM2[1] + labelM2[2]).replace(/\\"/g, '"');
      else if (labelM) label = labelM[1].replace(/\\"/g, '"');
      // multi-line label with +
      const labelParts = [
        ...g.matchAll(/label:\s*((?:"(?:\\.|[^"\\])*"|[\s+])+),/g),
      ];
      if (labelParts[0]) {
        const parts = [...labelParts[0][1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map(
          (x) => x[1].replace(/\\"/g, '"')
        );
        if (parts.length) label = parts.join("");
      }
      const helpParts = [
        ...g.matchAll(/help:\s*((?:"(?:\\.|[^"\\])*"|[\s+])+),/g),
      ];
      let help = "";
      if (helpParts[0]) {
        help = [...helpParts[0][1].matchAll(/"((?:\\.|[^"\\])*)"/g)]
          .map((x) => x[1].replace(/\\"/g, '"'))
          .join("");
      }
      const gateParts = [
        ...g.matchAll(/gateHint:\s*((?:"(?:\\.|[^"\\])*"|[\s+])+),?/g),
      ];
      let gateHint = "";
      if (gateParts[0]) {
        gateHint = [...gateParts[0][1].matchAll(/"((?:\\.|[^"\\])*)"/g)]
          .map((x) => x[1].replace(/\\"/g, '"'))
          .join("");
      }
      const subsM = g.match(/subsLabel:\s*"((?:\\.|[^"\\])*)"/);
      questions[id][key] = {
        label,
        ...(help ? { help } : {}),
        ...(gateHint ? { gateHint } : {}),
        ...(subsM ? { subsLabel: subsM[1].replace(/\\"/g, '"') } : {}),
      };
    }
  }
}

const ui = {
  progress: "Progress",
  of: "of",
  answered: "answered",
  stepOf: "Step {{current}} of {{total}}",
  ofAnswered: "{{answered}} of {{total}} answered",
  supplierQuestionnaire: "Supplier Questionnaire",
  manufacturerQuestionnaire: "Manufacturer Own Emissions Questionnaire",
  pcfIso: "Product Carbon Footprint · ISO 14067",
  saving: "Saving…",
  autoSaved: "Auto-saved",
  saveDraft: "Save draft",
  previous: "Previous",
  saveContinue: "Save & continue →",
  previewSubmit: "Preview & Submit",
  navigation: "Navigation",
  required: "Required",
  optional: "Optional",
  default: "Default",
  addRow: "Add Row",
  clearRow: "Clear",
  clearRowTitle: "Clear this row's values",
  followUp: "Follow-up details",
  field: "field",
  fields: "fields",
  yes: "Yes",
  no: "No",
  y: "Y",
  n: "N",
  selectOption: "Select an option…",
  selectEllipsis: "Select…",
  selectGeography: "Select geography",
  selectCountryFirst: "Select a country first",
  selectState: "Select or type state / province",
  searchLocation: "Search location…",
  pickComponent: "Pick a component",
  lockedDestination: "Locked to previous leg's destination",
  language: "Language",
  acknowledged: "Acknowledged",
  notAcknowledged: "Not Acknowledged",
  fillRequired: "Please fill in the required questions before continuing.",
  draftSaved: "Draft saved successfully! Your progress has been saved.",
  draftSaveFailed:
    "Unable to save your draft. Please check your internet connection and try again. Your progress may be lost if you leave this page.",
  loadFailed:
    "Unable to load the questionnaire. Please try refreshing the page or contact support if the issue persists.",
  loadFailedConn:
    "Failed to load the questionnaire. Please check your internet connection and try again. If the problem persists, contact support.",
  productFetchWarn:
    "Could not fetch product details. Please fill them in manually.",
  autoPopulateWarn:
    "Some product details could not be auto-populated. Please fill them in manually.",
  submitFailed: "Unable to submit the questionnaire. Please try again.",
  acknowledgeRequired: "Please acknowledge this to continue.",
};

const validation = {
  requiredCheckboxAck:
    "Please check this box to acknowledge {{number}}",
  requiredCheckbox:
    "This field is required. Please check the box to continue.",
  requiredAnswer: "Please answer {{number}}. This field is required.",
  requiredValue: "This field is required. Please provide a value.",
  email: "Please enter a valid email address (e.g., name@example.com)",
  minValue: "Please enter a value of at least {{min}}",
  maxValue: "Please enter a value that does not exceed {{max}}",
  exclusiveMin: "Please enter a value greater than {{min}}",
  maxLength: "Please limit your response to {{max}} characters or less",
};

const consent = {
  noticeTitle: "Data privacy (GDPR)",
  noticeBody:
    "All information provided is confidential and used only for corporate and product-level sustainability assessment.",
  reTechTitle: "Eligible technologies considered as renewable electricity (RE)",
  reTechIntro:
    "Please read the following technologies to be considered as renewable electricity (RE) and acknowledge them.",
  eligibleHeading: "Eligible technologies",
  excludedHeading: "Excluded technologies",
  reTechItems: [
    "Wind",
    "Hydro",
    "Solar power",
    "Geothermal",
    "Solid, liquid and gaseous biomass from fuels (woody waste, landfill gas, wastewater methane, animal & other organic waste, energy crops)",
    "Ocean-based energy resources captured through tidal and wave technologies",
  ],
  reTechExcluded: [
    "Electricity from nuclear power is not regarded as renewable electricity.",
    "Electricity from waste combustion is not regarded as renewable electricity.",
  ],
  reTechCheckbox:
    "I acknowledge that I have read and understood the eligible technologies considered as renewable electricity (RE) above.",
  procurementTitle: "Procurement mechanisms",
  procurementIntro:
    "Electricity is regarded as renewable if provided using one of the mechanisms below, respecting the requirements regarding double counting. Please review which apply to your processes. If none apply in the country where carbon emissions occur, an alternative locally accepted type of proof at the time of production may be used.",
  acronymsHeading: "Acronyms",
  acronyms: [
    "PPA: Power Purchase Agreements",
    "EAC: Energy Attribute Certificates",
    "iREC / I-REC: International Green Energy Certificates",
    "GOO: Guarantee of Origin",
  ],
  procurementHeading: "Procurement mechanisms",
  procurementItems: [
    "On-site generation: EACs generated",
    "On-site generation: no EACs generated",
    "Off-site generation: PPA / sleeved PPA (proof of delivery necessary)",
    "Off-site generation: virtual PPA (proof via EAC necessary)",
    "Off-site generation: green power tariff / green power product",
    "Power supplied by an electricity provider that takes over responsibility to provide the electricity either directly from renewable sources (e.g. through PPAs) or procures and deletes unbundled EACs for the supplied electricity",
    "Unbundled EACs",
    "Unbundled RECs / I-RECs",
  ],
  procurementCheckbox:
    "I acknowledge that I have read and understood the procurement mechanisms above.",
  doubleTitle: "Double counting",
  doubleIntro:
    "Please acknowledge that the mechanism you use does not fall under double counting. Examples of prohibited double uses include, but are not limited to:",
  doubleItems: [
    "When the same EAC is sold by one party to more than one party, or any case where another party has a conflicting contract for the EACs or the renewable electricity.",
    "When the same EAC is claimed by more than one party, including any expressed or implied environmental claims relating to renewable electricity, environmental labelling or disclosure requirements, e.g. representing the energy as renewable in another entity's product or portfolio resource mix for marketing or disclosure.",
    "When the same EAC is used by an electricity provider or utility to meet an environmental mandate (such as an RPS) and is also used to satisfy customer sales.",
    'Use of one or more attributes of the renewable energy or EAC by another party, e.g. an EAC simultaneously sold as "renewable electricity" to one party while one or more attributes of the same MWh (such as CO2 reduction) are sold to another party.',
  ],
  doubleCheckbox:
    "I acknowledge my mechanisms do not fall under double counting.",
};

function toTs(obj, indent = 0) {
  const sp = "  ".repeat(indent);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    const items = obj.map((v) => `${sp}  ${JSON.stringify(v)},`).join("\n");
    return `[\n${items}\n${sp}]`;
  }
  if (obj && typeof obj === "object") {
    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}";
    const lines = keys.map((k) => {
      const key = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? k : JSON.stringify(k);
      return `${sp}  ${key}: ${toTs(obj[k], indent + 1)},`;
    });
    return `{\n${lines.join("\n")}\n${sp}}`;
  }
  return JSON.stringify(obj);
}

const catalog = {
  ui,
  validation,
  consent,
  sections,
  questions,
  fields,
  options,
};

const ts = `/* Auto-generated English catalog — source of truth for keys. */
import type { QuestionnaireCatalog } from "../types";

const en: QuestionnaireCatalog = ${toTs(catalog)};

export default en;
`;

fs.mkdirSync("src/features/supplier-questionnaire/i18n/catalogs", {
  recursive: true,
});
fs.writeFileSync(
  "src/features/supplier-questionnaire/i18n/catalogs/en.ts",
  ts,
  "utf8"
);
fs.writeFileSync(
  "scripts/en-catalog.json",
  JSON.stringify(catalog, null, 2),
  "utf8"
);
console.log(
  "Wrote en.ts — sections",
  Object.keys(sections).length,
  "questions sections",
  Object.keys(questions).length,
  "q keys",
  Object.values(questions).reduce((n, o) => n + Object.keys(o).length, 0),
  "fields",
  Object.keys(fields).length,
  "options",
  Object.keys(options).length
);
