import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Grid,
  List as ListIcon,
  Search,
  Filter,
  ChevronDown,
  LayoutGrid,
  FileText,
  Star,
  Plus,
  MoreVertical,
} from "lucide-react";

export interface Report {
  id: string;
  title: string;
  description: string;
  module: string;
  type: string;
  tag: string;
  updatedAt: string;
  icon: any;
  iconColor: string;
  moduleColor: string;
  typeColor: string;
  columns?: string[];
  apiType?: "product" | "supplier" | "packaging";
}

export const reportsData: Report[] = [
  {
    id: "1",
    title: "Product Footprint",
    description: "Detailed carbon footprint analysis for all products including raw materials and production.",
    module: "Sustainability",
    type: "System",
    tag: "+",
    updatedAt: "Updated 2h ago",
    icon: FileText,
    iconColor: "text-blue-500 bg-blue-50",
    moduleColor: "text-green-600 bg-green-50",
    typeColor: "text-green-600 bg-green-50",
    columns: ["SL.NO", "Supplier ID/Code", "Supplier name", "Component or Parts Name", "Manufacturer", "Weight (gms) /unit", "Total Weight (gms)", "Component Category", "Transport Mode", "Economic Ratio", "Allocation Methodology", "Raw Materials Emissions", "Production Emissions", "Packaging Emissions", "Waste Emissions", "Transportation Emissions", "PCF [kg CO2e / kg Material]"],
    apiType: "product"
  },
  {
    id: "2",
    title: "Supplier Footprint",
    description: "Emissions tracking across the supplier network and manufacturing regions.",
    module: "Emissions",
    type: "System",
    tag: "+",
    updatedAt: "Updated 5h ago",
    icon: FileText,
    iconColor: "text-purple-500 bg-purple-50",
    moduleColor: "text-orange-600 bg-orange-50",
    typeColor: "text-green-600 bg-green-50",
    columns: ["SL. No.", "Supplier ID/Code", "Supplier Name", "Manufacturing Region", "Component / Part Supplied", "Material Type", "Energy Type Used in Manufacturing", "Energy Quantity (kWh/kg)", "Recycled Content (%)", "Emission Factor", "Supplier Emission"],
    apiType: "supplier"
  },
  {
    id: "3",
    title: "Material Footprint",
    description: "Detailed product material breakdown and recyclability metrics.",
    module: "Sustainability",
    type: "System",
    tag: "+",
    updatedAt: "Updated 1d ago",
    icon: FileText,
    iconColor: "text-green-500 bg-green-50",
    moduleColor: "text-green-600 bg-green-50",
    typeColor: "text-green-600 bg-green-50",
    columns: ["SL.No", "Supplier ID/Code", "Supplier Name", "Material", "Application in Product", "Recyclability (%)", "Weight in kg", "Emission Factor (kg CO₂e/kg material)", "Emission in CO2 eq"]
  },
  {
    id: "4",
    title: "Electricity Footprint",
    description: "Energy consumption and electricity source emissions categories.",
    module: "Emissions",
    type: "System",
    tag: "+",
    updatedAt: "Updated 3h ago",
    icon: FileText,
    iconColor: "text-indigo-500 bg-indigo-50",
    moduleColor: "text-orange-600 bg-orange-50",
    typeColor: "text-green-600 bg-green-50",
    columns: ["Sl.No", "Supplier ID/Code", "Supplier Name", "Electricity Source", "Energy Type", "Emission Factor (kg CO₂e/kWh)", "Emission"]
  },
  {
    id: "5",
    title: "Transportation Footprint",
    description: "Logistics emissions categorized by transport modes and distances.",
    module: "Emissions",
    type: "System",
    tag: "+",
    updatedAt: "Updated 6h ago",
    icon: FileText,
    iconColor: "text-teal-500 bg-teal-50",
    moduleColor: "text-orange-600 bg-orange-50",
    typeColor: "text-green-600 bg-green-50",
    columns: ["Sl. No", "Supplier ID/Code", "Supplier Name", "Mode / Category", "Fuel / Energy Source", "Emission Factor (kg CO₂e / tonne·km)", "Weight Goods in (tons)", "Distance (km)", "Total Emission (kg CO₂e / tonne)"]
  },
  {
    id: "6",
    title: "Packaging Footprint",
    description: "Packaging material types and their contribution to total emissions.",
    module: "Emissions",
    type: "System",
    tag: "+",
    updatedAt: "Updated 4h ago",
    icon: FileText,
    iconColor: "text-amber-500 bg-amber-50",
    moduleColor: "text-orange-600 bg-orange-50",
    typeColor: "text-green-600 bg-green-50",
    columns: ["Sl. No", "Supplier ID/Code", "Supplier Name", "Packaging Material / Type", "Type of energy used", "Recyclability (%)", "Emission Factor (kg CO₂e / kg)", "Emission @ 0.25 kg (kg CO₂e)", "Emission @ 0.5 kg (kg CO₂e)"],
    apiType: "packaging"
  },
  {
    id: "7",
    title: "DQR Rating",
    description: "Comprehensive data quality validation and transparency metrics.",
    module: "Quality",
    type: "System",
    tag: "+",
    updatedAt: "Updated 1h ago",
    icon: FileText,
    iconColor: "text-rose-500 bg-rose-50",
    moduleColor: "text-blue-600 bg-blue-50",
    typeColor: "text-green-600 bg-green-50",
    columns: ["Sl. No", "Supplier ID/Code", "Supplier Name", "Data Source / Supplier", "Data Type", "Technological Representativeness (TeR)", "Geographical Representativeness (GR)", "Temporal Representativeness (TiR)", "Completeness (C)", "Reliability (R)", "Average DQR Score", "Data Quality Level (Catena-X)"]
  },
];


