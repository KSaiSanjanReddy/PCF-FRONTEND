/**
 * Q24 — Assessment boundary & carbon capture, multi-component (Format A style).
 *
 * One row per BOM component. All 4 sub-fields inline:
 *   24a — Processes inside the boundary (textarea)
 *   24b — CCS/CCU CO₂ capture used? (Y/N)
 *   24c — Excluded (cut-off) flows (textarea)
 *   24d — Exempted emissions % of total PCF (number, max 3)
 *
 * Stored under `boundary.q24_items[i].*`.
 * When < 2 components the parent uses the original 24a–24d sub-fields.
 */
import React from "react";
import { Form, Input, Select, InputNumber } from "antd";
import type { FormInstance } from "antd";
import { C, REQ_TAG, OPT_TAG, ffStyle } from "./theme";

export type Q24BomComponent = {
  bom_id: string;
  material_number: string;
  component_name: string;
};

type Props = {
  bomComponents: Q24BomComponent[];
  form: FormInstance;
  isClientMode?: boolean;
};

const YES_NO = [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }];

const TABLE_SELECT_POPUP = {
  popupMatchSelectWidth: false as const,
  dropdownStyle: { maxWidth: 160 } as React.CSSProperties,
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
  verticalAlign: "top",
};

const FIELD_PATH = ["boundary", "q24_items"];

const Q24Boundary: React.FC<Props> = ({ bomComponents, form, isClientMode }) => (
  <div style={{ marginTop: 14, overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        minWidth: 760,
        fontSize: 13,
        background: "#fff",
        border: `1px solid ${C.hairline}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <thead>
        <tr>
          <th style={{ ...th, borderTopLeftRadius: 12, minWidth: 150 }}>Component</th>
          <th style={{ ...th, minWidth: 200 }}>
            24a — Processes inside boundary <span style={OPT_TAG}>Optional</span>
          </th>
          <th style={{ ...th, minWidth: 130 }}>
            24b — CCS / CCU used? <span style={REQ_TAG}>Req</span>
          </th>
          <th style={{ ...th, minWidth: 200 }}>
            24c — Excluded flows <span style={REQ_TAG}>Req</span>
          </th>
          <th style={{ ...th, borderTopRightRadius: 12, minWidth: 150 }}>
            24d — Exempted % of PCF <span style={REQ_TAG}>Req</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {bomComponents.map((c, i) => (
          <tr key={c.bom_id} style={{ background: i % 2 === 0 ? "#fff" : C.panelBg }}>
            {/* Component label — locked */}
            <td style={{ ...td, minWidth: 150 }}>
              <div style={{ fontWeight: 700, color: C.text }}>
                {c.component_name || `Component ${i + 1}`}
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                {c.material_number}
              </div>
              <Form.Item name={[...FIELD_PATH, i, "bom_id"]} noStyle initialValue={c.bom_id}>
                <Input type="hidden" />
              </Form.Item>
            </td>

            {/* 24a — Processes inside boundary */}
            <td style={{ ...td, minWidth: 200 }}>
              <Form.Item name={[...FIELD_PATH, i, "processes_inside"]} className="mb-0" noStyle>
                <Input.TextArea
                  rows={2}
                  placeholder="List the processes covered"
                  disabled={isClientMode}
                  style={ffStyle}
                />
              </Form.Item>
            </td>

            {/* 24b — CCS/CCU used? */}
            <td style={{ ...td, minWidth: 130 }}>
              <Form.Item
                name={[...FIELD_PATH, i, "ccs_ccu_used"]}
                className="mb-0"
                noStyle
                rules={[{ required: true, message: "Required." }]}
              >
                <Select
                  placeholder="Yes / No"
                  disabled={isClientMode}
                  {...TABLE_SELECT_POPUP}
                  options={YES_NO}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </td>

            {/* 24c — Excluded flows */}
            <td style={{ ...td, minWidth: 200 }}>
              <Form.Item
                name={[...FIELD_PATH, i, "excluded_flows"]}
                className="mb-0"
                noStyle
                rules={[{ required: true, message: "Required." }]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Excluded flows, or 'No exemption'"
                  disabled={isClientMode}
                  style={ffStyle}
                />
              </Form.Item>
            </td>

            {/* 24d — Exempted % */}
            <td style={{ ...td, minWidth: 150 }}>
              <Form.Item
                name={[...FIELD_PATH, i, "exempted_percent"]}
                className="mb-0"
                noStyle
                rules={[{ required: true, message: "Required." }]}
              >
                <InputNumber
                  placeholder="0 – 3%"
                  min={0}
                  max={3}
                  disabled={isClientMode}
                  style={{ ...ffStyle, width: "100%" }}
                />
              </Form.Item>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                Must be ≤ 3% of total PCF
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Q24Boundary;
