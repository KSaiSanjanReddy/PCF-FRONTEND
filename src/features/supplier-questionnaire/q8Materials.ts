/**
 * Distinct Q8 BOM material labels, in the order the supplier entered them.
 * Used by Q14 Waste Material so the supplier can only list those same materials.
 *
 * Label is the most specific filled taxonomy field on the Q8 row
 * (Specific Type → Group → Sub category → Category).
 */
export function q8MaterialLabel(row: any): string {
  return (
    [
      row?.specific_type,
      row?.group,
      row?.sub_category,
      row?.material,
    ]
      .map((v) => String(v ?? "").trim())
      .find(Boolean) || ""
  );
}

export function q8MaterialLabels(rows: any[] | undefined | null): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    const label = q8MaterialLabel(row);
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

export function isQ8Material(value: unknown, allowed: string[]): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (!allowed.length) return true;
  const v = String(value).trim().toLowerCase();
  return allowed.some((m) => m.toLowerCase() === v);
}
