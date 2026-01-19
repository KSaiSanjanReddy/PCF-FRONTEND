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
} from "lucide-react";

const ReportView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data for the table
    const tableData = [
        {
            sl: 1,
            productId: "PRD-882-X",
            productName: "Eco-Friendly Laptop Chassis",
            category: "Chassis",
            location: "Delhi, India",
            supplier: "ALU TECH Group",
            footprint: "1,240.00",
            footprintUnit: "12.40",
            calcDate: "2024-05-12",
        },
        {
            sl: 2,
            productId: "PRD-882-X",
            productName: "Eco-Friendly Laptop Chassis",
            category: "Chassis",
            location: "Delhi, India",
            supplier: "ALU TECH Group",
            footprint: "1,240.00",
            footprintUnit: "12.40",
            calcDate: "2024-05-12",
        },
        {
            sl: 3,
            productId: "PRD-882-X",
            productName: "Eco-Friendly Laptop Chassis",
            category: "Chassis",
            location: "Delhi, India",
            supplier: "ALU TECH Group",
            footprint: "1,240.00",
            footprintUnit: "12.40",
            calcDate: "2024-05-12",
        },
    ];

    return (
        <div className="flex-1 overflow-auto bg-gray-50/30 p-8 pt-6">
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
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-100">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Product Footprint</h1>
                            <p className="text-gray-500">
                                Carbon Footprint analysis for all product
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

                    <button className="text-xs font-bold text-green-600 hover:text-green-700">
                        + More Filters
                    </button>

                    <button className="bg-green-600 text-white px-6 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors ml-2">
                        Apply
                    </button>

                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-gray-400">Group By:</span>
                        <div className="relative">
                            <select className="appearance-none bg-gray-50 border border-gray-100 rounded-lg px-4 py-1.5 pr-10 text-xs text-gray-600 focus:outline-none hover:border-gray-200 transition-colors cursor-pointer font-medium">
                                <option>Manufacturing Location</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#1EB564] text-white">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">SL.NO</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Product ID</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Product Name</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Product Category</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Manufacturing Location</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Supplier Name</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Carbon Footprint (KgCO2e)</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">Footprint Per Unit (KgCO2e)</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Calculation Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tableData.map((row) => (
                                    <tr key={row.sl} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">{row.sl}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{row.productId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{row.productName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{row.category}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{row.location}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{row.supplier}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{row.footprint}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-600">{row.footprintUnit}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{row.calcDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportView;
