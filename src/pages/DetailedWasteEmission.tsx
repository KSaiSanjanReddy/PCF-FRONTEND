import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Users,
    ChevronDown,
    Trash2
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import {
    DetailedHeader,
    ChartCard,
    ChartModal
} from "../components/DashboardComponents";

const wasteTreatmentData = [
    { name: "Recycling", generated: 4500, emission: 200 },
    { name: "Composting", generated: 3200, emission: 500 },
    { name: "Landfill", generated: 6000, emission: 4800 },
    { name: "Incineration", generated: 2200, emission: 3000 },
    { name: "Total", generated: 15900, emission: 8500 },
];

const DetailedWasteEmission: React.FC = () => {
    const navigate = useNavigate();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    const renderWasteTreatment = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wasteTreatmentData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    label={{ value: 'Waste Treatment Methods', position: 'insideBottom', offset: -20, fontSize: 12, fontWeight: 'bold' }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                    label={{ value: 'Quantity / Impact', angle: -90, position: 'insideLeft', offset: 0, fontSize: 12, fontWeight: 'bold' }}
                />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="generated" fill="#52C41A" radius={[4, 4, 0, 0]} name="Waste Generated (kg)" />
                <Bar dataKey="emission" fill="#B3E699" radius={[4, 4, 0, 0]} name="Emission (kg CO₂e)" />
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Waste Emission Details"
                    subtitle="Comprehensive analysis of emissions caused by waste generation and disposal"
                    onBack={() => navigate("/dashboard")}
                    icon={Trash2}
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
                    <ChartCard title="Waste Treatment" showExpand onExpand={() => setExpandedChart("waste")}>
                        {renderWasteTreatment()}
                    </ChartCard>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal isOpen={expandedChart === "waste"} onClose={() => setExpandedChart(null)} title="Waste Treatment">
                {renderWasteTreatment(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedWasteEmission;
