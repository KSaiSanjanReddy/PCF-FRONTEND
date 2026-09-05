/**
 * Q3 — Declared basis, multi-component (Format A style).
 *
 * One row per BOM component:
 *   Component (locked)
 *   Declared unit (editable, required)
 *   Declared quantity (from BOM; editable if BOM blank)
 *   Declared mass kg (from BOM; editable if BOM blank)
 *   Product price (from BOM; editable if BOM blank)
 *   Production period (editable, required)
 *
 * Stored under `product.q3_items[i].*`.
 * When < 2 components the parent uses the original 3a–3e sub-fields.
 */
import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select } from "antd";
import type { FormInstance } from "antd";
import { C, REQ_TAG, ffStyle } from "./theme";

export type Q3BomComponent = {
  bom_id: string;
  material_number: string;
  component_name: string;
  quantity?: number | string | null;
  price?: number | string | null;
  weight_kg?: number | string | null;
};

type Props = {
  bomComponents: Q3BomComponent[];
  form: FormInstance;
  isClientMode?: boolean;
};

const DECLARED_UNITS = [
  "piece",
  "kg",
  "g",
  "tonne",
  "litre",
  "millilitre",
  "metre",
  "square metre (m²)",
  "cubic metre (m³)",
  "kWh",
  "MJ",
  "pair",
  "set",
].map((v) => ({ value: v, label: v }));

const PRODUCTION_PERIODS = [
  { value: "Monthly", label: "Monthly" },
  { value: "Annually", label: "Annually" },
];

const FIELD_PATH = ["product", "q3_items"];

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".04em",
  textTransform: "uppercase",
  color: C.muted2,
  background: C.panelBg,
  borderBottom: `1px solid ${C.hairline}`,
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: `1px solid ${C.hairline}`,
  verticalAlign: "top",
};

const toNumber = (v: number | string | null | undefined): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const empty = (v: any) => v === undefined || v === null || v === "";

const Q3DeclaredBasis: React.FC<Props> = ({
  bomComponents,
  form,
  isClientMode,
}) => {
  // Seed locked/BOM-backed numbers into the form store (initialValue alone is
  // wiped by draft setFieldsValue). Unlockable cells stay editable when BOM
  // has no value so the user is never blocked by a disabled empty field.
  useEffect(() => {
    if (!bomComponents.length) return;
    bomComponents.forEach((c, i) => {
      const base = [...FIELD_PATH, i] as (string | number)[];
      const row = form.getFieldValue([...FIELD_PATH, i]) || {};
      if (empty(row.bom_id) && c.bom_id) {
        form.setFieldValue([...base, "bom_id"], c.bom_id);
      }
      const qty = toNumber(c.quantity);
      if (empty(row.declared_unit_quantity) && qty !== undefined) {
        form.setFieldValue([...base, "declared_unit_quantity"], qty);
      }
      const mass = toNumber(c.weight_kg);
      if (empty(row.declared_mass) && mass !== undefined) {
        form.setFieldValue([...base, "declared_mass"], mass);
      }
      const price = toNumber(c.price);
      if (empty(row.price) && price !== undefined) {
        form.setFieldValue([...base, "price"], price);
      }
    });
  }, [bomComponents, form]);

  return (
    <div style={{ marginTop: 14, overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          minWidth: 980,
          fontSize: 13,
          background: "#fff",
          border: `1px solid ${C.hairline}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <thead>
          <tr>
            <th style={{ ...th, borderTopLeftRadius: 12 }}>Component</th>
            <th style={th}>
              Declared unit <span style={REQ_TAG}>Req</span>
            </th>
            <th style={th}>
              Declared quantity <span style={REQ_TAG}>Req</span>
            </th>
            <th style={th}>
              Mass (kg) <span style={REQ_TAG}>Req</span>
            </th>
            <th style={th}>
              Product price <span style={REQ_TAG}>Req</span>
            </th>
            <th style={{ ...th, borderTopRightRadius: 12 }}>
              Production period <span style={REQ_TAG}>Req</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {bomComponents.map((c, i) => {
            const qtyFromBom = toNumber(c.quantity);
            const massFromBom = toNumber(c.weight_kg);
            const priceFromBom = toNumber(c.price);
            return (
              <tr key={c.bom_id} style={{ background: i % 2 === 0 ? "#fff" : C.panelBg }}>
                <td style={{ ...td, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, color: C.text }}>
                    {c.component_name || `Component ${i + 1}`}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                    {c.material_number}
                  </div>
                  <Form.Item
                    name={[...FIELD_PATH, i, "bom_id"]}
                    noStyle
                    initialValue={c.bom_id}
                  >
                    <Input type="hidden" />
                  </Form.Item>
                </td>

                <td style={{ ...td, minWidth: 170 }}>
                  <Form.Item
                    name={[...FIELD_PATH, i, "declared_unit"]}
                    className="mb-0"
                    noStyle
                    rules={[{ required: true, message: "Required." }]}
                  >
                    <Select
                      options={DECLARED_UNITS}
                      placeholder="Select unit"
                      disabled={isClientMode}
                      popupMatchSelectWidth={false}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </td>

                <td style={{ ...td, minWidth: 140 }}>
                  <Form.Item
                    name={[...FIELD_PATH, i, "declared_unit_quantity"]}
                    className="mb-0"
                    noStyle
                    initialValue={qtyFromBom}
                    rules={[{ required: true, message: "Required." }]}
                  >
                    <InputNumber
                      min={0}
                      disabled={isClientMode || qtyFromBom !== undefined}
                      controls={false}
                      style={{ ...ffStyle, width: "100%" }}
                    />
                  </Form.Item>
                </td>

                <td style={{ ...td, minWidth: 140 }}>
                  <Form.Item
                    name={[...FIELD_PATH, i, "declared_mass"]}
                    className="mb-0"
                    noStyle
                    initialValue={massFromBom}
                    rules={[{ required: true, message: "Required." }]}
                  >
                    <InputNumber
                      min={0}
                      disabled={isClientMode || massFromBom !== undefined}
                      controls={false}
                      style={{ ...ffStyle, width: "100%" }}
                    />
                  </Form.Item>
                </td>

                <td style={{ ...td, minWidth: 140 }}>
                  <Form.Item
                    name={[...FIELD_PATH, i, "price"]}
                    className="mb-0"
                    noStyle
                    initialValue={priceFromBom}
                    rules={[{ required: true, message: "Required." }]}
                  >
                    <InputNumber
                      min={0}
                      disabled={isClientMode || priceFromBom !== undefined}
                      controls={false}
                      style={{ ...ffStyle, width: "100%" }}
                    />
                  </Form.Item>
                </td>

                <td style={{ ...td, minWidth: 160 }}>
                  <Form.Item
                    name={[...FIELD_PATH, i, "production_period"]}
                    className="mb-0"
                    noStyle
                    rules={[{ required: true, message: "Required." }]}
                  >
                    <Select
                      options={PRODUCTION_PERIODS}
                      placeholder="Select period"
                      disabled={isClientMode}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Q3DeclaredBasis;
