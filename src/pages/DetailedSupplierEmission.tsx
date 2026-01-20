import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Users,
    ChevronDown,
    Truck
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Legend
} from "recharts";
import {
    DetailedHeader,
    ChartCard,
    ChartModal
} from "../components/DashboardComponents";

const emissionByMaterialData = [
    { name: "PP Resin (Reliance Polymers)", value: 2.5, color: "#D9F5C5" },
    { name: "PP Compound (SABIC)", value: 3.1, color: "#B3E699" },
    { name: "Additives (BASF)", value: 4.2, color: "#8CD76D" },
    { name: "Polyethylene Blend (Lotte)", value: 3.7, color: "#66C841" },
    { name: "Catalyst Agent (INEOS)", value: 5.2, color: "#40B915" },
];

const supplierComparisonData = [
    { name: "Supplier A (Virgin)", value: 9.1, color: "#1A5D1A" },
    { name: "Supplier B (Virgin)", value: 8.5, color: "#347C17" },
    { name: "Supplier C (Recycled)", value: 0.8, color: "#D9F5C5" },
    { name: "Supplier D (Recycled)", value: 1.1, color: "#B3E699" },
    { name: "Supplier E (Mixed)", value: 6.5, color: "#8CD76D" },
];

const DetailedSupplierEmission: React.FC = () => {
    const navigate = useNavigate();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    const renderEmissionByMaterial = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emissionByMaterialData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#9CA3AF' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={isModal ? 100 : 60} name="Emission (kg CO₂e/kg)">
                    {emissionByMaterialData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );

    const renderSupplierComparison = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supplierComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#9CA3AF' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={isModal ? 100 : 60} name="Emission Comparison (kg CO₂e/kg)">
                    {supplierComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Comprehensive Supplier Emission Breakdown"
                    subtitle="Detailed analysis of carbon footprint across all supplier partners"
                    onBack={() => navigate("/dashboard")}
                    icon={Truck}
                />

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">From Date</label>
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-400 cursor-pointer">
                            <Calendar className="w-4 h-4" />
                            <span>mm/dd/yyyy</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">To Date</label>
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-400 cursor-pointer">
                            <Calendar className="w-4 h-4" />
                            <span>mm/dd/yyyy</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">Select Client</label>
                        <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-400 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>Select Client</span>
                            </div>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="space-y-6">
                    <ChartCard
                        title="Emission (kg CO₂e/kg)"
                        showExpand
                        onExpand={() => setExpandedChart("material")}
                    >
                        {renderEmissionByMaterial()}
                    </ChartCard>

                    <ChartCard
                        title="Supplier Material Emission Comparison"
                        showExpand
                        onExpand={() => setExpandedChart("supplier")}
                    >
                        {renderSupplierComparison()}
                    </ChartCard>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal
                isOpen={expandedChart === "material"}
                onClose={() => setExpandedChart(null)}
                title="Emission (kg CO₂e/kg) by Material/Supplier"
            >
                {renderEmissionByMaterial(true)}
            </ChartModal>

            <ChartModal
                isOpen={expandedChart === "supplier"}
                onClose={() => setExpandedChart(null)}
                title="Supplier Material Emission Comparison"
            >
                {renderSupplierComparison(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedSupplierEmission;
