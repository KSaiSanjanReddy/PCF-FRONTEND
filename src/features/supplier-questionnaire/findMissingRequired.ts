/**
 * Walk the full questionnaire schema against merged form values and report
 * every visible required field that is still empty. Used before Preview /
 * Submit because Ant Design only validates currently mounted (current-step)
 * Form.Items — earlier incomplete sections would otherwise slip through.
 *
 * Multi-component (≥2 BOM rows): several questions store answers in per-
 * component `*_items` arrays instead of the schema scalar/table paths.
 * Validation must read those arrays or filled UIs look "incomplete".
 */
import type {
  QuestionnaireField,
  QuestionnaireSection,
} from "../../config/questionnaireSchema";
import { QUESTIONNAIRE_SCHEMA } from "../../config/questionnaireSchema";
import { q8MaterialLabels, isQ8Material } from "./q8Materials";

export type MissingRequiredItem = {
  stepIndex: number;
  sectionId: string;
  sectionTitle: string;
  fieldName: string;
  /** Short label for the toast/modal, e.g. "Q10" or "Contact person". */
  questionLabel: string;
  /** Extra detail for partial tables, e.g. "row 1: Geography, Quantity". */
  detail?: string;
};

/**
 * When >= 2 BOM components, some questions store answers in per-component
 * item arrays instead of the schema scalar paths. Map scalar field → items.
 */
const MULTI_COMPONENT_ITEM_FIELDS: Record<
  string,
  { itemsPath: string; column: string; questionLabel: string }
> = {
  // Q2 — product identity per component
  "product.name": {
    itemsPath: "product.items",
    column: "name",
    questionLabel: "Q2",
  },
  "product.product_id": {
    itemsPath: "product.items",
    column: "product_id",
    questionLabel: "Q2",
  },
  // Q3
  "product.declared_unit": {
    itemsPath: "product.q3_items",
    column: "declared_unit",
    questionLabel: "Q3",
  },
  "product.declared_unit_quantity": {
    itemsPath: "product.q3_items",
    column: "declared_unit_quantity",
    questionLabel: "Q3",
  },
  "product.declared_mass": {
    itemsPath: "product.q3_items",
    column: "declared_mass",
    questionLabel: "Q3",
  },
  "product.price": {
    itemsPath: "product.q3_items",
    column: "price",
    questionLabel: "Q3",
  },
  "product.production_period": {
    itemsPath: "product.q3_items",
    column: "production_period",
    questionLabel: "Q3",
  },
  // Q5
  "scope_period.reference_start": {
    itemsPath: "scope_period.reference_period_items",
    column: "reference_start",
    questionLabel: "Q5",
  },
  "scope_period.reference_end": {
    itemsPath: "scope_period.reference_period_items",
    column: "reference_end",
    questionLabel: "Q5",
  },
  // Q24 (Section I)
  "boundary.ccs_ccu_used": {
    itemsPath: "boundary.q24_items",
    column: "ccs_ccu_used",
    questionLabel: "Q24",
  },
  "boundary.excluded_flows": {
    itemsPath: "boundary.q24_items",
    column: "excluded_flows",
    questionLabel: "Q24",
  },
  "boundary.exempted_percent": {
    itemsPath: "boundary.q24_items",
    column: "exempted_percent",
    questionLabel: "Q24",
  },
  // Q26 — always-required Yes/No gates
  "verification.product_certified": {
    itemsPath: "verification.q26_items",
    column: "product_certified",
    questionLabel: "Q26",
  },
  "verification.pcf_verified": {
    itemsPath: "verification.q26_items",
    column: "pcf_verified",
    questionLabel: "Q26",
  },
};

/**
 * Schema table fields that switch to a per-component items array when
 * multi-component mode is active (same columns, different path).
 */
const MULTI_COMPONENT_TABLE_FIELDS: Record<
  string,
  { itemsPath: string; questionLabel: string }
> = {
  "product.manufacturing_sites": {
    itemsPath: "product.manufacturing_sites_items",
    questionLabel: "Q4",
  },
  // Optional tables — remap so we don't inspect the empty schema path
  "bom.component_ef_details": {
    itemsPath: "bom.component_ef_items",
    questionLabel: "Q8a",
  },
  "biobased.details": {
    itemsPath: "biobased.feedstock_items",
    questionLabel: "Q20",
  },
  "verification.volumes": {
    itemsPath: "verification.q27_items",
    questionLabel: "Q27",
  },
};

