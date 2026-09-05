import fs from "fs";

const translations = {
  en: {
    "section_c_bom.8a":
      'Select "Yes" above to list each component / material and its emission factor.',
    "section_e_packaging.16":
      'Select "Yes — include packaging" in Q15 to list packaging materials.',
    "section_e_packaging.16a":
      'Select "Yes — include packaging" in Q15 to add packaging transport legs.',
    "section_e_packaging.17":
      'Select "Yes — include packaging" in Q15 to record packaging waste.',
    "section_e_packaging.17a":
      'Select "Yes — include packaging" in Q15 to add packaging-waste transport legs.',
    "section_f_transport.19":
      'Select "Yes — distribution is within my boundary" in Q18 to add transport legs.',
    "section_g_biobased.20":
      'Select "Yes" above to provide the bio-based feedstock details.',
  },
  hi: {
    "section_c_bom.8a":
      'प्रत्येक घटक / सामग्री और उसका उत्सर्जन कारक सूचीबद्ध करने के लिए ऊपर "हाँ" चुनें।',
    "section_e_packaging.16":
      'पैकेजिंग सामग्री सूचीबद्ध करने के लिए Q15 में "हाँ — पैकेजिंग शामिल करें" चुनें।',
    "section_e_packaging.16a":
      'पैकेजिंग परिवहन खंड जोड़ने के लिए Q15 में "हाँ — पैकेजिंग शामिल करें" चुनें।',
    "section_e_packaging.17":
      'पैकेजिंग अपशिष्ट दर्ज करने के लिए Q15 में "हाँ — पैकेजिंग शामिल करें" चुनें।',
    "section_e_packaging.17a":
      'पैकेजिंग-अपशिष्ट परिवहन खंड जोड़ने के लिए Q15 में "हाँ — पैकेजिंग शामिल करें" चुनें।',
    "section_f_transport.19":
      'परिवहन खंड जोड़ने के लिए Q18 में "हाँ — वितरण मेरी सीमा के भीतर है" चुनें।',
    "section_g_biobased.20":
      'बायो-आधारित फीडस्टॉक विवरण देने के लिए ऊपर "हाँ" चुनें।',
  },
  zh: {
    "section_c_bom.8a":
      "请在上方选择“是”，以列出各组件/材料及其排放因子。",
    "section_e_packaging.16":
      "请在问题15中选择“是 — 包含包装”，以列出包装材料。",
    "section_e_packaging.16a":
      "请在问题15中选择“是 — 包含包装”，以添加包装运输路段。",
    "section_e_packaging.17":
      "请在问题15中选择“是 — 包含包装”，以记录包装废弃物。",
    "section_e_packaging.17a":
      "请在问题15中选择“是 — 包含包装”，以添加包装废弃物运输路段。",
    "section_f_transport.19":
      "请在问题18中选择“是 — 配送在我的边界内”，以添加运输路段。",
    "section_g_biobased.20":
      "请在上方选择“是”，以提供生物基原料详情。",
  },
  de: {
    "section_c_bom.8a":
      "Wählen Sie oben „Ja“, um jede Komponente / jedes Material und seinen Emissionsfaktor aufzulisten.",
    "section_e_packaging.16":
      "Wählen Sie in F15 „Ja — Verpackung einbeziehen“, um Verpackungsmaterialien aufzulisten.",
    "section_e_packaging.16a":
      "Wählen Sie in F15 „Ja — Verpackung einbeziehen“, um Verpackungstransportabschnitte hinzuzufügen.",
    "section_e_packaging.17":
      "Wählen Sie in F15 „Ja — Verpackung einbeziehen“, um Verpackungsabfall zu erfassen.",
    "section_e_packaging.17a":
      "Wählen Sie in F15 „Ja — Verpackung einbeziehen“, um Transportabschnitte für Verpackungsabfall hinzuzufügen.",
    "section_f_transport.19":
      "Wählen Sie in F18 „Ja — Distribution liegt in meiner Systemgrenze“, um Transportabschnitte hinzuzufügen.",
    "section_g_biobased.20":
      "Wählen Sie oben „Ja“, um die Details zum biobasierten Rohstoff anzugeben.",
  },
};

for (const loc of Object.keys(translations)) {
  const file = `src/features/supplier-questionnaire/i18n/catalogs/${loc}.ts`;
  let s = fs.readFileSync(file, "utf8");
  const map = translations[loc];
  for (const [path, hint] of Object.entries(map)) {
    const [sec, num] = path.split(".");
    const qIdx = s.indexOf("questions:");
    const searchFrom = s.indexOf(`${sec}:`, qIdx);
    const numToken = `"${num}":`;
    const numIdx = s.indexOf(numToken, searchFrom);
    if (numIdx < 0) {
      console.log("missing num", loc, path);
      continue;
    }
    const braceStart = s.indexOf("{", numIdx);
    const chunk = s.slice(braceStart, braceStart + 500);
    if (chunk.includes("gateHint:")) {
      console.log("already", loc, path);
      continue;
    }
    const labelIdx = s.indexOf("label:", braceStart);
    const lineEnd = s.indexOf("\n", labelIdx);
    const labelIndent = s.slice(s.lastIndexOf("\n", labelIdx) + 1, labelIdx);
    const insertion = `${labelIndent}gateHint: ${JSON.stringify(hint)},\n`;
    s = s.slice(0, lineEnd + 1) + insertion + s.slice(lineEnd + 1);
    console.log("patched", loc, path);
  }
  fs.writeFileSync(file, s, "utf8");
}
