/**
 * Q5 — Reference period, multi-component (Format A / Q2 style).
 *
 * One row per BOM component. Component name is locked (left column).
 * Reference period start and end are date pickers editable per component.
 *
 * Stored under `scope_period.reference_period_items[i].*`.
 * The end date auto-derives to start + 1 year − 1 day (same logic as the
 * single-component path in SupplierQuestionnaire).
 * When < 2 components the parent uses the original 5a/5b sub-fields.
 */
import React from "react";
import { Form, DatePicker, Input } from "antd";
import type { FormInstance } from "antd";
import dayjs from "dayjs";
import { C, REQ_TAG, ffStyle } from "./theme";
import { dateValueProps } from "./controls";

export type Q5BomComponent = {
  bom_id: string;
  material_number: string;
  component_name: string;
};

type Props = {
  bomComponents: Q5BomComponent[];
  form: FormInstance;
  isClientMode?: boolean;
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
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

/**
 * Start-date cell — updates this component's end date when changed
 * (start + 1 year − 1 day).
 */
const StartCell: React.FC<{
  rowIdx: number;
  form: FormInstance;
  isClientMode?: boolean;
}> = ({ rowIdx, form, isClientMode }) => (
  <Form.Item
    name={["scope_period", "reference_period_items", rowIdx, "reference_start"]}
    className="mb-0"
    noStyle
    rules={[{ required: true, message: "Reference period start is required." }]}
    {...dateValueProps}
  >
    <DatePicker
      format="DD/MM/YYYY"
      placeholder="Start date"
      disabled={isClientMode}
      style={{ ...ffStyle, width: "100%" }}
      onChange={(val) => {
        if (!val || !val.isValid()) return;
        const end = dayjs(val).add(1, "year").subtract(1, "day");
        const path = ["scope_period", "reference_period_items"];
        const arr = [...((form.getFieldValue(path) as any[]) || [])];
        arr[rowIdx] = { ...(arr[rowIdx] || {}), reference_end: end };
        form.setFieldValue(path, arr);
      }}
    />
  </Form.Item>
);

/** End-date cell — read-only (auto-derived from start). */
const EndCell: React.FC<{
  rowIdx: number;
  isClientMode?: boolean;
}> = ({ rowIdx }) => (
  <Form.Item
    name={["scope_period", "reference_period_items", rowIdx, "reference_end"]}
    className="mb-0"
    noStyle
    {...dateValueProps}
  >
    <DatePicker
      format="DD/MM/YYYY"
      placeholder="Auto (start + 1 year)"
      disabled
      style={{ ...ffStyle, width: "100%" }}
    />
  </Form.Item>
);

const Q5ReferencePeriod: React.FC<Props> = ({ bomComponents, form, isClientMode }) => (
    <div style={{ marginTop: 14, overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        minWidth: 560,
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
            Reference period: start <span style={REQ_TAG}>Req</span>
          </th>
          <th style={{ ...th, borderTopRightRadius: 12 }}>
            Reference period: end{" "}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                color: C.greenDark,
                background: C.greenSoft,
                border: "1px solid #bbf7d0",
                borderRadius: 6,
                padding: "2px 7px",
                whiteSpace: "nowrap",
                marginLeft: 4,
              }}
            >
              Auto
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {bomComponents.map((c, i) => (
          <tr key={c.bom_id} style={{ background: i % 2 === 0 ? "#fff" : C.panelBg }}>
            {/* Component label — locked */}
            <td style={{ ...td, minWidth: 150 }}>
              <div style={{ fontWeight: 700, color: C.text }}>{c.component_name || `Component ${i + 1}`}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{c.material_number}</div>
              <Form.Item
                name={["scope_period", "reference_period_items", i, "bom_id"]}
                noStyle
                initialValue={c.bom_id}
              >
                <Input type="hidden" />
              </Form.Item>
            </td>

            {/* Start date — editable, auto-fills end */}
            <td style={{ ...td, minWidth: 190 }}>
              <StartCell rowIdx={i} form={form} isClientMode={isClientMode} />
            </td>

            {/* End date — locked, auto-derived */}
            <td style={{ ...td, minWidth: 190 }}>
              <EndCell rowIdx={i} isClientMode={isClientMode} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Q5ReferencePeriod;
