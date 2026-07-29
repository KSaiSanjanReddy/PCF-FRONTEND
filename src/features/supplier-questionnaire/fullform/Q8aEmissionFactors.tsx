/**
 * Q8a — Component/material emission factors, multi-component (Format A style).
 *
 * Shown only when bom.component_specific_ef_available = "Yes".
 * One row per BOM component: component name locked on left, Supplier EF
 * editable on the right — same table style as Q2/Q4/Q5.
 *
 * Stored under `bom.component_ef_items[i].*`.
 * When < 2 components the parent uses the original add-row table instead.
 */
import React from "react";
import { Form, Input } from "antd";
import type { FormInstance } from "antd";
import { C, OPT_TAG, ffStyle } from "./theme";

export type Q8aBomComponent = {
  bom_id: string;
  material_number: string;
  component_name: string;
};

type Props = {
  bomComponents: Q8aBomComponent[];
  form: FormInstance;
  isClientMode?: boolean;
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".04em",
  textTransform: "uppercase" as const,
  color: C.muted2,
  background: C.panelBg,
  borderBottom: `1px solid ${C.hairline}`,
  whiteSpace: "nowrap" as const,
};

const td: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: `1px solid ${C.hairline}`,
  verticalAlign: "middle",
};

const Q8aEmissionFactors: React.FC<Props> = ({ bomComponents, form, isClientMode }) => (
  <div style={{ overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        minWidth: 480,
        fontSize: 13,
        background: "#fff",
        border: `1px solid ${C.hairline}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <thead>
        <tr>
          <th style={{ ...th, borderTopLeftRadius: 12 }}>Component / Material</th>
          <th style={{ ...th, borderTopRightRadius: 12 }}>
            Supplier EF{" "}
            <span style={OPT_TAG}>Optional</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {bomComponents.map((c, i) => (
          <tr key={c.bom_id} style={{ background: i % 2 === 0 ? "#fff" : C.panelBg }}>
            {/* Component label — locked */}
            <td style={{ ...td, minWidth: 180 }}>
              <div style={{ fontWeight: 700, color: C.text }}>
                {c.component_name || `Component ${i + 1}`}
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                {c.material_number}
              </div>
              <Form.Item
                name={["bom", "component_ef_items", i, "bom_id"]}
                noStyle
                initialValue={c.bom_id}
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                name={["bom", "component_ef_items", i, "component_material_name"]}
                noStyle
                initialValue={c.component_name}
              >
                <Input type="hidden" />
              </Form.Item>
            </td>

            {/* Supplier EF — editable */}
            <td style={{ ...td, minWidth: 220 }}>
              <Form.Item
                name={["bom", "component_ef_items", i, "supplier_ef"]}
                className="mb-0"
                noStyle
              >
                <Input
                  placeholder="e.g. 2.5 kgCO₂e/kg"
                  disabled={isClientMode}
                  style={ffStyle}
                />
              </Form.Item>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Q8aEmissionFactors;
