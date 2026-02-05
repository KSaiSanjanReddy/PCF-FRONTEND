import type { SetupEntity } from "../lib/dataSetupService";

export interface DataSetupGroup {
  key: string;
  title: string;
  description: string;
  tabs: {
    key: string;
    label: string;
    entity: SetupEntity;
  }[];
}

export const dataSetupGroups: DataSetupGroup[] = [
  {
    key: "emissions",
    title: "Emissions Configuration",
    description: "Configure emission types and calculation methods",
    tabs: [
      {
        key: "calculation-method",
        label: "Calculation Method",
        entity: "calculation-method",
      },
      {
        key: "fuel-combustion",
        label: "Fuel Combustion",
        entity: "fuel-combustion",
      },
      {
        key: "fuel-type",
        label: "Fuel Type",
        entity: "fuel-type",
      },
      {
        key: "process-emission",
        label: "Process Emission",
        entity: "process-emission",
      },
      {
        key: "fugitive-emission",
        label: "Fugitive Emission",
        entity: "fugitive-emission",
      },
    ],
  },
  {
    key: "electricity",
    title: "Electricity Configuration",
    description: "Configure electricity sources and methods",
    tabs: [
      {
        key: "location-based",
        label: "Location Based",
        entity: "electricity-location-based",
      },
      {
        key: "market-based",
        label: "Market Based",
        entity: "electricity-market-based",
      },
      {
        key: "steam-heat-cooling",
        label: "Steam Heat Cooling",
        entity: "steam-heat-cooling",
      },
    ],
  },
  {
    key: "energy",
    title: "Energy Configuration",
    description: "Configure energy sources, types, and units",
    tabs: [
      {
        key: "energy-source",
        label: "Energy Source",
        entity: "energy-source",
      },
      {
        key: "energy-type",
        label: "Energy Type",
        entity: "energy-type",
      },
      {
        key: "energy-unit",
        label: "Energy Unit",
        entity: "energy-unit",
      },
      {
        key: "scope-two-method",
        label: "Scope Two Method",
        entity: "scope-two-method",
      },
    ],
  },
  {
    key: "materials",
    title: "Materials Configuration",
    description: "Configure material types and metal classifications",
    tabs: [
      {
        key: "material-type",
        label: "Material Type",
        entity: "material-type",
      },
      {
        key: "material-composition-metal",
        label: "Material Composition Metal",
        entity: "material-composition-metal",
      },
      {
        key: "material-composition-metal-type",
        label: "Material Composition Metal Type",
        entity: "material-composition-metal-type",
      },
      {
        key: "aluminium-type",
        label: "Aluminium Type",
        entity: "aluminium-type",
      },
      {
        key: "iron-type",
        label: "Iron Type",
        entity: "iron-type",
      },
      {
        key: "silicon-type",
        label: "Silicon Type",
        entity: "silicon-type",
      },
      {
        key: "magnesium-type",
        label: "Magnesium Type",
        entity: "magnesium-type",
      },
    ],
  },
  {
    key: "transport",
    title: "Transport Configuration",
    description: "Configure transport modes, vehicles, and routes",
    tabs: [
      {
        key: "transport-modes",
        label: "Transport Modes",
        entity: "transport-modes",
      },
      {
        key: "transport-routes",
        label: "Transport Routes",
        entity: "transport-routes",
      },
      {
        key: "vehicle-detail",
        label: "Vehicle Detail",
        entity: "vehicle-detail",
      },
      {
        key: "vehicle-type",
        label: "Vehicle Type",
        entity: "vehicle-type",
      },
    ],
  },
  {
    key: "water-waste",
    title: "Water & Waste Configuration",
    description: "Configure water sources, treatment, and waste management",
    tabs: [
      {
        key: "water-source",
        label: "Water Source",
        entity: "water-source",
      },
      {
        key: "water-treatment",
        label: "Water Treatment",
        entity: "water-treatment",
      },
      {
        key: "water-unit",
        label: "Water Unit",
        entity: "water-unit",
      },
      {
        key: "waste-treatment",
        label: "Waste Treatment",
        entity: "waste-treatment",
      },
      {
        key: "discharge-destination",
        label: "Discharge Destination",
        entity: "discharge-destination",
      },
    ],
  },
  {
    key: "units",
    title: "Units Configuration",
    description: "Configure measurement units for various types",
    tabs: [
      {
        key: "product-unit",
        label: "Product Unit",
        entity: "product-unit",
      },
      {
        key: "gaseous-fuel-unit",
        label: "Gaseous Fuel Unit",
        entity: "gaseous-fuel-unit",
      },
      {
        key: "liquid-fuel-unit",
        label: "Liquid Fuel Unit",
        entity: "liquid-fuel-unit",
      },
      {
        key: "solid-fuel-unit",
        label: "Solid Fuel Unit",
        entity: "solid-fuel-unit",
      },
      {
        key: "ef-unit",
        label: "EF Unit",
        entity: "ef-unit",
      },
    ],
  },
  {
    key: "standards",
    title: "Standards & Compliance",
    description:
      "Configure reporting standards, certificates, and verification",
    tabs: [
      {
        key: "reporting-standard",
        label: "Reporting Standard",
        entity: "reporting-standard",
      },
      {
        key: "certificate-type",
        label: "Certificate Type",
        entity: "certificate-type",
      },
      {
        key: "verification-status",
        label: "Verification Status",
        entity: "verification-status",
      },
      {
        key: "credit-method",
        label: "Credit Method",
        entity: "credit-method",
      },
    ],
  },
  {
    key: "lifecycle",
    title: "Life Cycle & Methodology",
    description: "Configure life cycle stages, boundaries, and methodologies",
    tabs: [
      {
        key: "life-cycle-stage",
        label: "Life Cycle Stage",
        entity: "life-cycle-stage",
      },
      {
        key: "life-cycle-boundary",
        label: "Life Cycle Boundary",
        entity: "life-cycle-boundary",
      },
      {
        key: "allocation-method",
        label: "Allocation Method",
        entity: "allocation-method",
      },
      {
        key: "method-type",
        label: "Method Type",
        entity: "method-type",
      },
      {
        key: "packaging-level",
        label: "Packaging Level",
        entity: "packaging-level",
      },
    ],
  },
  {
    key: "manufacturing",
    title: "Manufacturing Configuration",
    description: "Configure manufacturing processes and energy",
    tabs: [
      {
        key: "manufacturing-process",
        label: "Manufacturing Process",
        entity: "manufacturing-process",
      },
      {
        key: "process-specific-energy",
        label: "Process Specific Energy",
        entity: "process-specific-energy",
      },
    ],
  },
];