/**
 * Extra required columns on an items row when a gate column equals a value
 * (e.g. Q26 attestation fields only when pcf_verified === "Yes").
 */
const MULTI_COMPONENT_CONDITIONAL: Record<
  string,
  Array<{ whenColumn: string; whenValue: string; columns: string[] }>
> = {
  "verification.q26_items": [
    {
      whenColumn: "pcf_verified",
      whenValue: "Yes",
      columns: [
        "attestation_scheme_standard",
        "attestation_id",
        "attestation_issuer",
      ],
    },
  ],
};

/** Schema fields under verification.* that are covered by q26_items when multi. */
const Q26_SCHEMA_PREFIX = "verification.";

const getNested = (obj: any, path: string): any =>
  path.split(".").reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, obj);

const isCellFilled = (v: any): boolean => {
  if (v === undefined || v === null || v === "") return false;
  if (Array.isArray(v) && v.length === 0) return false;
  if (typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
    // dayjs / Date-like
    if (typeof (v as any).isValid === "function") {
      return (v as any).isValid();
    }
    return Object.values(v).some(isCellFilled);
  }
  return true;
};

const depMet = (
  dep: QuestionnaireField["dependency"],
  values: any,
  row?: Record<string, any>,
): boolean => {
  if (!dep) return true;
  // Table column deps are sibling-relative; top-level deps use absolute paths.
  const depVal =
    row && dep.field in row && !dep.field.includes(".")
      ? row[dep.field]
      : getNested(values, dep.field);
  if (depVal === undefined || depVal === null || depVal === "") return false;
  const expected = dep.value;
  if (dep.operator === "contains") {
    return Array.isArray(depVal) && depVal.includes(expected);
  }
  if (typeof expected === "boolean") {
    const b =
      typeof depVal === "string"
        ? depVal.toLowerCase() === "yes" || depVal.toLowerCase() === "true"
        : Boolean(depVal);
    return b === expected;
  }
  if (Array.isArray(depVal)) return depVal.includes(expected);
  return String(depVal).toLowerCase() === String(expected).toLowerCase();
};

const isFieldVisible = (field: QuestionnaireField, values: any): boolean =>
  depMet(field.dependency, values);

const questionLabelFor = (field: QuestionnaireField): string => {
  const m = field.label?.match(/^(\d+(?:\.\d+)?)[a-z]?\.?/i);
  if (m) return `Q${m[1]}`;
  const stripped = (field.label || "")
    .replace(/^\d+(\.\d+)?[a-z]?\.?\s*/i, "")
    .replace(/\s*\((optional)\)\s*$/i, "")
    .trim();
  if (!stripped) return field.name;
  return stripped.length > 64 ? `${stripped.slice(0, 61)}…` : stripped;
};

const isScalarAnswered = (field: QuestionnaireField, value: any): boolean => {
  if (field.type === "checkbox" && field.options) {
    return Array.isArray(value) && value.length > 0;
  }
  if (field.type === "checkbox") {
    return value === true;
  }
  return isCellFilled(value);
};

const tableStatus = (
  field: QuestionnaireField,
  rows: any,
  values: any,
): { ok: boolean; detail?: string } => {
  const columns = field.columns || [];
  const list = Array.isArray(rows) ? rows : [];
  let completeCount = 0;
  const incomplete: string[] = [];

  list.forEach((row, i) => {
    if (!row || typeof row !== "object") return;
    const hasAny = columns.some((c) => isCellFilled(row[c.name]));
    if (!hasAny) return;

    const missingCols = columns
      .filter((c) => {
        if (!c.required || c.readOnly) return false;
        if (!depMet(c.dependency, values, row)) return false;
        // Q14 factory-level qty/unit: only the first row is editable.
        if (c.sameAsFirstRow && i > 0) return false;
        // Auto-distance (Q19 etc.): UI shows km from coords but the store can
        // lag. Treat as filled when both endpoints are present.
        if (
          (c as any).autoDistance &&
          isCellFilled(row.source) &&
          isCellFilled(row.destination)
        ) {
          return false;
        }
        return !isCellFilled(row[c.name]);
      })
      .map((c) => c.label || c.name);

    if (missingCols.length) {
      incomplete.push(`row ${i + 1}: ${missingCols.join(", ")}`);
    } else {
      completeCount += 1;
    }
  });

  // Q14 Waste Material must be one of the materials listed in Q8.
  const q8OnlyCols = columns.filter((c) => c.q8MaterialsOnly);
  if (q8OnlyCols.length) {
    const allowed = q8MaterialLabels(getNested(values, "bom.bill_of_materials"));
    if (allowed.length) {
      list.forEach((row, i) => {
        if (!row || typeof row !== "object") return;
        for (const c of q8OnlyCols) {
          if (!isCellFilled(row[c.name])) continue;
          if (!isQ8Material(row[c.name], allowed)) {
            incomplete.push(
              `row ${i + 1}: ${c.label || c.name} must match question 8`,
            );
          }
        }
      });
    }
  }

  if (field.required && completeCount === 0) {
    return { ok: false, detail: incomplete[0] };
  }
  if (incomplete.length) {
    return { ok: false, detail: incomplete[0] };
  }
  return { ok: true };
};

