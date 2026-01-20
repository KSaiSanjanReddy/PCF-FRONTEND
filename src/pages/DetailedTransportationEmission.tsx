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

const transportModeData = [
    { name: "Truck (Diesel)", distance: 12500, emission: 8500, share: 65 },
    { name: "Rail", distance: 8200, emission: 1200, share: 15 },
    { name: "Ship", distance: 25000, emission: 4500, share: 12 },
    { name: "Air Freight", distance: 4200, emission: 15500, share: 8 },
];

const regionTransportData = [
    { name: "Asia - Road", distance: 5000, factor: 100, total: 4300 },
    { name: "Europe - Rail", distance: 3200, factor: 50, total: 450 },
    { name: "N. America - Road", distance: 4800, factor: 120, total: 3800 },
    { name: "S. America - Sea", distance: 12000, factor: 80, total: 650 },
    { name: "Middle East - Air", distance: 6000, factor: 200, total: 7500 },
    { name: "Africa - Road/Sea", distance: 8800, factor: 140, total: 4400 },
];

const distanceCorrelationData = [
    { name: "Road (500)", km: 500, emission: 90, color: "#1A5D1A" },
    { name: "Road (1000)", km: 1000, emission: 180, color: "#347C17" },
    { name: "Road (2000)", km: 2000, emission: 360, color: "#52C41A" },
    { name: "Rail (500)", km: 500, emission: 25, color: "#D9F5C5" },
    { name: "Rail (1000)", km: 1000, emission: 50, color: "#B3E699" },
    { name: "Sea (5000)", km: 5000, emission: 100, color: "#8CD76D" },
    { name: "Sea (10000)", km: 10000, emission: 200, color: "#66C841" },
    { name: "Air (1000)", km: 1000, emission: 850, color: "#1A5D1A" },
    { name: "Air (2000)", km: 2000, emission: 1700, color: "#347C17" },
];

const DetailedTransportationEmission: React.FC = () => {
    const navigate = useNavigate();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    const renderTransportMode = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transportModeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="distance" fill="#52C41A" radius={[4, 4, 0, 0]} name="Distance (km)" />
                <Bar dataKey="emission" fill="#B3E699" radius={[4, 4, 0, 0]} name="CO₂e (kg)" />
                <Bar dataKey="share" fill="#1A5D1A" radius={[4, 4, 0, 0]} name="Share (%)" />
            </BarChart>
        </ResponsiveContainer>
    );

    const renderRegionTransport = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionTransportData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} angle={-20} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="distance" fill="#52C41A" radius={[4, 4, 0, 0]} name="Distance (km)" />
                <Bar dataKey="factor" fill="#B3E699" radius={[4, 4, 0, 0]} name="Emission Factor" />
                <Bar dataKey="total" fill="#1A5D1A" radius={[4, 4, 0, 0]} name="Total Emission" />
            </BarChart>
        </ResponsiveContainer>
    );

    const renderDistanceCorrelation = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distanceCorrelationData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#9CA3AF' }} angle={-25} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="km" fill="#52C41A" radius={[4, 4, 0, 0]} name="Distance (km)" />
                <Bar dataKey="emission" fill="#B3E699" radius={[4, 4, 0, 0]} name="Emission (kg CO₂e/ton)" />
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="Transportation Emission Details"
                    subtitle="Comprehensive analysis of emissions from various transportation methods"
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

                <div className="space-y-6">
                    <ChartCard title="Mode of Transportation Emission" showExpand onExpand={() => setExpandedChart("mode")}>
                        {renderTransportMode()}
                    </ChartCard>
                    <ChartCard title="Region Wise Transportation Emission" showExpand onExpand={() => setExpandedChart("region")}>
                        {renderRegionTransport()}
                    </ChartCard>
                    <ChartCard title="Distance vs Emission Correlation" showExpand onExpand={() => setExpandedChart("correlation")}>
                        {renderDistanceCorrelation()}
                    </ChartCard>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal isOpen={expandedChart === "mode"} onClose={() => setExpandedChart(null)} title="Mode of Transportation Emission">
                {renderTransportMode(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "region"} onClose={() => setExpandedChart(null)} title="Region Wise Transportation Emission">
                {renderRegionTransport(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "correlation"} onClose={() => setExpandedChart(null)} title="Distance vs Emission Correlation">
                {renderDistanceCorrelation(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedTransportationEmission;
