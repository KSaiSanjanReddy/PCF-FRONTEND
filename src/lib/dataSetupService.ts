import authService from "./authService";

const API_BASE_URL = "https://enviguide.nextechltd.in";

export type SetupEntity =
  | "product-type"
  | "product-category"
  | "product-sub-category"
  | "component-type"
  | "component-category"
  | "industry"
  | "manufacturer"
  | "allocation-method"
  | "aluminium-type"
  | "calculation-method"
  | "category"
  | "certificate-type"
  | "country-iso-three"
  | "country-iso-two"
  | "credit-method"
  | "discharge-destination"
  | "ef-unit"
  | "electricity-location-based"
  | "electricity-market-based"
  | "energy-source"
  | "energy-type"
  | "energy-unit"
  | "fuel-combustion"
  | "fuel-type"
  | "fugitive-emission"
  | "gaseous-fuel-unit"
  | "iron-type"
  | "life-cycle-boundary"
  | "life-cycle-stage"
  | "liquid-fuel-unit"
  | "magnesium-type"
  | "manufacturing-process"
  | "material-composition-metal"
  | "material-composition-metal-type"
  | "material-type"
  | "method-type"
  | "packaging-level"
  | "process-emission"
  | "process-specific-energy"
  | "product-unit"
  | "refrigerent-type"
  | "reporting-standard"
  | "scope-two-method"
  | "silicon-type"
  | "solid-fuel-unit"
  | "steam-heat-cooling"
  | "supplier-tier"
  | "tag"
  | "time-zone"
  | "transport-mode"
  | "transport-modes"
  | "transport-routes"
  | "vehicle-detail"
  | "vehicle-type"
  | "verification-status"
  | "waste-treatment"
  | "water-source"
  | "water-treatment"
  | "water-unit";

export interface SetupItem {
  id?: string;
  code: string;
  name: string;
  description?: string;
}

function getAuthHeaders() {
  const token = authService.getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token || "",
  } as Record<string, string>;
}

function endpoint(
  entity: SetupEntity,
  action: "list" | "add" | "update" | "delete"
) {
  return `${API_BASE_URL}/api/data-setup/${entity}/${action}`;
}

export async function listSetup(
  entity: SetupEntity,
  params?: { searchValue?: string }
): Promise<SetupItem[]> {
  const url = new URL(endpoint(entity, "list"));
  if (params?.searchValue)
    url.searchParams.set("searchValue", params.searchValue);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  // Expected: { status, message, code, data: { totalCount, list: [] } }
  if (Array.isArray((data as any)?.data?.list))
    return (data as any).data.list as SetupItem[];
  // Fallbacks
  if (Array.isArray(data)) return data as SetupItem[];
  if (Array.isArray((data as any)?.data))
    return (data as any).data as SetupItem[];
  if (Array.isArray((data as any)?.items))
    return (data as any).items as SetupItem[];
  return [];
}

export async function addSetup(
  entity: SetupEntity,
  item: SetupItem
): Promise<boolean> {
  const res = await fetch(endpoint(entity, "add"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      code: item.code,
      name: item.name,
      description: item.description ?? "",
    }),
  });
  const data = await res.json();
  return !!(data?.success ?? data?.status);
}

export async function updateSetup(
  entity: SetupEntity,
  item: SetupItem & { id: string }
): Promise<boolean> {
  const res = await fetch(endpoint(entity, "update"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify([
      {
        id: item.id,
        code: item.code,
        name: item.name,
        description: item.description ?? "",
      },
    ]),
  });
  const data = await res.json();
  return !!(data?.success ?? data?.status);
}

export async function deleteSetup(
  entity: SetupEntity,
  id: string
): Promise<boolean> {
  const res = await fetch(endpoint(entity, "delete"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  return !!(data?.success ?? data?.status);
}

export async function bulkAddSetup(
  entity: SetupEntity,
  items: SetupItem[]
): Promise<{ success: boolean; message: string; addedCount?: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/data-setup/${entity}/bulk/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(items.map(item => ({
        code: item.code,
        name: item.name,
        description: item.description ?? "",
      }))),
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
