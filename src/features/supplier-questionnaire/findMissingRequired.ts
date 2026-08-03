/**
 * Walk the full questionnaire schema against merged form values and report
 * every visible required field that is still empty. Used before Preview /
 * Submit because Ant Design only validates currently mounted (current-step)
 * Form.Items — earlier incomplete sections would otherwise slip through.
 */
import type {
  QuestionnaireField,
  QuestionnaireSection,
} from "../../config/questionnaireSchema";
import { QUESTIONNAIRE_SCHEMA } from "../../config/questionnaireSchema";

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
};

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
      .filter(
        (c) =>
          c.required &&
          !c.readOnly &&
          depMet(c.dependency, values, row) &&
          !isCellFilled(row[c.name]),
      )
      .map((c) => c.label || c.name);

    if (missingCols.length) {
      incomplete.push(`row ${i + 1}: ${missingCols.join(", ")}`);
    } else {
      completeCount += 1;
    }
  });

  if (field.required && completeCount === 0) {
    return { ok: false, detail: incomplete[0] };
  }
  if (incomplete.length) {
    return { ok: false, detail: incomplete[0] };
  }
  return { ok: true };
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
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || typeof row !== "object") {
      return { ok: false, detail: `row ${i + 1}: incomplete` };
    }
    const missing = requiredColumns.filter((col) => !isCellFilled(row[col]));
    if (missing.length) {
      return { ok: false, detail: `row ${i + 1}: ${missing.join(", ")}` };
    }
  }
  return { ok: true };
};

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

      if (field.type === "table") {
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
        const items = getNested(values, mc.itemsPath);
        if (Array.isArray(items) && items.length >= 2) {
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
