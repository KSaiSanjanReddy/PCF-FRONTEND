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
    Legend,
    ComposedChart,
    Line
} from "recharts";
import {
    DetailedHeader,
    ChartCard,
    ChartModal
} from "../components/DashboardComponents";

const recyclabilityData = [
    { name: "PP", total: 1000, recycled: 400, percent: 40 },
    { name: "PE", total: 1400, recycled: 600, percent: 42.8 },
    { name: "PET", total: 1800, recycled: 1100, percent: 61.1 },
    { name: "ABS", total: 900, recycled: 350, percent: 38.8 },
    { name: "PVC", total: 700, recycled: 200, percent: 28.5 },
];

const virginRecycledData = [
    { name: "% Material Used", virgin: 100, recycled: 100 },
    { name: "CO₂ Emissions", virgin: 20, recycled: 2 },
    { name: "Energy Use", virgin: 80, recycled: 5 },
    { name: "Water Use", virgin: 140, recycled: 10 },
];

const DetailedRecyclability: React.FC = () => {
    const navigate = useNavigate();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    const renderRecyclability = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={recyclabilityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={[0, 100]} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="total" fill="#52C41A" radius={[4, 4, 0, 0]} name="Total Material Used (kg)" />
                <Bar yAxisId="left" dataKey="recycled" fill="#B3E699" radius={[4, 4, 0, 0]} name="Recycled Content (kg)" />
                <Line yAxisId="right" type="linear" dataKey="percent" stroke="#1A5D1A" strokeWidth={3} dot={{ fill: '#1A5D1A', r: 4 }} name="% Recycled Material" />
            </ComposedChart>
        </ResponsiveContainer>
    );

    const renderVirginRecycled = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={virginRecycledData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="virgin" fill="#D9F5C5" radius={[4, 4, 0, 0]} name="Virgin Aluminum" />
                <Bar dataKey="recycled" fill="#52C41A" radius={[4, 4, 0, 0]} name="Recycled Aluminum" />
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Recyclability Metrics - Detailed View"
                    subtitle="Comprehensive analysis of material recyclability and circularity metrics across product components"
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

                <div className="space-y-6">
                    <ChartCard title="Recyclability" showExpand onExpand={() => setExpandedChart("recyclability")}>
                        {renderRecyclability()}
                    </ChartCard>
                    <ChartCard title="Virgin / Recycled" showExpand onExpand={() => setExpandedChart("virgin-recycled")}>
                        {renderVirginRecycled()}
                    </ChartCard>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal isOpen={expandedChart === "recyclability"} onClose={() => setExpandedChart(null)} title="Recyclability">
                {renderRecyclability(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "virgin-recycled"} onClose={() => setExpandedChart(null)} title="Virgin / Recycled">
                {renderVirginRecycled(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedRecyclability;
