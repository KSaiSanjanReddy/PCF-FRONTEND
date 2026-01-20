import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Users,
    ChevronDown,
    Package
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

const packagingRecyclabilityData = [
    { name: "Corrugated Cardboard", share: 48, recyclability: 90 },
    { name: "LDPE Film", share: 22, recyclability: 75 },
    { name: "PET Plastic", share: 25, recyclability: 85 },
    { name: "Metal Cap", share: 10, recyclability: 100 },
];

const packagingEmissionData = [
    { name: "Corrugated Cardboard", mass: 0.5, factor: 0.8, emission: 0.4 },
    { name: "LDPE Film", mass: 0.15, factor: 2.1, emission: 0.31 },
    { name: "PET Plastic", mass: 0.2, factor: 2.5, emission: 0.8 },
    { name: "Metal Cap", mass: 0.05, factor: 3.2, emission: 0.16 },
];

const DetailedPackagingEmission: React.FC = () => {
    const navigate = useNavigate();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    const renderRecyclability = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={packagingRecyclabilityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="share" fill="#52C41A" radius={[4, 4, 0, 0]} name="Share (%)" />
                <Bar dataKey="recyclability" fill="#D9F5C5" radius={[4, 4, 0, 0]} name="Recyclability (%)" />
            </BarChart>
        </ResponsiveContainer>
    );

    const renderEmission = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={packagingEmissionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="mass" fill="#D9F5C5" radius={[4, 4, 0, 0]} name="Mass (kg/unit)" />
                <Bar dataKey="factor" fill="#B3E699" radius={[4, 4, 0, 0]} name="Emission Factor (kg CO₂e/kg)" />
                <Bar dataKey="emission" fill="#52C41A" radius={[4, 4, 0, 0]} name="Emission (kg CO₂e/unit)" />
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Packaging Emission Details"
                    subtitle="In-depth analysis of packaging carbon footprint"
                    onBack={() => navigate("/dashboard")}
                    icon={Package}
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
                    <ChartCard title="Packaging Material and Recyclability" showExpand onExpand={() => setExpandedChart("recyclability")}>
                        {renderRecyclability()}
                    </ChartCard>
                    <ChartCard title="Packaging Emission" showExpand onExpand={() => setExpandedChart("emission")}>
                        {renderEmission()}
                    </ChartCard>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal isOpen={expandedChart === "recyclability"} onClose={() => setExpandedChart(null)} title="Packaging Material and Recyclability">
                {renderRecyclability(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "emission"} onClose={() => setExpandedChart(null)} title="Packaging Emission">
                {renderEmission(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedPackagingEmission;
