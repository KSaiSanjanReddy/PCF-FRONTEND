/**
 * Service for Supplier Questionnaire Dropdown APIs
 * Provides dropdown options for various questionnaire fields
 */

import authService from "./authService";

const API_BASE_URL = "https://enviguide.nextechltd.in";

// Response types
interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  code: number;
  data?: T;
}

// Normalized dropdown item (used by UI)
export interface DropdownItem {
  id: string;
  name: string;
  [key: string]: any;
}

// API response types (different ID field names)
interface FuelTypeApiItem {
  ft_id: string;
  name: string;
  code?: string;
  [key: string]: any;
}

interface SubFuelTypeApiItem {
  sft_id: string;
  name: string;
  ft_id: string;
  fuel_type_name?: string;
  [key: string]: any;
}

interface RefrigerantTypeApiItem {
  rt_id?: string;
  refrigerant_type_id?: string;
  id?: string;
  name: string;
  [key: string]: any;
}

interface EnergySourceApiItem {
  es_id?: string;
  energy_source_id?: string;
  id?: string;
  name: string;
  [key: string]: any;
}

interface EnergyTypeApiItem {
  et_id?: string;
  energy_type_id?: string;
  id?: string;
  name: string;
  es_id?: string;
  [key: string]: any;
}

interface ProcessSpecificEnergyApiItem {
  pse_id?: string;
  id?: string;
  name: string;
  [key: string]: any;
}

interface WasteTypeApiItem {
  wmt_id?: string;
  waste_type_id?: string;
  id?: string;
  name: string;
  [key: string]: any;
}

interface WasteTreatmentTypeApiItem {
  wtt_id?: string;
  waste_treatment_type_id?: string;
  id?: string;
  name: string;
  [key: string]: any;
}

interface ProductUnitApiItem {
  pu_id?: string;
  product_unit_id?: string;
  id?: string;
  name: string;
  [key: string]: any;
}

interface TransportModeApiItem {
  tm_id?: string;
  transport_mode_id?: string;
  id?: string;
  name: string;
  [key: string]: any;
}