const isMultiItemsActive = (values: any, itemsPath: string): boolean => {
  const rows = getNested(values, itemsPath);
  return Array.isArray(rows) && rows.length >= 2;
};

/** Validate a multi-component items array for required columns. */
const multiComponentItemsStatus = (
  values: any,
  itemsPath: string,
  requiredColumns: string[],
): { ok: boolean; detail?: string } => {
  const rows = getNested(values, itemsPath);
  if (!Array.isArray(rows) || rows.length < 2) {
    return { ok: false, detail: "per-component answers missing" };
  }
  const conditionals = MULTI_COMPONENT_CONDITIONAL[itemsPath] ?? [];
  const isQ5Period = itemsPath === "scope_period.reference_period_items";

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || typeof row !== "object") {
      return { ok: false, detail: `row ${i + 1}: incomplete` };
    }
    const missing = requiredColumns.filter((col) => {
      // Q5 end is auto-derived from start (start + 1 year − 1 day). Treat it
      // as answered when start is filled so stale drafts / placeholder UI
      // ("Auto (start + 1 year)") do not block submit.
      if (
        isQ5Period &&
        col === "reference_end" &&
        isCellFilled(row.reference_start)
      ) {
        return false;
      }
      return !isCellFilled(row[col]);
    });
    if (missing.length) {
      return { ok: false, detail: `row ${i + 1}: ${missing.join(", ")}` };
    }
    for (const rule of conditionals) {
      const gate = String(row[rule.whenColumn] ?? "").toLowerCase();
      if (gate !== rule.whenValue.toLowerCase()) continue;
      const missCond = rule.columns.filter((col) => !isCellFilled(row[col]));
      if (missCond.length) {
        return { ok: false, detail: `row ${i + 1}: ${missCond.join(", ")}` };
      }
    }
  }
  return { ok: true };
};

/**
 * True when a schema field is satisfied under multi-component storage
 * (used by progress / step-completion checks).
 */
export function isMultiComponentFieldAnswered(
  fieldName: string,
  fieldType: string | undefined,
  values: Record<string, any>,
): boolean | null {
  const tableRemap = MULTI_COMPONENT_TABLE_FIELDS[fieldName];
  if (tableRemap && isMultiItemsActive(values, tableRemap.itemsPath)) {
    const rows = getNested(values, tableRemap.itemsPath);
    if (!Array.isArray(rows) || rows.length < 2) return false;

    // Q4 sites — region + country required on every row.
    if (tableRemap.itemsPath === "product.manufacturing_sites_items") {
      return rows.every(
        (row) =>
          row &&
          typeof row === "object" &&
          isCellFilled(row.region) &&
          isCellFilled(row.country),
      );
    }

    // Optional remapped tables (Q8a / Q20 / Q27): count as answered when at
    // least one row has any real cell value (same as single-component tables).
    return rows.some(
      (row) =>
        row &&
        typeof row === "object" &&
        Object.values(row).some(isCellFilled),
    );
  }

  const mc = MULTI_COMPONENT_ITEM_FIELDS[fieldName];
  if (mc && isMultiItemsActive(values, mc.itemsPath)) {
    const cols = Object.values(MULTI_COMPONENT_ITEM_FIELDS)
      .filter((x) => x.itemsPath === mc.itemsPath)
      .map((x) => x.column);
    return multiComponentItemsStatus(values, mc.itemsPath, cols).ok;
  }

  // Other verification.* scalars when q26_items is active — covered by Q26 group.
  if (
    fieldName.startsWith(Q26_SCHEMA_PREFIX) &&
    isMultiItemsActive(values, "verification.q26_items")
  ) {
    const cols = Object.values(MULTI_COMPONENT_ITEM_FIELDS)
      .filter((x) => x.itemsPath === "verification.q26_items")
      .map((x) => x.column);
    return multiComponentItemsStatus(values, "verification.q26_items", cols).ok;
  }

  void fieldType;
  return null; // not a multi-component remap — caller uses normal logic
}

