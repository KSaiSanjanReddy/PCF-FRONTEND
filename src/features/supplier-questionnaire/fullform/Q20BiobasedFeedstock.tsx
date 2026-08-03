/**
 * Q20 — Bio-based feedstock details, multi-component (Format A / Q2 style).
 *
 * One row per BOM component — all columns inline in a single flat table.
 * Component locked on left; Type of Biomass Feedstock, Category, Sub-Category,
 * Group, Specific Type, Stage used, Quantity, Unit, Biogenic Carbon Content (%)
 * editable on the right.
 *
 * EF taxonomy cascade (Category → Sub → Group → Specific Type) uses the
 * shared TaxonomyCell from QuestionTable so DB-driven dropdowns work correctly.
 *
 * Stored under `biobased.feedstock_items[i].*`.
 * When < 2 components the parent uses the original add-row table instead.
 */
import React from "react";
import { Form, Input, Select, InputNumber } from "antd";
import type { FormInstance } from "antd";
import type { QuestionnaireField } from "../../../config/questionnaireSchema";
import { TaxonomyCell } from "./QuestionTable";
import { C, OPT_TAG, ffStyle } from "./theme";

export type Q20BomComponent = {
  bom_id: string;
  material_number: string;
  component_name: string;
};

type Props = {
  bomComponents: Q20BomComponent[];
  baseField: QuestionnaireField;
  form: FormInstance;
  isClientMode?: boolean;
  onValuesChange?: (changed: any, all: any) => void;
};

const BIOMASS_FEEDSTOCKS = [
  "Wood / forestry", "Maize / Corn", "Sugarcane", "Sugar beet", "Wheat",
  "Soy", "Palm", "Rapeseed", "Cotton", "Bamboo", "Natural rubber",
  "Other agricultural", "Other forestry",
];

const QUANTITY_UNITS = ["kg", "g", "tonne", "litre", "m³", "piece"];

const TABLE_SELECT_POPUP = {
  popupMatchSelectWidth: false as const,
  listHeight: 320,
  popupClassName: "sq-tax-select-dropdown",
  dropdownStyle: { maxWidth: 380 } as React.CSSProperties,
};

// Taxonomy column definitions matching the schema column names for Q20.
const TAX_NAMES = {
  category: "category",
  sub_category: "sub_category",
  group: "group",
  specific_type: "specific_type",
};

const TAX_FIELDS: QuestionnaireField[] = [
  { name: "category",      label: "Category",       type: "select", efTaxonomyLevel: "category",      placeholder: "Search category…" },
  { name: "sub_category",  label: "Sub-Category",   type: "select", efTaxonomyLevel: "sub_category",  placeholder: "Search sub-category…" },
  { name: "group",         label: "Group",          type: "select", efTaxonomyLevel: "group",         placeholder: "Search group…" },
  { name: "specific_type", label: "Specific Type",  type: "select", efTaxonomyLevel: "specific_type", placeholder: "Search specific type…" },
];

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
  padding: "14px 10px",
  borderBottom: `1px solid ${C.hairline}`,
  verticalAlign: "middle",
};

const FIELD_PATH = ["biobased", "feedstock_items"];

