/**
 * Q25 — Data quality rating, multi-component (Format A style).
 *
 * One row per BOM component. All 6 sub-fields inline:
 *   25a — Primary data share (%)
 *   25b — Secondary EF source
 *   25c — Year data was collected
 *   25d — Technological DQR (1–5)
 *   25e — Geographical DQR (1–5)
 *   25f — Temporal DQR (1–5)
 *
 * Stored under `dqr.q25_items[i].*`.
 * When < 2 components the parent uses the original 25a–25f sub-fields.
 */
import React from "react";
import { Form, Input, Select, InputNumber } from "antd";
import type { FormInstance } from "antd";
import { C, OPT_TAG, ffStyle } from "./theme";

export type Q25BomComponent = {
  bom_id: string;
  material_number: string;
  component_name: string;
};

type Props = {
  bomComponents: Q25BomComponent[];
  form: FormInstance;
  isClientMode?: boolean;
};

const DQR_SCALE = ["1", "2", "3", "4", "5"];

const TABLE_SELECT_POPUP = {
  popupMatchSelectWidth: false as const,
  dropdownStyle: { maxWidth: 120 } as React.CSSProperties,
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

const FIELD_PATH = ["dqr", "q25_items"];

const DqrSelect: React.FC<{
  rowIdx: number;
  fieldName: string;
  isClientMode?: boolean;
}> = ({ rowIdx, fieldName, isClientMode }) => (
  <Form.Item name={[...FIELD_PATH, rowIdx, fieldName]} className="mb-0" noStyle>
    <Select
      placeholder="1–5"
      allowClear
      disabled={isClientMode}
      {...TABLE_SELECT_POPUP}
      options={DQR_SCALE.map((v) => ({ value: v, label: `${v}${v === "1" ? " (best)" : v === "5" ? " (worst)" : ""}` }))}
      style={{ width: "100%" }}
    />
  </Form.Item>
);

const Q25DataQuality: React.FC<Props> = ({ bomComponents, form, isClientMode }) => (
  <div style={{ marginTop: 14, overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        minWidth: 900,
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
          <th style={{ ...th, minWidth: 120 }}>
            Primary data share (%) <span style={OPT_TAG}>Opt</span>
          </th>
          <th style={{ ...th, minWidth: 180 }}>
            Secondary EF source <span style={OPT_TAG}>Opt</span>
          </th>
          <th style={{ ...th, minWidth: 110 }}>
            Data year <span style={OPT_TAG}>Opt</span>
          </th>
          <th style={{ ...th, minWidth: 130 }}>
            Technological DQR <span style={OPT_TAG}>Opt</span>
          </th>
          <th style={{ ...th, minWidth: 130 }}>
            Geographical DQR <span style={OPT_TAG}>Opt</span>
          </th>
          <th style={{ ...th, borderTopRightRadius: 12, minWidth: 120 }}>
            Temporal DQR <span style={OPT_TAG}>Opt</span>
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

            {/* 25a — Primary data share % */}
            <td style={{ ...td, minWidth: 120 }}>
              <Form.Item name={[...FIELD_PATH, i, "primary_data_share"]} className="mb-0" noStyle>
                <InputNumber
                  placeholder="0–100"
                  min={0}
                  max={100}
                  disabled={isClientMode}
                  style={{ ...ffStyle, width: "100%" }}
                />
              </Form.Item>
            </td>

            {/* 25b — Secondary EF source */}
            <td style={{ ...td, minWidth: 180 }}>
              <Form.Item name={[...FIELD_PATH, i, "secondary_ef_source"]} className="mb-0" noStyle>
                <Input
                  placeholder="e.g. ecoinvent 3.8"
                  disabled={isClientMode}
                  style={ffStyle}
                />
              </Form.Item>
            </td>

            {/* 25c — Data year */}
            <td style={{ ...td, minWidth: 110 }}>
              <Form.Item name={[...FIELD_PATH, i, "data_year"]} className="mb-0" noStyle>
                <InputNumber
                  placeholder="e.g. 2024"
                  min={2000}
                  max={2100}
                  disabled={isClientMode}
                  style={{ ...ffStyle, width: "100%" }}
                />
              </Form.Item>
            </td>

            {/* 25d — Technological DQR */}
            <td style={{ ...td, minWidth: 130 }}>
              <DqrSelect rowIdx={i} fieldName="technological" isClientMode={isClientMode} />
            </td>

            {/* 25e — Geographical DQR */}
            <td style={{ ...td, minWidth: 130 }}>
              <DqrSelect rowIdx={i} fieldName="geographical" isClientMode={isClientMode} />
            </td>

            {/* 25f — Temporal DQR */}
            <td style={{ ...td, minWidth: 120 }}>
              <DqrSelect rowIdx={i} fieldName="temporal" isClientMode={isClientMode} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Q25DataQuality;
