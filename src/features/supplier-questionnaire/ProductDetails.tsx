import React from "react";
import type { SupplierQuestionnaireData } from "../../lib/supplierQuestionnaireService";
import { QUESTIONNAIRE_OPTIONS } from "../../config/questionnaireConfig";

interface ProductDetailsProps {
  data: SupplierQuestionnaireData["product_details"];
  updateData: (data: Partial<SupplierQuestionnaireData["product_details"]>) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ data, updateData }) => {
  const handleChange = (field: keyof SupplierQuestionnaireData["product_details"], value: any) => {
    updateData({ ...data, [field]: value });
  };

  // Production Site Details Helpers
  const handleSiteChange = (index: number, field: string, value: any) => {
    const newSites = [...(data.production_site_details || [])];
    if (!newSites[index]) {
        newSites[index] = { component_name: "", location: "" };
    }
    (newSites[index] as any)[field] = value;
    updateData({ ...data, production_site_details: newSites });
  };

  const addSiteRow = () => {
    const newSites = [...(data.production_site_details || []), { component_name: "", location: "" }];
    updateData({ ...data, production_site_details: newSites });
  };

  const removeSiteRow = (index: number) => {
    const newSites = [...(data.production_site_details || [])];
    newSites.splice(index, 1);
    updateData({ ...data, production_site_details: newSites });
  };

  // Products Manufactured Helpers
  const handleProductChange = (index: number, field: string, value: any) => {
    const newProducts = [...(data.products_manufactured || [])];
    if (!newProducts[index]) {
        newProducts[index] = { product_name: "", production_period: "", weight_per_unit: 0, unit: "", price: 0, quantity: 0 };
    }
    (newProducts[index] as any)[field] = value;
    updateData({ ...data, products_manufactured: newProducts });
  };

  const addProductRow = () => {
    const newProducts = [...(data.products_manufactured || []), { product_name: "", production_period: "", weight_per_unit: 0, unit: "", price: 0, quantity: 0 }];
    updateData({ ...data, products_manufactured: newProducts });
  };

  const removeProductRow = (index: number) => {
    const newProducts = [...(data.products_manufactured || [])];
    newProducts.splice(index, 1);
    updateData({ ...data, products_manufactured: newProducts });
  };

  // Impact Methods Helper
  const handleImpactMethodChange = (method: string, checked: boolean) => {
    const currentMethods = data.required_environmental_impact_methods || [];
    let newMethods;
    if (checked) {
      newMethods = [...currentMethods, method];
    } else {
      newMethods = currentMethods.filter((m) => m !== method);
    }
    updateData({ ...data, required_environmental_impact_methods: newMethods });
  };

  return (
    <div className="space-y-8">
      {/* Existing PCF Report */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Existing PCF Report</h3>
        
        <div className="flex items-start mb-4">
          <div className="flex items-center h-5">
            <input
              id="existing_pcf_report"
              name="existing_pcf_report"
              type="checkbox"
              checked={data.existing_pcf_report}
              onChange={(e) => handleChange("existing_pcf_report", e.target.checked)}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="existing_pcf_report" className="font-medium text-gray-700">
              Do you have an existing PCF Report (within last 12 months)?
            </label>
          </div>
        </div>

        {data.existing_pcf_report && (
          <div className="space-y-4">
            <div>
              <label htmlFor="pcf_methodology" className="block text-sm font-medium text-gray-700">
                PCF Methodology Used
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="pcf_methodology"
                  id="pcf_methodology"
                  value={data.pcf_methodology || ""}
                  onChange={(e) => handleChange("pcf_methodology", e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., ISO 14067, GHG Protocol"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Upload PCF Report</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Production Site Details */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Production Site Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component / Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.production_site_details?.map((site, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={site.component_name}
                      onChange={(e) => handleSiteChange(index, "component_name", e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={site.location}
                      onChange={(e) => handleSiteChange(index, "location", e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => removeSiteRow(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addSiteRow}
            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Site
          </button>
        </div>
      </div>

      {/* Required Environmental Impact Methods */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Required Environmental Impact Methods</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUESTIONNAIRE_OPTIONS.REQUIRED_ENVIRONMENTAL_IMPACT_METHODS.map((method) => (
            <div key={method} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={`impact_method_${method}`}
                  name={`impact_method_${method}`}
                  type="checkbox"
                  checked={data.required_environmental_impact_methods?.includes(method)}
                  onChange={(e) => handleImpactMethodChange(method, e.target.checked)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={`impact_method_${method}`} className="font-medium text-gray-700">
                  {method}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products / Components Manufactured */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Products / Components Manufactured</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product / Component</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Production Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight per Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.products_manufactured?.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={product.product_name}
                      onChange={(e) => handleProductChange(index, "product_name", e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={product.production_period}
                      onChange={(e) => handleProductChange(index, "production_period", e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                        <option value="">Select</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Annual">Annual</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={product.weight_per_unit}
                      onChange={(e) => handleProductChange(index, "weight_per_unit", parseFloat(e.target.value))}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={product.unit}
                      onChange={(e) => handleProductChange(index, "unit", e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                        <option value="">Select</option>
                        <option value="kg">kg</option>
                        <option value="tons">tons</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => handleProductChange(index, "price", parseFloat(e.target.value))}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, "quantity", parseFloat(e.target.value))}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => removeProductRow(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addProductRow}
            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
