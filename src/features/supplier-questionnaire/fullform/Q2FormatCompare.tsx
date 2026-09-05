/**
 * Q2 — Product details table (Format A).
 *
 * One row per BOM component. Product name / MPN / description are pre-filled
 * from the BOM and locked (read-only). Classification is the only editable
 * column. Answers are stored under `product.items[i].*` and wired into the
 * parent Ant Form instance so they are saved/submitted normally.
 */
import React, { useEffect } from "react";
import { Form, Input } from "antd";
import type { FormInstance } from "antd";
import { C, REQ_TAG, OPT_TAG, ffStyle } from "./theme";

export type Q2BomComponent = {
  bom_id: string;
  material_number: string;
  component_name: string;
  detail_description?: string | null;
};

type Props = {
  bomComponents: Q2BomComponent[];
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
  verticalAlign: "top",
};

const empty = (v: any) => v === undefined || v === null || v === "";

const Q2ProductTable: React.FC<Props> = ({ bomComponents, form, isClientMode }) => {
  // initialValue alone is not enough after draft rehydrate / setFieldsValue —
  // explicitly seed locked BOM identity into the store so validation sees it.
  useEffect(() => {
    if (!bomComponents.length) return;
    bomComponents.forEach((c, i) => {
      const base = ["product", "items", i] as const;
      const row = form.getFieldValue(["product", "items", i]) || {};
      if (empty(row.name) && c.component_name) {
        form.setFieldValue([...base, "name"], c.component_name);
      }
      if (empty(row.product_id) && c.material_number) {
        form.setFieldValue([...base, "product_id"], c.material_number);
      }
      if (empty(row.description) && c.detail_description) {
        form.setFieldValue([...base, "description"], c.detail_description);
      }
      if (empty(row.bom_id) && c.bom_id) {
        form.setFieldValue([...base, "bom_id"], c.bom_id);
      }
    });
  }, [bomComponents, form]);

  if (!bomComponents.length) {
    return (
      <div
        style={{
          margin: "14px 0 0 40px",
          padding: "14px 16px",
          borderRadius: 10,
          background: C.panelBg,
          border: `1px dashed ${C.hairline}`,
          fontSize: 13,
          color: C.muted,
        }}
      >
        No BOM components assigned — product details will appear here once
        components are linked to this request.
      </div>
    );
  }

  return (
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
            <th style={{ ...th, borderTopLeftRadius: 12 }}>
              Component
            </th>
            <th style={th}>
              Product name{" "}
              <span style={REQ_TAG}>Req</span>
            </th>
            <th style={th}>
              MPN / Article #{" "}
              <span style={REQ_TAG}>Req</span>
            </th>
            <th style={th}>
              Description
            </th>
            <th style={{ ...th, borderTopRightRadius: 12 }}>
              Classification{" "}
              <span style={OPT_TAG}>Optional</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {bomComponents.map((c, i) => (
            <tr key={c.bom_id} style={{ background: i % 2 === 0 ? "#fff" : C.panelBg }}>
              <td style={td}>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>
                  {c.component_name || `Component ${i + 1}`}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                  {c.material_number}
                </div>
              </td>

              <td style={td}>
                <Form.Item name={["product", "items", i, "name"]} className="mb-0" noStyle initialValue={c.component_name}>
                  <Input disabled style={ffStyle} />
                </Form.Item>
              </td>

              <td style={td}>
                <Form.Item name={["product", "items", i, "product_id"]} className="mb-0" noStyle initialValue={c.material_number}>
                  <Input disabled style={ffStyle} />
                </Form.Item>
              </td>

              <td style={{ ...td, minWidth: 170 }}>
                <Form.Item name={["product", "items", i, "description"]} className="mb-0" noStyle initialValue={c.detail_description || ""}>
                  <Input disabled placeholder="—" style={ffStyle} />
                </Form.Item>
              </td>

              <td style={{ ...td, minWidth: 160 }}>
                <Form.Item name={["product", "items", i, "classification"]} className="mb-0" noStyle>
                  <Input
                    placeholder="e.g. GTIN / UNSPSC / HS code"
                    disabled={isClientMode}
                    style={ffStyle}
                  />
                </Form.Item>
                <Form.Item name={["product", "items", i, "bom_id"]} noStyle initialValue={c.bom_id}>
                  <Input type="hidden" />
                </Form.Item>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Q2ProductTable;
