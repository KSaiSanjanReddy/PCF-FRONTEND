/**
 * Q3 — Declared basis, multi-component (Format A style).
 *
 * One row per BOM component:
 *   Component (locked)
 *   Declared unit (editable, required)
 *   Declared quantity (locked from BOM)
 *   Declared mass kg (locked from BOM)
 *   Product price (locked from BOM)
 *   Production period (editable, required)
 *
 * Stored under `product.q3_items[i].*`.
 * When < 2 components the parent uses the original 3a–3e sub-fields.
 */
import React from "react";
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

const Q3DeclaredBasis: React.FC<Props> = ({
  bomComponents,
  form,
  isClientMode,
}) => (
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
        {bomComponents.map((c, i) => (
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

            {/* 3a — Declared unit (editable) */}
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

            {/* 3b — Declared quantity (locked from BOM) */}
            <td style={{ ...td, minWidth: 140 }}>
              <Form.Item
                name={[...FIELD_PATH, i, "declared_unit_quantity"]}
                className="mb-0"
                noStyle
                initialValue={toNumber(c.quantity)}
                rules={[{ required: true, message: "Required." }]}
              >
                <InputNumber
                  min={0}
                  disabled
                  controls={false}
                  style={{ ...ffStyle, width: "100%" }}
                />
              </Form.Item>
            </td>

            {/* 3c — Declared mass (locked from BOM) */}
            <td style={{ ...td, minWidth: 140 }}>
              <Form.Item
                name={[...FIELD_PATH, i, "declared_mass"]}
                className="mb-0"
                noStyle
                initialValue={toNumber(c.weight_kg)}
                rules={[{ required: true, message: "Required." }]}
              >
                <InputNumber
                  min={0}
                  disabled
                  controls={false}
                  style={{ ...ffStyle, width: "100%" }}
                />
              </Form.Item>
            </td>

            {/* 3d — Product price (locked from BOM) */}
            <td style={{ ...td, minWidth: 140 }}>
              <Form.Item
                name={[...FIELD_PATH, i, "price"]}
                className="mb-0"
                noStyle
                initialValue={toNumber(c.price)}
                rules={[{ required: true, message: "Required." }]}
              >
                <InputNumber
                  min={0}
                  disabled
                  controls={false}
                  style={{ ...ffStyle, width: "100%" }}
                />
              </Form.Item>
            </td>

            {/* 3e — Production period (editable) */}
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
        ))}
      </tbody>
    </table>
  </div>
);

export default Q3DeclaredBasis;
