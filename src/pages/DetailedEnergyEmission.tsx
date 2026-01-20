import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Users,
    ChevronDown,
    Zap
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

const energySourceData = [
    { name: "Coal", share: 35, emission: 950 },
    { name: "Natural Gas", share: 25, emission: 180 },
    { name: "Oil", share: 29, emission: 850 },
    { name: "Hydro Power", share: 10, emission: 15 },
    { name: "Solar Power", share: 6, emission: 8 },
    { name: "Wind Power", share: 4, emission: 5 },
];

const processEnergyData = [
    { name: "Raw Material Extraction", consumption: 1200, emission: 850 },
    { name: "Material Processing", consumption: 2400, emission: 1800 },
    { name: "Manufacturing", consumption: 3200, emission: 2200 },
    { name: "Assembly", consumption: 800, emission: 300 },
    { name: "Packaging", consumption: 450, emission: 150 },
    { name: "Transportation", consumption: 1500, emission: 1000 },
    { name: "Use Phase", consumption: 5200, emission: 4100 },
    { name: "End-of-Life", consumption: 600, emission: 400 },
];

const DetailedEnergyEmission: React.FC = () => {
    const navigate = useNavigate();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    const renderEnergySource = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={energySourceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={[0, 40]} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={[0, 1000]} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="share" fill="#52C41A" radius={[4, 4, 0, 0]} name="Energy Share (%)" />
                <Bar yAxisId="right" dataKey="emission" fill="#B3E699" radius={[4, 4, 0, 0]} name="Total Emission (kg CO₂e)" />
            </BarChart>
        </ResponsiveContainer>
    );

    const renderProcessEnergy = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processEnergyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#9CA3AF' }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="consumption" fill="#1A5D1A" radius={[4, 4, 0, 0]} name="Energy Consumption (kWh)" />
                <Bar dataKey="emission" fill="#52C41A" radius={[4, 4, 0, 0]} name="Emission (kg CO₂e)" />
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Energy Consumption Emission Analysis"
                    subtitle="Comprehensive breakdown of emissions associated with different energy sources across operations"
                    onBack={() => navigate("/dashboard")}
                    icon={Zap}
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
                    <ChartCard title="Energy Source" showExpand onExpand={() => setExpandedChart("source")}>
                        {renderEnergySource()}
                    </ChartCard>
                    <ChartCard title="Process Wise Energy Consumption" showExpand onExpand={() => setExpandedChart("process")}>
                        {renderProcessEnergy()}
                    </ChartCard>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal isOpen={expandedChart === "source"} onClose={() => setExpandedChart(null)} title="Energy Source">
                {renderEnergySource(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "process"} onClose={() => setExpandedChart(null)} title="Process Wise Energy Consumption">
                {renderProcessEnergy(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedEnergyEmission;