const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("All Reports");

  const sidebarItems = [
    { id: "All Reports", label: "All Reports", icon: BarChart3 },
    { id: "Favorites", label: "Favorites", icon: Star },
    { id: "My Reports", label: "My Reports", icon: FileText },
    { id: "System Reports", label: "System Reports", icon: LayoutGrid },
  ];

  return (
    <div className="flex h-full bg-gray-50/30">
      {/* Reports Hub Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-900 px-2">Reports Hub</h2>
        <nav className="flex flex-col gap-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                ? "bg-green-50 text-green-700"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto space-y-6">
          {/* Banner */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-100">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-500">
                Standardised reports for emissions and data quality analysis
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Reports"
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-gray-600 focus:outline-none hover:border-gray-300 transition-colors cursor-pointer">
                  <option>All Types</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-gray-600 focus:outline-none hover:border-gray-300 transition-colors cursor-pointer">
                  <option>All Modules</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === "grid"
                ? "bg-green-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <Grid className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === "list"
                ? "bg-green-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <ListIcon className="w-4 h-4" />
              List
            </button>
          </div>

          {/* Content Area */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {view === "list" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Report
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tag
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportsData.map((report) => (
                      <tr
                        key={report.id}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/reports/${report.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.iconColor}`}>
                              <report.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{report.title}</div>
                              <div className="text-sm text-gray-500">{report.description}</div>
                              <div className="text-[10px] text-gray-400 mt-1">{report.updatedAt}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.moduleColor}`}>
                            {report.module}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.typeColor}`}>
                            {report.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-gray-400 hover:text-green-500 transition-colors">
                            <Star className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportsData.map((report) => (
                  <div
                    key={report.id}
                    className="group border border-gray-100 rounded-xl p-5 hover:border-green-200 hover:shadow-md transition-all space-y-4 cursor-pointer"
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.iconColor}`}>
                        <report.icon className="w-5 h-5" />
                      </div>
                      <button className="p-1.5 text-gray-400 hover:text-green-500 transition-colors">
                        <Star className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{report.title}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-medium uppercase tracking-wider">System Generated</p>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">{report.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${report.moduleColor}`}>
                        {report.module}
                      </span>
                      <span className="text-[10px] text-gray-400">{report.updatedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

