/**
 * Q26 — Certification & attestation, multi-component (Format A style).
 *
 * One row per BOM component. Two gated column groups:
 *   Certification: Product certified? → Scheme, Certificate #, Valid from/to
 *   Attestation:   PCF verified?      → Type (locked), Standards (locked),
 *                                        Scheme standard, ID, Issuer, Issuer ID,
 *                                        URL, Completed at
 *
 * Stored under `verification.q26_items[i].*`.
 * When < 2 components the parent uses the original 26a–26n sub-fields.
 */
import React, { useMemo } from "react";
import { Form, Input, Select, DatePicker } from "antd";
import type { FormInstance } from "antd";
import { C, REQ_TAG, OPT_TAG, ffStyle } from "./theme";
import { dateValueProps } from "./controls";

export type Q26BomComponent = {
  bom_id: string;
  material_number: string;
  component_name: string;
};

type Props = {
  bomComponents: Q26BomComponent[];
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

const thGroup: React.CSSProperties = {
  ...th,
  background: C.greenTintRow,
  color: C.greenDark,
  fontSize: 10.5,
  borderBottom: `1px solid ${C.hairline}`,
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: `1px solid ${C.hairline}`,
  verticalAlign: "top",
};

const FIELD_PATH = ["verification", "q26_items"];

const ATTESTATION_TYPE_DEFAULT = "PCF Program Certification";
const CONFORMANT_STANDARDS_DEFAULT =
  "Catena-X Product Carbon Footprint Rulebook v4";

const YesNoCell: React.FC<{
  rowIdx: number;
  fieldName: string;
  required?: boolean;
  isClientMode?: boolean;
}> = ({ rowIdx, fieldName, required, isClientMode }) => (
  <Form.Item
    name={[...FIELD_PATH, rowIdx, fieldName]}
    className="mb-0"
    noStyle
    rules={required ? [{ required: true, message: "Required." }] : undefined}
  >
    <Select
      placeholder="Yes / No"
      allowClear={!required}
      disabled={isClientMode}
      {...TABLE_SELECT_POPUP}
      options={YES_NO}
      style={{ width: "100%" }}
    />
  </Form.Item>
);

const TextField: React.FC<{
  rowIdx: number;
  fieldName: string;
  placeholder?: string;
  disabled?: boolean;
  initialValue?: any;
  rules?: any[];
  isClientMode?: boolean;
}> = ({
  rowIdx,
  fieldName,
  placeholder,
  disabled,
  initialValue,
  rules,
  isClientMode,
}) => (
  <Form.Item
    name={[...FIELD_PATH, rowIdx, fieldName]}
    className="mb-0"
    noStyle
    initialValue={initialValue}
    rules={rules}
  >
    <Input
      placeholder={placeholder}
      disabled={disabled || isClientMode}
      style={ffStyle}
    />
  </Form.Item>
);

const DateField: React.FC<{
  rowIdx: number;
  fieldName: string;
  placeholder?: string;
  isClientMode?: boolean;
}> = ({ rowIdx, fieldName, placeholder, isClientMode }) => (
  <Form.Item name={[...FIELD_PATH, rowIdx, fieldName]} className="mb-0" noStyle {...dateValueProps}>
    <DatePicker
      format="DD/MM/YYYY"
      placeholder={placeholder || "DD/MM/YYYY"}
      disabled={isClientMode}
      style={{ ...ffStyle, width: "100%" }}
    />
  </Form.Item>
);

const Q26Verification: React.FC<Props> = ({ bomComponents, form, isClientMode }) => (
  (() => {
    const q26Items = (Form.useWatch(FIELD_PATH, form) as any[]) || [];

    const pcfVerifiedYesByIndex = useMemo(() => {
      const set = new Set<number>();
      q26Items.forEach((r, idx) => {
        if (r?.pcf_verified === "Yes") set.add(idx);
      });
      return set;
    }, [q26Items]);

    return (
      <div style={{ marginTop: 14, overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        minWidth: 1100,
        fontSize: 13,
        background: "#fff",
        border: `1px solid ${C.hairline}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <thead>
        {/* Group headers */}
        <tr>
          <th style={{ ...th, borderTopLeftRadius: 12 }} rowSpan={2}>Component</th>
          <th style={{ ...thGroup }} colSpan={5}>
            🏅 Certification
          </th>
          <th style={{ ...thGroup, borderTopRightRadius: 12 }} colSpan={9}>
            ✅ Attestation / Verification
          </th>
        </tr>
        {/* Column headers */}
        <tr>
          {/* Certification */}
          <th style={th}>Product certified? <span style={REQ_TAG}>Req</span></th>
          <th style={th}>Certification scheme <span style={OPT_TAG}>Opt</span></th>
          <th style={th}>Certificate # <span style={OPT_TAG}>Opt</span></th>
          <th style={th}>Valid from <span style={OPT_TAG}>Opt</span></th>
          <th style={th}>Valid to <span style={OPT_TAG}>Opt</span></th>
          {/* Attestation */}
          <th style={th}>PCF verified? <span style={REQ_TAG}>Req</span></th>
          <th style={th}>Attestation type <span style={REQ_TAG}>Req</span></th>
          <th style={th}>Conformant standards <span style={REQ_TAG}>Req</span></th>
          <th style={th}>Scheme standard <span style={REQ_TAG}>Req</span></th>
          <th style={th}>Attestation ID <span style={REQ_TAG}>Req</span></th>
          <th style={th}>Issuer <span style={REQ_TAG}>Req</span></th>
          <th style={th}>Issuer ID <span style={OPT_TAG}>Opt</span></th>
          <th style={th}>URL <span style={OPT_TAG}>Opt</span></th>
          <th style={{ ...th, borderTopRightRadius: 0 }}>Completed at <span style={OPT_TAG}>Opt</span></th>
        </tr>
      </thead>
      <tbody>
        {bomComponents.map((c, i) => (
          <tr key={c.bom_id} style={{ background: i % 2 === 0 ? "#fff" : C.panelBg }}>
            {/* Component label */}
            <td style={{ ...td, minWidth: 150 }}>
              <div style={{ fontWeight: 700, color: C.text }}>{c.component_name || `Component ${i + 1}`}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{c.material_number}</div>
              <Form.Item name={[...FIELD_PATH, i, "bom_id"]} noStyle initialValue={c.bom_id}>
                <Input type="hidden" />
              </Form.Item>
            </td>

            {/* Certification columns */}
            <td style={{ ...td, minWidth: 120 }}>
              <YesNoCell rowIdx={i} fieldName="product_certified" required isClientMode={isClientMode} />
            </td>
            <td style={{ ...td, minWidth: 160 }}>
              <TextField rowIdx={i} fieldName="certification_scheme" placeholder="Scheme name" isClientMode={isClientMode} />
            </td>
            <td style={{ ...td, minWidth: 150 }}>
              <TextField rowIdx={i} fieldName="certificate_number" placeholder="Certificate #" isClientMode={isClientMode} />
            </td>
            <td style={{ ...td, minWidth: 140 }}>
              <DateField rowIdx={i} fieldName="certificate_valid_from" placeholder="Valid from" isClientMode={isClientMode} />
            </td>
            <td style={{ ...td, minWidth: 140 }}>
              <DateField rowIdx={i} fieldName="certificate_valid_to" placeholder="Valid to" isClientMode={isClientMode} />
            </td>

            {/* Attestation columns */}
            <td style={{ ...td, minWidth: 120 }}>
              <YesNoCell rowIdx={i} fieldName="pcf_verified" required isClientMode={isClientMode} />
            </td>
            <td style={{ ...td, minWidth: 190 }}>
              {/* Fixed default — locked */}
              <TextField
                rowIdx={i}
                fieldName="attestation_type"
                placeholder={ATTESTATION_TYPE_DEFAULT}
                disabled
                initialValue={ATTESTATION_TYPE_DEFAULT}
                isClientMode={isClientMode}
              />
            </td>
            <td style={{ ...td, minWidth: 220 }}>
              {/* Fixed default — locked */}
              <TextField
                rowIdx={i}
                fieldName="conformant_standards"
                placeholder={CONFORMANT_STANDARDS_DEFAULT}
                disabled
                initialValue={CONFORMANT_STANDARDS_DEFAULT}
                isClientMode={isClientMode}
              />
            </td>
            <td style={{ ...td, minWidth: 170 }}>
              <TextField
                rowIdx={i}
                fieldName="attestation_scheme_standard"
                placeholder="Scheme standard"
                isClientMode={isClientMode}
                rules={
                  pcfVerifiedYesByIndex.has(i)
                    ? [{ required: true, message: "Required." }]
                    : undefined
                }
              />
            </td>
            <td style={{ ...td, minWidth: 150 }}>
              <TextField
                rowIdx={i}
                fieldName="attestation_id"
                placeholder="Attestation ID"
                isClientMode={isClientMode}
                rules={
                  pcfVerifiedYesByIndex.has(i)
                    ? [{ required: true, message: "Required." }]
                    : undefined
                }
              />
            </td>
            <td style={{ ...td, minWidth: 160 }}>
              <TextField
                rowIdx={i}
                fieldName="attestation_issuer"
                placeholder="Issuing body"
                isClientMode={isClientMode}
                rules={
                  pcfVerifiedYesByIndex.has(i)
                    ? [{ required: true, message: "Required." }]
                    : undefined
                }
              />
            </td>
            <td style={{ ...td, minWidth: 140 }}>
              <TextField rowIdx={i} fieldName="issuer_id" placeholder="URN / BPN" isClientMode={isClientMode} />
            </td>
            <td style={{ ...td, minWidth: 150 }}>
              <TextField rowIdx={i} fieldName="attestation_url" placeholder="https://" isClientMode={isClientMode} />
            </td>
            <td style={{ ...td, minWidth: 140 }}>
              <DateField rowIdx={i} fieldName="attestation_completed_at" placeholder="Date" isClientMode={isClientMode} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
      </div>
    );
  })()
);

export default Q26Verification;
