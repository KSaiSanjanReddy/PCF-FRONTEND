import authService from "./authService";

const API_BASE_URL = "https://enviguide.nextechltd.in";

export type SetupEntity =
  | "product-type"
  | "product-category"
  | "product-sub-category"
  | "component-type"
  | "component-category"
  | "industry"
  | "manufacturer";

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
