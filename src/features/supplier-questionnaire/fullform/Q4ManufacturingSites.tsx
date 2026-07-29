/**
 * Q4 — Manufacturing sites, multi-component (Format A / Q2 style).
 *
 * One row per BOM component. Component name is locked (left column).
 * Site Name, Site Address, Region, Country, Subdivision, Notes are
 * editable inline — one site per component, same visual as Q2.
 *
 * Stored under `product.manufacturing_sites_items[i].*`.
 * Falls back to the standard shared table when < 2 components.
 */
import React from "react";
import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd";
import type { QuestionnaireField } from "../../../config/questionnaireSchema";
import { getCountriesForRegion } from "../../../config/regionCountries";
import { getSubdivisionsForCountry } from "../../../config/countrySubdivisions";
import { C, REQ_TAG, OPT_TAG, ffStyle } from "./theme";

export type Q4BomComponent = {
  bom_id: string;
  material_number: string;
  component_name: string;
};

type Props = {
  bomComponents: Q4BomComponent[];
  baseField: QuestionnaireField;
  form: FormInstance;
  isClientMode?: boolean;
};

const TABLE_SELECT_POPUP = {
  popupMatchSelectWidth: false as const,
  listHeight: 320,
  popupClassName: "sq-tax-select-dropdown",
  dropdownStyle: { maxWidth: 420 } as React.CSSProperties,
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

/** Region select for a row — clears country + subdivision on change. */
const RegionCell: React.FC<{
  rowIdx: number;
  options: string[];
  form: FormInstance;
  isClientMode?: boolean;
}> = ({ rowIdx, options, form, isClientMode }) => (
  <Form.Item
    name={["product", "manufacturing_sites_items", rowIdx, "region"]}
    className="mb-0"
    noStyle
    rules={[{ required: true, message: "Region is required." }]}
  >
    <Select
      placeholder="Select region"
      showSearch
      optionFilterProp="label"
      disabled={isClientMode}
      {...TABLE_SELECT_POPUP}
      options={options.map((o) => ({ value: o, label: o }))}
      style={{ width: "100%" }}
      onChange={(v) => {
        const path = ["product", "manufacturing_sites_items"];
        const arr = [...((form.getFieldValue(path) as any[]) || [])];
        arr[rowIdx] = { ...(arr[rowIdx] || {}), region: v, country: undefined, subdivision: undefined };
        form.setFieldValue(path, arr);
      }}
    />
  </Form.Item>
);

/** Country select filtered by the current region value. */
const CountryCell: React.FC<{
  rowIdx: number;
  form: FormInstance;
  isClientMode?: boolean;
}> = ({ rowIdx, form, isClientMode }) => {
  const region = Form.useWatch(
    ["product", "manufacturing_sites_items", rowIdx, "region"],
    form,
  ) as string | undefined;
  const options = region ? getCountriesForRegion(region) : [];
  return (
    <Form.Item
      name={["product", "manufacturing_sites_items", rowIdx, "country"]}
      className="mb-0"
      noStyle
      rules={[{ required: true, message: "Country is required." }]}
    >
      <Select
        placeholder={region ? "Select country" : "Select a region first"}
        disabled={!region || isClientMode}
        showSearch
        optionFilterProp="label"
        {...TABLE_SELECT_POPUP}
        options={options.map((o) => ({ value: o, label: o }))}
        style={{ width: "100%" }}
        onChange={() => {
          const path = ["product", "manufacturing_sites_items"];
          const arr = [...((form.getFieldValue(path) as any[]) || [])];
          arr[rowIdx] = { ...(arr[rowIdx] || {}), subdivision: undefined };
          form.setFieldValue(path, arr);
        }}
      />
    </Form.Item>
  );
};

/** Subdivision — text input or select depending on country. */
const SubdivisionCell: React.FC<{
  rowIdx: number;
  form: FormInstance;
  isClientMode?: boolean;
}> = ({ rowIdx, form, isClientMode }) => {
  const country = Form.useWatch(
    ["product", "manufacturing_sites_items", rowIdx, "country"],
    form,
  ) as string | undefined;
  const subs = country ? getSubdivisionsForCountry(country) : [];
  if (subs.length === 0) {
    return (
      <Form.Item
        name={["product", "manufacturing_sites_items", rowIdx, "subdivision"]}
        className="mb-0"
        noStyle
      >
        <Input
          placeholder="State / province (optional)"
          disabled={isClientMode}
          style={ffStyle}
        />
      </Form.Item>
    );
  }
  return (
    <Form.Item
      name={["product", "manufacturing_sites_items", rowIdx, "subdivision"]}
      className="mb-0"
      noStyle
    >
      <Select
        placeholder="Select or type state / province (optional)"
        showSearch
        allowClear
        optionFilterProp="label"
        disabled={isClientMode}
        {...TABLE_SELECT_POPUP}
        options={subs.map((s) => ({ value: s, label: s }))}
        style={{ width: "100%" }}
      />
    </Form.Item>
  );
};

const Q4ManufacturingSites: React.FC<Props> = ({
  bomComponents,
  baseField,
  form,
  isClientMode,
}) => {
  // Pull the region options from the schema columns.
  const regionOptions: string[] =
    (baseField.columns?.find((c) => c.name === "region")?.options as string[] | undefined) ?? [];

  return (
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
            <th style={{ ...th, borderTopLeftRadius: 12 }}>Component</th>
            <th style={th}>
              Site Name
            </th>
            <th style={th}>
              Site Address
            </th>
            <th style={th}>
              Region <span style={REQ_TAG}>Req</span>
            </th>
            <th style={th}>
              Country <span style={REQ_TAG}>Req</span>
            </th>
            <th style={th}>
              Subdivision <span style={OPT_TAG}>Optional</span>
            </th>
            <th style={{ ...th, borderTopRightRadius: 12 }}>
              Notes <span style={OPT_TAG}>Optional</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {bomComponents.map((c, i) => (
            <tr key={c.bom_id} style={{ background: i % 2 === 0 ? "#fff" : C.panelBg }}>
              {/* Component label — locked, matches Q2 style */}
              <td style={{ ...td, minWidth: 130 }}>
                <div style={{ fontWeight: 700, color: C.text }}>
                  {c.component_name || `Component ${i + 1}`}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                  {c.material_number}
                </div>
                {/* hidden bom_id */}
                <Form.Item
                  name={["product", "manufacturing_sites_items", i, "bom_id"]}
                  noStyle
                  initialValue={c.bom_id}
                >
                  <Input type="hidden" />
                </Form.Item>
              </td>

              {/* Site Name */}
              <td style={{ ...td, minWidth: 140 }}>
                <Form.Item
                  name={["product", "manufacturing_sites_items", i, "site_name"]}
                  className="mb-0"
                  noStyle
                >
                  <Input
                    placeholder="Site name"
                    disabled={isClientMode}
                    style={ffStyle}
                  />
                </Form.Item>
              </td>

              {/* Site Address */}
              <td style={{ ...td, minWidth: 150 }}>
                <Form.Item
                  name={["product", "manufacturing_sites_items", i, "site_address"]}
                  className="mb-0"
                  noStyle
                >
                  <Input
                    placeholder="Address"
                    disabled={isClientMode}
                    style={ffStyle}
                  />
                </Form.Item>
              </td>

              {/* Region */}
              <td style={{ ...td, minWidth: 155 }}>
                <RegionCell
                  rowIdx={i}
                  options={regionOptions}
                  form={form}
                  isClientMode={isClientMode}
                />
              </td>

              {/* Country */}
              <td style={{ ...td, minWidth: 155 }}>
                <CountryCell rowIdx={i} form={form} isClientMode={isClientMode} />
              </td>

              {/* Subdivision */}
              <td style={{ ...td, minWidth: 160 }}>
                <SubdivisionCell rowIdx={i} form={form} isClientMode={isClientMode} />
              </td>

              {/* Notes */}
              <td style={{ ...td, minWidth: 130 }}>
                <Form.Item
                  name={["product", "manufacturing_sites_items", i, "notes"]}
                  className="mb-0"
                  noStyle
                >
                  <Input
                    placeholder="Optional notes"
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
};

export default Q4ManufacturingSites;