// Single entity pages (not grouped)
export const singleEntityPages: Array<{
  key: string;
  title: string;
  description: string;
  entity: SetupEntity;
  path: string;
}> = [
  {
    key: "manufacturer",
    title: "Manufacturer",
    description: "Manage manufacturer information and details",
    entity: "manufacturer",
    path: "/settings/data-setup/manufacturer",
  },
  {
    key: "category",
    title: "Category",
    description: "Manage general categories and classifications",
    entity: "category",
    path: "/settings/data-setup/category",
  },
  {
    key: "tag",
    title: "Tag",
    description: "Manage tag configurations",
    entity: "tag",
    path: "/settings/data-setup/tag",
  },
  {
    key: "supplier-tier",
    title: "Supplier Tier",
    description: "Configure supplier tier classifications",
    entity: "supplier-tier",
    path: "/settings/data-setup/supplier-tier",
  },
  {
    key: "refrigerent-type",
    title: "Refrigerant Type",
    description: "Manage refrigerant type classifications",
    entity: "refrigerent-type",
    path: "/settings/data-setup/refrigerent-type",
  },
  {
    key: "country-iso-two",
    title: "Country ISO Two",
    description: "Manage ISO 2-letter country codes",
    entity: "country-iso-two",
    path: "/settings/data-setup/country-iso-two",
  },
  {
    key: "country-iso-three",
    title: "Country ISO Three",
    description: "Manage ISO 3-letter country codes",
    entity: "country-iso-three",
    path: "/settings/data-setup/country-iso-three",
  },
  {
    key: "time-zone",
    title: "Time Zone",
    description: "Configure time zone settings",
    entity: "time-zone",
    path: "/settings/data-setup/time-zone",
  },
];
