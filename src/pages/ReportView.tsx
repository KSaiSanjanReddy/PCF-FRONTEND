import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    FileText,
    Star,
    Download,
    Calendar,
    ChevronDown,
    Filter,
    Check,
    Plus,
    Minus,
    Search as SearchIcon,
    X,
    Settings,
} from "lucide-react";
import { reportsData } from "./Reports";

const ReportView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const report = reportsData.find((r) => r.id === id);

    const [visibleColumns, setVisibleColumns] = useState<string[]>(report?.columns || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Update visible columns if report changes
    React.useEffect(() => {
        if (report?.columns) {
            setVisibleColumns(report.columns);
        }
    }, [report]);

    const toggleColumn = (column: string) => {
        setVisibleColumns(prev =>
            prev.includes(column)
                ? prev.filter(c => c !== column)
                : [...prev, column]
        );
    };

    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [isReportVisible, setIsReportVisible] = useState(true);
    const [filterRows, setFilterRows] = useState<{ id: number; column: string; condition: string; value1: string; value2: string }[]>([]);

    const getColumnType = (col: string): "string" | "number" => {
        if (!col) return "string";
        const numCols = ["SL.NO", "SL. No.", "Sl.No", "Sl. No", "Carbon Footprint", "Footprint Per Unit", "Total Footprint", "Quantity", "Intensity", "DQR Rating"];
        if (numCols.some(n => col.includes(n))) return "number";
        return "string";
    };

    const addFilterRow = () => {
        setFilterRows([...filterRows, { id: Date.now(), column: "", condition: "", value1: "", value2: "" }]);
    };

    const removeFilterRow = (id: number) => {
        setFilterRows(filterRows.filter(row => row.id !== id));
    };

    const updateFilterRow = (id: number, updates: any) => {
        setFilterRows(filterRows.map(row => {
            if (row.id === id) {
                const newRow = { ...row, ...updates };
                // Reset condition if column changed
                if (updates.column && updates.column !== row.column) {
                    newRow.condition = getColumnType(updates.column) === "string" ? "Equal to" : "Less than";
                    newRow.value1 = "";
                    newRow.value2 = "";
                }
                return newRow;
            }
            return row;
        }));
    };

    const filteredColumns = report?.columns?.filter(c =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="flex-1 overflow-auto bg-gray-50/30 p-8 pt-6 relative">
            <div className="max-w-9xl mx-auto space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/reports")}
                    className="flex items-center gap-2 text-gray-900 font-bold hover:text-green-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Reports
                </button>

                {/* Report Header Banner */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${report?.iconColor || "bg-green-500 text-white shadow-green-100"}`}>
                            {report?.icon ? <report.icon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{report?.title || "Report"}</h1>
                            <p className="text-gray-500">
                                {report?.description || "Report analysis and overview"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                            Add to Favorites
                        </button>
                        <button className="px-4 py-2 border border-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            Clear All
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-sm">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-600">
                        <Filter className="w-3.5 h-3.5" />
                        Filters
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-xs font-medium text-gray-600 min-w-[200px]">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Jan 01, 2024 - Dec 31, 2024</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                    </div>

                    <button
                        onClick={() => {
                            const newState = !showMoreFilters;
                            setShowMoreFilters(newState);
                            setIsReportVisible(!newState);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-bold transition-colors ${showMoreFilters ? "bg-green-50 border-green-200 text-green-600" : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"}`}
                    >
                        <Plus className={`w-3.5 h-3.5 ${showMoreFilters ? "rotate-45" : ""} transition-transform`} />
                        More Filters
                    </button>

                    <button
                        onClick={() => {
                            setShowMoreFilters(false);
                            setIsReportVisible(true);
                        }}
                        className="bg-blue-600 text-white px-8 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 ml-2"
                    >
                        Apply
                    </button>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="ml-auto flex items-center gap-2 px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        Select Columns
                    </button>
                </div>

                {/* More Filters Rows */}
                {showMoreFilters && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                        {filterRows.map((row) => (
                            <div key={row.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm animate-in fade-in zoom-in duration-200">
                                <div className="flex-1 grid grid-cols-3 gap-4">
                                    {/* Column Selector */}
                                    <div className="relative group">
                                        <select
                                            value={row.column}
                                            onChange={(e) => updateFilterRow(row.id, { column: e.target.value })}
                                            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 cursor-pointer transition-all hover:border-gray-300"
                                        >
                                            <option value="" disabled>Select Column</option>
                                            {report?.columns?.filter(col => !["SL.NO", "SL. No.", "Sl.No", "Sl. No", "SL NO"].includes(col.toUpperCase())).map(col => (
                                                <option key={col} value={col}>{col}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none group-focus-within:text-green-500 transition-colors" />
                                    </div>

                                    {/* Condition Selector */}
                                    <div className="relative group">
                                        <select
                                            value={row.condition}
                                            onChange={(e) => updateFilterRow(row.id, { condition: e.target.value })}
                                            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 cursor-pointer transition-all hover:border-gray-300"
                                        >
                                            <option value="" disabled>Condition</option>
                                            {!row.column ? (
                                                <option disabled>Select a column first</option>
                                            ) : getColumnType(row.column) === "string" ? (
                                                <option value="Equal to">Equal to</option>
                                            ) : (
                                                <>
                                                    <option value="Less than">Less than</option>
                                                    <option value="Greater than">Greater than</option>
                                                    <option value="Equal to">Equal to</option>
                                                    <option value="Range">Range (From and To)</option>
                                                </>
                                            )}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none group-focus-within:text-green-500 transition-colors" />
                                    </div>

                                    {/* Value Input */}
                                    <div className="flex items-center gap-2">
                                        {row.condition === "Range" ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="From"
                                                    value={row.value1}
                                                    onChange={(e) => updateFilterRow(row.id, { value1: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 transition-all"
                                                />
                                                <span className="text-gray-400 text-xs">to</span>
                                                <input
                                                    type="number"
                                                    placeholder="To"
                                                    value={row.value2}
                                                    onChange={(e) => updateFilterRow(row.id, { value2: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 transition-all"
                                                />
                                            </div>
                                        ) : (
                                            <input
                                                type={getColumnType(row.column) === "number" ? "number" : "text"}
                                                placeholder="Select or input values"
                                                value={row.value1}
                                                onChange={(e) => updateFilterRow(row.id, { value1: e.target.value })}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 transition-all hover:border-gray-300"
                                            />
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFilterRow(row.id)}
                                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addFilterRow}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-400 hover:border-green-300 hover:text-green-600 hover:bg-green-50/30 transition-all w-full justify-center group"
                        >
                            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Add Another Filter Condition
                        </button>
                    </div>
                )}

                {/* Data Table */}
                {isReportVisible && (
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-300">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-max">
                                <thead>
                                    <tr className="bg-[#1EB564] text-white">
                                        {report?.columns?.filter(col => visibleColumns.includes(col)).map((column, index) => (
                                            <th key={index} className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                                                {column}
                                            </th>
                                        ))}
                                        {!report?.columns && (
                                            <>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">SL.NO</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Product ID</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Product Name</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Product Category</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Manufacturing Location</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Supplier Name</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Carbon Footprint (KgCO2e)</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">Footprint Per Unit (KgCO2e)</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Calculation Date</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[1, 2, 3].map((rowIdx) => (
                                        <tr key={rowIdx} className="hover:bg-gray-50/50 transition-colors">
                                            {report?.columns?.filter(col => visibleColumns.includes(col)).map((col, colIdx) => (
                                                <td key={colIdx} className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                    {col === "SL.NO" || col === "SL. No." || col === "Sl.No" || col === "Sl. No" ? rowIdx : `Data ${rowIdx}-${colIdx}`}
                                                </td>
                                            ))}
                                            {!report?.columns && (
                                                <>
                                                    <td className="px-6 py-4 text-sm text-gray-600">1</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">PRD-882-X</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">Eco-Friendly Laptop Chassis</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">Chassis</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">Delhi, India</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">ALU TECH Group</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">1,240.00</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">12.40</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">2024-05-12</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Column Selection Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Select Columns</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search here"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-12 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-xs font-bold hover:text-blue-600"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto space-y-1 scrollbar-hide">
                                {filteredColumns.map((column) => (
                                    <label
                                        key={column}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${visibleColumns.includes(column)
                                            ? "bg-green-50"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <div
                                            onClick={() => toggleColumn(column)}
                                            className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${visibleColumns.includes(column)
                                                ? "bg-purple-600 border-purple-600"
                                                : "bg-white border-gray-300"
                                                }`}
                                        >
                                            {visibleColumns.includes(column) && (
                                                <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                                            )}
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">
                                            {column}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default ReportView;