const Q20BiobasedFeedstock: React.FC<Props> = ({ bomComponents, form, isClientMode }) => (
  <div style={{ overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        minWidth: 1000,
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
          <th style={{ ...th, minWidth: 160 }}>Type of Biomass Feedstock <span style={OPT_TAG}>Opt</span></th>
          <th style={{ ...th, minWidth: 160 }}>Category <span style={OPT_TAG}>Opt</span></th>
          <th style={{ ...th, minWidth: 160 }}>Sub-Category <span style={OPT_TAG}>Opt</span></th>
          <th style={{ ...th, minWidth: 150 }}>Group <span style={OPT_TAG}>Opt</span></th>
          <th style={{ ...th, minWidth: 160 }}>Specific Type <span style={OPT_TAG}>Opt</span></th>
          <th style={{ ...th, minWidth: 160 }}>Stage used <span style={OPT_TAG}>Opt</span></th>
          <th style={{ ...th, minWidth: 100 }}>Quantity <span style={OPT_TAG}>Opt</span></th>
          <th style={{ ...th, minWidth: 110 }}>Unit <span style={OPT_TAG}>Opt</span></th>
          <th style={{ ...th, borderTopRightRadius: 12, minWidth: 130 }}>Biogenic Carbon (%) <span style={OPT_TAG}>Opt</span></th>
        </tr>
      </thead>
      <tbody>
        {bomComponents.map((c, i) => (
          <tr key={c.bom_id} style={{ background: i % 2 === 0 ? "#fff" : C.panelBg }}>
            {/* Component label — locked */}
            <td style={{ ...td, minWidth: 150 }}>
              <div style={{ fontWeight: 700, color: C.text }}>{c.component_name || `Component ${i + 1}`}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{c.material_number}</div>
              <Form.Item name={[...FIELD_PATH, i, "bom_id"]} noStyle initialValue={c.bom_id}>
                <Input type="hidden" />
              </Form.Item>
              <Form.Item name={[...FIELD_PATH, i, "component_material_name"]} noStyle initialValue={c.component_name}>
                <Input type="hidden" />
              </Form.Item>
            </td>

            {/* Type of Biomass Feedstock */}
            <td style={{ ...td, minWidth: 160 }}>
              <Form.Item name={[...FIELD_PATH, i, "feedstock"]} className="mb-0" noStyle>
                <Select
                  placeholder="Select feedstock"
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  disabled={isClientMode}
                  {...TABLE_SELECT_POPUP}
                  options={BIOMASS_FEEDSTOCKS.map((f) => ({ value: f, label: f }))}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </td>

            {/* EF Taxonomy cascade — Category → Sub-Category → Group → Specific Type */}
            {TAX_FIELDS.map((taxField) => (
              <td key={taxField.name} style={{ ...td, minWidth: taxField.name === "sub_category" ? 160 : 150 }}>
                <TaxonomyCell
                  field={taxField}
                  form={form}
                  fieldPath={FIELD_PATH}
                  rowName={i}
                  taxNames={TAX_NAMES}
                />
              </td>
            ))}

            {/* Stage used */}
            <td style={{ ...td, minWidth: 160 }}>
              <Form.Item name={[...FIELD_PATH, i, "stage_used"]} className="mb-0" noStyle>
                <Input placeholder="e.g. raw material, packaging" disabled={isClientMode} style={ffStyle} />
              </Form.Item>
            </td>

            {/* Quantity */}
            <td style={{ ...td, minWidth: 100 }}>
              <Form.Item name={[...FIELD_PATH, i, "quantity"]} className="mb-0" noStyle>
                <InputNumber placeholder="0.00" min={0} disabled={isClientMode} style={{ ...ffStyle, width: "100%" }} />
              </Form.Item>
            </td>

            {/* Unit */}
            <td style={{ ...td, minWidth: 110 }}>
              <Form.Item name={[...FIELD_PATH, i, "unit"]} className="mb-0" noStyle>
                <Select
                  placeholder="Unit"
                  allowClear
                  disabled={isClientMode}
                  {...TABLE_SELECT_POPUP}
                  options={QUANTITY_UNITS.map((u) => ({ value: u, label: u }))}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </td>

            {/* Biogenic Carbon Content (%) */}
            <td style={{ ...td, minWidth: 130 }}>
              <Form.Item name={[...FIELD_PATH, i, "biogenic_carbon_percent"]} className="mb-0" noStyle>
                <InputNumber placeholder="0–100" min={0} max={100} disabled={isClientMode} style={{ ...ffStyle, width: "100%" }} />
              </Form.Item>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Q20BiobasedFeedstock;
