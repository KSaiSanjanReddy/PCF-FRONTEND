/**
 * Q20 Land Use sub-fields (20a / 20b / 20c), multi-component (Format A style).
 *
 * One row per BOM component. Component locked on left.
 * Columns: Uses agri/forestry land? (Y/N) | Land area (hectares) | Forest converted? (Y/N)
 *
 * Stored under `biobased.land_use_items[i].*`.
 * When < 2 components the parent renders the original 20a–20c sub-fields.
 */
import React from "react";
import { Form, Input, InputNumber, Select } from "antd";
import type { FormInstance } from "antd";
import { C, OPT_TAG, ffStyle } from "./theme";

export type Q20LandUseBomComponent = {
  bom_id: string;
  material_number: string;
  component_name: string;
};

type Props = {
  bomComponents: Q20LandUseBomComponent[];
  form: FormInstance;
  isClientMode?: boolean;
};

const YES_NO = [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }];

const TABLE_SELECT_POPUP = {
  popupMatchSelectWidth: false as const,
  dropdownStyle: { maxWidth: 200 } as React.CSSProperties,
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

const FIELD_PATH = ["biobased", "land_use_items"];

const Q20LandUse: React.FC<Props> = ({ bomComponents, form, isClientMode }) => (
  <div style={{ marginTop: 14, overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        minWidth: 600,
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
            20a — Uses agri / forestry land? <span style={OPT_TAG}>Optional</span>
          </th>
          <th style={th}>
            20b — Land area for feedstock (ha) <span style={OPT_TAG}>Optional</span>
          </th>
          <th style={{ ...th, borderTopRightRadius: 12 }}>
            20c — Forest converted to agri land? <span style={OPT_TAG}>Optional</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {bomComponents.map((c, i) => (
          <tr key={c.bom_id} style={{ background: i % 2 === 0 ? "#fff" : C.panelBg }}>
            {/* Component label — locked */}
            <td style={{ ...td, minWidth: 160 }}>
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

            {/* 20a — Uses agri/forestry land? */}
            <td style={{ ...td, minWidth: 180 }}>
              <Form.Item name={[...FIELD_PATH, i, "uses_agri_forestry_land"]} className="mb-0" noStyle>
                <Select
                  placeholder="Yes / No"
                  allowClear
                  disabled={isClientMode}
                  {...TABLE_SELECT_POPUP}
                  options={YES_NO}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </td>

            {/* 20b — Land area (hectares) */}
            <td style={{ ...td, minWidth: 180 }}>
              <Form.Item name={[...FIELD_PATH, i, "land_area_hectares"]} className="mb-0" noStyle>
                <InputNumber
                  placeholder="0.00"
                  min={0}
                  disabled={isClientMode}
                  style={{ ...ffStyle, width: "100%" }}
                />
              </Form.Item>
            </td>

            {/* 20c — Forest converted */}
            <td style={{ ...td, minWidth: 190 }}>
              <Form.Item name={[...FIELD_PATH, i, "forest_converted"]} className="mb-0" noStyle>
                <Select
                  placeholder="Yes / No"
                  allowClear
                  disabled={isClientMode}
                  {...TABLE_SELECT_POPUP}
                  options={YES_NO}
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

export default Q20LandUse;
