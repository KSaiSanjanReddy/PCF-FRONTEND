import fs from "fs";

for (const loc of ["hi", "zh", "de"]) {
  const f = `src/features/supplier-questionnaire/i18n/catalogs/${loc}.ts`;
  let s = fs.readFileSync(f, "utf8");
  // Accidental literal \n sequences from a buggy patch
  s = s.split("\\n").join("\n");
  fs.writeFileSync(f, s, "utf8");
  console.log("fixed", loc);
}
