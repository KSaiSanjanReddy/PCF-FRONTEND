import authService from "./authService";

const API_BASE_URL = "https://enviguide.nextechltd.in";

// ECOInvent Emission Factor Data Setup entities
export type EcoInventEntity =
  | "materials-emission-factor"
  | "electricity-emission-factor"
  | "fuel-emission-factor"
  | "packaging-emission-factor"
  | "packaging-treatment-type"
  | "vehicle-type-emission-factor"
  | "waste-material-type-emission-factor"
  | "waste-treatment-type";

// Common emission factor fields
export interface EcoInventItem {
  id?: string;
  // Name field varies by entity type
  element_name?: string; // materials-emission-factor
  type_of_energy?: string; // electricity-emission-factor
  fuel_type?: string; // fuel-emission-factor
  material_type?: string; // packaging-emission-factor
  treatment_type?: string; // waste-treatment-type
  name?: string; // packaging-treatment-type
  code?: string; // packaging-treatment-type
  vehicle_type?: string; // vehicle-type-emission-factor
  waste_material_type?: string; // waste-material-type-emission-factor
  // Common emission factor fields
  ef_eu_region?: string;
  ef_india_region?: string;
  ef_global_region?: string;
  year?: number;
  unit?: string;
  iso_country_code?: string;
  // Foreign keys
  ptt_id?: string; // packaging-emission-factor -> treatment type
}

// Entity-specific configuration
export interface EcoInventEntityConfig {
  nameField: string;
  displayName: string;
  idField: string;
}

// Configuration for each entity type
export const entityConfigs: Record<EcoInventEntity, EcoInventEntityConfig> = {
  "materials-emission-factor": {
    nameField: "element_name",
    displayName: "Element Name",
    idField: "mef_id",
  },
  "electricity-emission-factor": {
    nameField: "type_of_energy",
    displayName: "Type of Energy",
    idField: "eef_id",
  },
  "fuel-emission-factor": {
    nameField: "fuel_type",
    displayName: "Fuel Type",
    idField: "fef_id",
  },
  "packaging-emission-factor": {
    nameField: "material_type",
    displayName: "Material Type",
    idField: "pef_id",
  },
  "packaging-treatment-type": {
    nameField: "name",
    displayName: "Treatment Type",
    idField: "ptt_id",
  },
  "vehicle-type-emission-factor": {
    nameField: "vehicle_type",
    displayName: "Vehicle Type",
    idField: "vtef_id",
  },
  "waste-material-type-emission-factor": {
    nameField: "waste_material_type",
    displayName: "Waste Material Type",
    idField: "wmtef_id",
  },
  "waste-treatment-type": {
    nameField: "treatment_type",
    displayName: "Treatment Type",
    idField: "wtt_id",
  },
};

// Get entity config
export function getEntityConfig(entity: EcoInventEntity): EcoInventEntityConfig {
  return entityConfigs[entity];
}

function getAuthHeaders() {
  const token = authService.getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token || "",
  } as Record<string, string>;
}

function endpoint(
  entity: EcoInventEntity,
  action: "list/search" | "add" | "update" | "delete" | "bulk/add" | "drop-down-list"
) {
  return `${API_BASE_URL}/api/ecoinvent-emission-factor-data-setup/${entity}/${action}`;
}

// Extract ID from an item based on entity type
function extractId(entity: EcoInventEntity, item: any): string {
  const config = entityConfigs[entity];
  return (
    item[config.idField]?.toString() ||
    item.id?.toString() ||
    item._id?.toString() ||
    ""
  );
}

// Extract the name value from an item based on entity type
function extractName(entity: EcoInventEntity, item: any): string {
  const config = entityConfigs[entity];
  return item[config.nameField] || "";
}

// Normalize item from API response
function normalizeItem(entity: EcoInventEntity, item: any): EcoInventItem {
  const config = entityConfigs[entity];

  // Packaging treatment type uses name and code only
  if (entity === "packaging-treatment-type") {
    return {
      id: extractId(entity, item),
      name: item.name || "",
      code: item.code || "",
    };
  }

  // Packaging emission factor includes ptt_id
  if (entity === "packaging-emission-factor") {
    return {
      id: extractId(entity, item),
      [config.nameField]: extractName(entity, item),
      ptt_id: item.ptt_id || "",
      ef_eu_region: item.ef_eu_region || "",
      ef_india_region: item.ef_india_region || "",
      ef_global_region: item.ef_global_region || "",
      year: item.year || new Date().getFullYear(),
      unit: item.unit || "",
      iso_country_code: item.iso_country_code || "",
    };
  }

  return {
    id: extractId(entity, item),
    [config.nameField]: extractName(entity, item),
    ef_eu_region: item.ef_eu_region || "",
    ef_india_region: item.ef_india_region || "",
    ef_global_region: item.ef_global_region || "",
    year: item.year || new Date().getFullYear(),
    unit: item.unit || "",
    iso_country_code: item.iso_country_code || "",
  };
}

