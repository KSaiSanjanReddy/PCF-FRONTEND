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

const sections = [];
const sectionRe = /{\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)"/g;
let m;
while ((m = sectionRe.exec(src))) {
  sections.push({ id: m[1], title: m[2] });
}

// Field labels: prefer last occurrence for nested columns vs top-level fields
const fields = {};
const fieldRe = /name:\s*"([^"]+)",\s*label:\s*"((?:\\.|[^"\\])*)"/g;
while ((m = fieldRe.exec(src))) {
  const name = m[1];
  const label = m[2].replace(/\\"/g, '"');
  // Skip short column names that aren't dotted (region, country etc still needed)
  fields[name] = stripNum(label);
}

// LABEL_OVERRIDES
const overrides = {};
const ovRe = /"([^"]+)":\s*"([^"]+)"/g;
const ovBlock = layout.match(/LABEL_OVERRIDES[\s\S]*?=\{([\s\S]*?)\};/);
if (ovBlock) {
  while ((m = ovRe.exec(ovBlock[1]))) {
    overrides[m[1]] = m[2];
    fields[m[1]] = m[2];
  }
}

// Extract option string arrays from schema constants
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

const options = {};
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
// PACKAGING_INCLUDE / OUTBOUND_TRANSPORT label/value pairs
for (const name of ["PACKAGING_INCLUDE", "OUTBOUND_TRANSPORT"]) {
  const re = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`);
  const block = src.match(re);
  if (!block) continue;
  const pairRe = /label:\s*"((?:\\.|[^"\\])*)",\s*value:\s*"((?:\\.|[^"\\])*)"/g;
  while ((m = pairRe.exec(block[1]))) {
    const label = m[1].replace(/\\"/g, '"');
    const value = m[2].replace(/\\"/g, '"');
    options[value] = label; // translate by stored value → display label
    options[label] = label;
  }
}

const out = { sections, fields, options, overrides };
fs.writeFileSync("scripts/q-labels.json", JSON.stringify(out, null, 2), "utf8");
console.log(
  "sections",
  sections.length,
  "fields",
  Object.keys(fields).length,
  "options",
  Object.keys(options).length
);