export function findMissingRequired(
  values: Record<string, any>,
  sections: QuestionnaireSection[] = QUESTIONNAIRE_SCHEMA,
): MissingRequiredItem[] {
  const missing: MissingRequiredItem[] = [];
  const checkedItemPaths = new Set<string>();

  sections.forEach((section, stepIndex) => {
    section.fields.forEach((field) => {
      if (field.type === "info") return;
      if (!isFieldVisible(field, values)) return;

      // --- Tables (incl. Q4 multi-component sites) ---
      if (field.type === "table") {
        const tableRemap = MULTI_COMPONENT_TABLE_FIELDS[field.name];
        if (tableRemap && isMultiItemsActive(values, tableRemap.itemsPath)) {
          const status = tableStatus(
            field,
            getNested(values, tableRemap.itemsPath),
            values,
          );
          if (!status.ok) {
            missing.push({
              stepIndex,
              sectionId: section.id,
              sectionTitle: section.title,
              fieldName: tableRemap.itemsPath,
              questionLabel: tableRemap.questionLabel,
              detail: status.detail,
            });
          }
          return;
        }

        const status = tableStatus(field, getNested(values, field.name), values);
        if (!status.ok) {
          missing.push({
            stepIndex,
            sectionId: section.id,
            sectionTitle: section.title,
            fieldName: field.name,
            questionLabel: questionLabelFor(field),
            detail: status.detail,
          });
        }
        return;
      }

      // Non-table: only enforce when marked required.
      if (!field.required) return;

      // Multi-component override: validate item rows once per itemsPath.
      const mc = MULTI_COMPONENT_ITEM_FIELDS[field.name];
      if (mc) {
        if (isMultiItemsActive(values, mc.itemsPath)) {
          if (!checkedItemPaths.has(mc.itemsPath)) {
            checkedItemPaths.add(mc.itemsPath);
            const cols = Object.values(MULTI_COMPONENT_ITEM_FIELDS)
              .filter((x) => x.itemsPath === mc.itemsPath)
              .map((x) => x.column);
            const status = multiComponentItemsStatus(values, mc.itemsPath, cols);
            if (!status.ok) {
              missing.push({
                stepIndex,
                sectionId: section.id,
                sectionTitle: section.title,
                fieldName: mc.itemsPath,
                questionLabel: mc.questionLabel,
                detail: status.detail,
              });
            }
          }
          return;
        }
      }

      // Q26 follow-up scalars (attestation_*) — when multi-component, skip
      // schema-path checks (deps point at empty scalars). Covered by the
      // q26_items group + conditional columns above.
      if (
        field.name.startsWith(Q26_SCHEMA_PREFIX) &&
        isMultiItemsActive(values, "verification.q26_items")
      ) {
        return;
      }

      if (!isScalarAnswered(field, getNested(values, field.name))) {
        missing.push({
          stepIndex,
          sectionId: section.id,
          sectionTitle: section.title,
          fieldName: field.name,
          questionLabel: questionLabelFor(field),
        });
      }
    });
  });

  return missing;
}

/** Group missing items by section (preserving first-seen order). */
export function groupMissingBySection(
  missing: MissingRequiredItem[],
): Array<{
  stepIndex: number;
  sectionId: string;
  sectionTitle: string;
  items: MissingRequiredItem[];
}> {
  const order: string[] = [];
  const map = new Map<
    string,
    {
      stepIndex: number;
      sectionId: string;
      sectionTitle: string;
      items: MissingRequiredItem[];
    }
  >();

  for (const item of missing) {
    if (!map.has(item.sectionId)) {
      order.push(item.sectionId);
      map.set(item.sectionId, {
        stepIndex: item.stepIndex,
        sectionId: item.sectionId,
        sectionTitle: item.sectionTitle,
        items: [],
      });
    }
    map.get(item.sectionId)!.items.push(item);
  }

  return order.map((id) => map.get(id)!);
}
