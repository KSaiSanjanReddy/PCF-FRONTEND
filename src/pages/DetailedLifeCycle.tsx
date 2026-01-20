import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Users,
    ChevronDown,
    RefreshCw
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

const lifeCyclePercentData = [
    { name: "Raw Material Emission", value: 42, color: "#1A5D1A" },
    { name: "Manufacturing", value: 32, color: "#458C21" },
    { name: "Packaging", value: 10, color: "#74B72E" },
    { name: "Transportation", value: 12, color: "#98FB98" },
    { name: "End of Life", value: 4, color: "#C1FFC1" },
];

const emissionIntensityData = [
    { name: "Tier 2 - Raw Materials", value: 1.8 },
    { name: "Tier 1 - Components", value: 1.1 },
    { name: "Manufacturing", value: 0.95 },
    { name: "Packaging", value: 0.72 },
    { name: "Inbound & Outbound", value: 1.0 },
];

const productsComparisonData = [
    { name: "Product A", energy: 450, emission: 120 },
    { name: "Product B", energy: 540, emission: 145 },
    { name: "Product C", energy: 380, emission: 105 },
    { name: "Product D", energy: 480, emission: 130 },
];

const DetailedLifeCycle: React.FC = () => {
    const navigate = useNavigate();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    const renderLifeCycleChart = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lifeCyclePercentData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={isModal ? 80 : 40} name="Emission Percentage (%)">
                    {lifeCyclePercentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );

    const renderIntensityChart = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emissionIntensityData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={isModal ? 80 : 40} name="Intensity (kg CO₂e/unit)" />
            </BarChart>
        </ResponsiveContainer>
    );

    const renderComparisonChart = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productsComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="energy" fill="#D9F5C5" radius={[4, 4, 0, 0]} barSize={isModal ? 60 : 30} name="Energy Consumption (kWh)" />
                <Bar dataKey="emission" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={isModal ? 60 : 30} name="Emission (kg CO₂e)" />
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Detailed Life Cycle Analysis"
                    subtitle="Comprehensive breakdown of emissions across all product life cycle stages"
                    onBack={() => navigate("/dashboard")}
                    icon={RefreshCw}
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

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: "Raw Material", value: "42%", color: "text-green-800" },
                        { label: "Manufacturing", value: "32%", color: "text-green-700" },
                        { label: "Packaging", value: "10%", color: "text-green-600" },
                        { label: "Transportation", value: "12%", color: "text-green-500" },
                        { label: "End of Life", value: "4%", color: "text-green-400" },
                    ].map((kpi, idx) => (
                        <div key={idx} className="bg-white border border-gray-50 rounded-2xl p-6 shadow-sm">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{kpi.label}</p>
                            <h3 className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <ChartCard
                        title="Product Life Cycle Emission (%)"
                        showExpand
                        onExpand={() => setExpandedChart("lifecycle")}
                    >
                        {renderLifeCycleChart()}
                    </ChartCard>

                    <ChartCard
                        title="Emission Intensity by Supply Chain Stage (kg CO₂e/unit)"
                        showExpand
                        onExpand={() => setExpandedChart("intensity")}
                    >
                        {renderIntensityChart()}
                    </ChartCard>

                    <div className="lg:col-span-2">
                        <ChartCard
                            title="Products Emission Comparison"
                            showExpand
                            onExpand={() => setExpandedChart("comparison")}
                        >
                            {renderComparisonChart()}
                        </ChartCard>
                    </div>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal
                isOpen={expandedChart === "lifecycle"}
                onClose={() => setExpandedChart(null)}
                title="Product Life Cycle Emission (%)"
            >
                {renderLifeCycleChart(true)}
            </ChartModal>

            <ChartModal
                isOpen={expandedChart === "intensity"}
                onClose={() => setExpandedChart(null)}
                title="Emission Intensity by Supply Chain Stage"
            >
                {renderIntensityChart(true)}
            </ChartModal>

            <ChartModal
                isOpen={expandedChart === "comparison"}
                onClose={() => setExpandedChart(null)}
                title="Products Emission Comparison"
            >
                {renderComparisonChart(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedLifeCycle;