export async function listEcoInventData(
  entity: EcoInventEntity,
  params?: { searchValue?: string }
): Promise<EcoInventItem[]> {
  const url = new URL(endpoint(entity, "list/search"));
  if (params?.searchValue)
    url.searchParams.set("searchValue", params.searchValue);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  // Expected: { status, message, code, data: { totalCount, list: [] } }
  const normalize = (item: any) => normalizeItem(entity, item);

  if (Array.isArray((data as any)?.data?.list)) {
    return ((data as any).data.list as any[]).map(normalize);
  }
  // Fallbacks
  if (Array.isArray(data)) return (data as any[]).map(normalize);
  if (Array.isArray((data as any)?.data))
    return ((data as any).data as any[]).map(normalize);
  if (Array.isArray((data as any)?.items))
    return ((data as any).items as any[]).map(normalize);
  return [];
}

export async function addEcoInventData(
  entity: EcoInventEntity,
  item: EcoInventItem
): Promise<{ success: boolean; message?: string }> {
  try {
    const config = entityConfigs[entity];
    let payload: any;

    // Packaging treatment type uses name and code only
    if (entity === "packaging-treatment-type") {
      payload = {
        name: item.name || "",
        code: item.code || "",
      };
    }
    // Packaging emission factor includes ptt_id
    else if (entity === "packaging-emission-factor") {
      payload = {
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        ptt_id: item.ptt_id || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      };
    } else {
      payload = {
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      };
    }

    const res = await fetch(endpoint(entity, "add"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const success = !!(data?.success ?? data?.status);
    return {
      success,
      message: data?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while adding item",
    };
  }
}

export async function updateEcoInventData(
  entity: EcoInventEntity,
  item: EcoInventItem & { id: string }
): Promise<{ success: boolean; message?: string }> {
  try {
    const config = entityConfigs[entity];
    let payload: any;

    // Packaging treatment type uses name and code only
    if (entity === "packaging-treatment-type") {
      payload = {
        [config.idField]: item.id,
        name: item.name || "",
        code: item.code || "",
      };
    }
    // Packaging emission factor includes ptt_id
    else if (entity === "packaging-emission-factor") {
      payload = {
        [config.idField]: item.id,
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        ptt_id: item.ptt_id || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      };
    } else {
      payload = {
        [config.idField]: item.id,
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      };
    }

    const res = await fetch(endpoint(entity, "update"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify([payload]),
    });
    const data = await res.json();
    const success = !!(data?.success ?? data?.status);
    return {
      success,
      message: data?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while updating item",
    };
  }
}

export async function deleteEcoInventData(
  entity: EcoInventEntity,
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const config = entityConfigs[entity];
    const res = await fetch(endpoint(entity, "delete"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ [config.idField]: id }),
    });
    const data = await res.json();
    const success = !!(data?.success ?? data?.status);
    return {
      success,
      message: data?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while deleting item",
    };
  }
}

export async function bulkAddEcoInventData(
  entity: EcoInventEntity,
  items: EcoInventItem[]
): Promise<{ success: boolean; message: string; addedCount?: number }> {
  try {
    const config = entityConfigs[entity];
    let payloadItems: any[];

    // Packaging treatment type uses name and code only
    if (entity === "packaging-treatment-type") {
      payloadItems = items.map((item) => ({
        name: item.name || "",
        code: item.code || "",
      }));
    }
    // Packaging emission factor includes ptt_id
    else if (entity === "packaging-emission-factor") {
      payloadItems = items.map((item) => ({
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        ptt_id: item.ptt_id || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      }));
    } else {
      payloadItems = items.map((item) => ({
        [config.nameField]: item[config.nameField as keyof EcoInventItem] || "",
        ef_eu_region: item.ef_eu_region || "0",
        ef_india_region: item.ef_india_region || "0",
        ef_global_region: item.ef_global_region || "0",
        year: item.year || new Date().getFullYear(),
        unit: item.unit || "",
        iso_country_code: item.iso_country_code || "",
      }));
    }

    const res = await fetch(endpoint(entity, "bulk/add"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payloadItems),
    });
    const data = await res.json();
    if (data?.success || data?.status) {
      return {
        success: true,
        message: data?.message || "Bulk import successful",
        addedCount: data?.data?.addedCount || items.length,
      };
    }
    return {
      success: false,
      message: data?.message || "Bulk import failed",
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred during bulk import",
    };
  }
}

export async function getDropdownList(
  entity: EcoInventEntity
): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(endpoint(entity, "drop-down-list"), {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      return (data.data as any[]).map((item) => ({
        id: extractId(entity, item),
        name: extractName(entity, item),
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Get treatment types dropdown for packaging emission factor
export async function getTreatmentTypeDropdown(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(endpoint("packaging-treatment-type", "drop-down-list"), {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      return (data.data as any[]).map((item) => ({
        id: item.ptt_id || item.id || "",
        name: item.name || "",
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}