// Helper function to make authenticated GET requests
async function fetchDropdown<T>(endpoint: string): Promise<T[]> {
  const token = authService.getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dropdown: ${response.statusText}`);
  }

  const result: ApiResponse<T[]> = await response.json();

  if (!result.status || !result.data) {
    throw new Error(result.message || "Failed to fetch dropdown data");
  }

  return result.data;
}

// Helper to normalize API items to standard DropdownItem format
function normalizeItems<T extends Record<string, any>>(
  items: T[],
  idField: string
): DropdownItem[] {
  return items.map(item => ({
    ...item,
    id: item[idField] || item.id || '',
    name: item.name || '',
  }));
}

/**
 * Q16 - Fuel Type Dropdown for Stationary Combustion
 * GET /api/master-data-setup/fuel-type/drop-down-list
 * Response: { ft_id, name, code }
 */
export async function getFuelTypeDropdown(): Promise<DropdownItem[]> {
  const data = await fetchDropdown<FuelTypeApiItem>("/api/master-data-setup/fuel-type/drop-down-list");
  return normalizeItems(data, 'ft_id');
}

/**
 * Q16 - Sub-Fuel Type Dropdown (depends on Fuel Type selection)
 * GET /api/master-data-setup/sub-fuel-type/drop-down-list-using-ft-id?ft_id={fuelTypeId}
 * Response: { sft_id, name, ft_id, fuel_type_name }
 */
export async function getSubFuelTypeByFuelTypeDropdown(fuelTypeId: string): Promise<DropdownItem[]> {
  const data = await fetchDropdown<SubFuelTypeApiItem>(`/api/master-data-setup/sub-fuel-type/drop-down-list-using-ft-id?ft_id=${fuelTypeId}`);
  return normalizeItems(data, 'sft_id');
}

/**
 * Q17 - All Sub-Fuel Types Dropdown for Mobile Combustion
 * GET /api/master-data-setup/sub-fuel-type/drop-down-list
 * Response: { sft_id, name, ft_id, fuel_type_name }
 */
export async function getSubFuelTypeDropdown(): Promise<DropdownItem[]> {
  const data = await fetchDropdown<SubFuelTypeApiItem>("/api/master-data-setup/sub-fuel-type/drop-down-list");
  return normalizeItems(data, 'sft_id');
}

/**
 * Q19 - Refrigerant Type Dropdown
 * GET /api/master-data-setup/refrigerent-type/drop-down-list
 */
export async function getRefrigerantTypeDropdown(): Promise<DropdownItem[]> {
  const data = await fetchDropdown<RefrigerantTypeApiItem>("/api/master-data-setup/refrigerent-type/drop-down-list");
  // Try different possible ID field names
  return data.map(item => ({
    ...item,
    id: item.rt_id || item.refrigerant_type_id || item.id || '',
    name: item.name || '',
  }));
}

/**
 * Q22, Q44, Q51 - Energy Source Dropdown
 * GET /api/master-data-setup/energy-source/drop-down-list
 */
export async function getEnergySourceDropdown(): Promise<DropdownItem[]> {
  const data = await fetchDropdown<EnergySourceApiItem>("/api/master-data-setup/energy-source/drop-down-list");
  return data.map(item => ({
    ...item,
    id: item.es_id || item.energy_source_id || item.id || '',
    name: item.name || '',
  }));
}

/**
 * Q22, Q44, Q51 - Energy Type Dropdown (depends on Energy Source selection)
 * GET /api/master-data-setup/energy-type/drop-down-list?es_id={energySourceId}
 */
export async function getEnergyTypeBySourceDropdown(energySourceId: string): Promise<DropdownItem[]> {
  const data = await fetchDropdown<EnergyTypeApiItem>(`/api/master-data-setup/energy-type/drop-down-list?es_id=${energySourceId}`);
  return data.map(item => ({
    ...item,
    id: item.et_id || item.energy_type_id || item.id || '',
    name: item.name || '',
  }));
}

/**
 * Q28 - Process Specific Energy Dropdown
 * GET /api/master-data-setup/process-specific-energy/drop-down-list
 */
export async function getProcessSpecificEnergyDropdown(): Promise<DropdownItem[]> {
  const data = await fetchDropdown<ProcessSpecificEnergyApiItem>("/api/master-data-setup/process-specific-energy/drop-down-list");
  return data.map(item => ({
    ...item,
    id: item.pse_id || item.id || '',
    name: item.name || '',
  }));
}

/**
 * Q28 - Energy Type Dropdown (all energy types)
 * GET /api/master-data-setup/energy-type/drop-down-list
 */
export async function getEnergyTypeDropdown(): Promise<DropdownItem[]> {
  const data = await fetchDropdown<EnergyTypeApiItem>("/api/master-data-setup/energy-type/drop-down-list");
  return data.map(item => ({
    ...item,
    id: item.et_id || item.energy_type_id || item.id || '',
    name: item.name || '',
  }));
}

/**
 * Q40, Q68 - Waste Material Type Dropdown
 * GET /api/ecoinvent-emission-factor-data-setup/waste-material-type-emission-factor/drop-down-list
 */
export async function getWasteTypeDropdown(): Promise<DropdownItem[]> {
  const data = await fetchDropdown<WasteTypeApiItem>("/api/ecoinvent-emission-factor-data-setup/waste-material-type-emission-factor/drop-down-list");
  return data.map(item => ({
    ...item,
    id: item.wmt_id || item.waste_type_id || item.id || '',
    name: item.name || '',
  }));
}

/**
 * Q40, Q68 - Waste Treatment Type Dropdown
 * GET /api/ecoinvent-emission-factor-data-setup/waste-treatment-type/drop-down-list
 */
export async function getWasteTreatmentTypeDropdown(): Promise<DropdownItem[]> {
  const data = await fetchDropdown<WasteTreatmentTypeApiItem>("/api/ecoinvent-emission-factor-data-setup/waste-treatment-type/drop-down-list");
  return data.map(item => ({
    ...item,
    id: item.wtt_id || item.waste_treatment_type_id || item.id || '',
    name: item.name || '',
  }));
}

/**
 * Unit of Measure Dropdown (Product Unit)
 * GET /api/master-data-setup/product-unit/drop-down-list
 */
export async function getProductUnitDropdown(): Promise<DropdownItem[]> {
  const data = await fetchDropdown<ProductUnitApiItem>("/api/master-data-setup/product-unit/drop-down-list");
  return data.map(item => ({
    ...item,
    id: item.pu_id || item.product_unit_id || item.id || '',
    name: item.name || '',
  }));
}

/**
 * Transport Mode Dropdown
 * GET /api/master-data-setup/transport-modes/drop-down-list
 */
export async function getTransportModeDropdown(): Promise<DropdownItem[]> {
  const data = await fetchDropdown<TransportModeApiItem>("/api/master-data-setup/transport-modes/drop-down-list");
  return data.map(item => ({
    ...item,
    id: item.tm_id || item.transport_mode_id || item.id || '',
    name: item.name || '',
  }));
}

// Export all functions as a service object
const questionnaireDropdownService = {
  getFuelTypeDropdown,
  getSubFuelTypeByFuelTypeDropdown,
  getSubFuelTypeDropdown,
  getRefrigerantTypeDropdown,
  getEnergySourceDropdown,
  getEnergyTypeBySourceDropdown,
  getProcessSpecificEnergyDropdown,
  getEnergyTypeDropdown,
  getWasteTypeDropdown,
  getWasteTreatmentTypeDropdown,
  getProductUnitDropdown,
  getTransportModeDropdown,
};

export default questionnaireDropdownService;
