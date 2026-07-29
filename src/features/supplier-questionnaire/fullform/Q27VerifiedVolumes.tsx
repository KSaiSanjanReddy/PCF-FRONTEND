import React from "react";
import { Form, Input, InputNumber, Select } from "antd";
import type { FormInstance } from "antd";
import { C, OPT_TAG, ffStyle } from "./theme";

export type Q27BomComponent = {
  bom_id: string;
  material_number: string;
  component_name: string;
};

type Props = {
  bomComponents: Q27BomComponent[];
  form: FormInstance;
  isClientMode?: boolean;
};

const VOLUME_TYPE_OPTIONS = [
  { value: "Annual production volume", label: "Annual production volume" },
  { value: "Certified annual production volume", label: "Certified annual production volume" },
  { value: "Total product volume", label: "Total product volume" },
  { value: "Certified product volume", label: "Certified product volume" },
  { value: "Total feedstock volume", label: "Total feedstock volume" },
  { value: "Certified feedstock volume", label: "Certified feedstock volume" },
];

const FIELD_PATH = ["verification", "q27_items"];

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

const Q27VerifiedVolumes: React.FC<Props> = ({
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
        minWidth: 860,
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
            Volume type <span style={OPT_TAG}>Opt</span>
          </th>
          <th style={th}>
            Volume (units / tonnes) <span style={OPT_TAG}>Opt</span>
          </th>
          <th style={{ ...th, borderTopRightRadius: 12 }}>
            Share (%) <span style={OPT_TAG}>Opt</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {bomComponents.map((c, i) => (
          <tr key={c.bom_id} style={{ background: i % 2 === 0 ? "#fff" : C.panelBg }}>
            <td style={{ ...td, minWidth: 170 }}>
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
            <td style={{ ...td, minWidth: 280 }}>
              <Form.Item name={[...FIELD_PATH, i, "volume_type"]} className="mb-0" noStyle>
                <Select
                  allowClear
                  options={VOLUME_TYPE_OPTIONS}
                  placeholder="Select volume type"
                  disabled={isClientMode}
                  popupMatchSelectWidth={false}
                  dropdownStyle={{ maxWidth: 360 }}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </td>
            <td style={{ ...td, minWidth: 220 }}>
              <Form.Item name={[...FIELD_PATH, i, "volume"]} className="mb-0" noStyle>
                <InputNumber
                  min={0}
                  placeholder="0.00"
                  disabled={isClientMode}
                  controls={false}
                  style={{ ...ffStyle, width: "100%" }}
                />
              </Form.Item>
            </td>
            <td style={{ ...td, minWidth: 180 }}>
              <Form.Item name={[...FIELD_PATH, i, "share_percent"]} className="mb-0" noStyle>
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="0-100"
                  disabled={isClientMode}
                  controls={false}
                  style={{ ...ffStyle, width: "100%" }}
                />
              </Form.Item>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Q27VerifiedVolumes;
