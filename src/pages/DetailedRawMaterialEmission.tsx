import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Users,
    ChevronDown,
    Box
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
    LineChart,
    Line,
    Legend,
    ComposedChart
} from "recharts";
import {
    DetailedHeader,
    ChartCard,
    ChartModal
} from "../components/DashboardComponents";

const manufacturingProcessData = [
    { name: "Extrusion", energy: 12.5, emission: 4.2 },
    { name: "Injection Molding", energy: 18.0, emission: 6.1 },
    { name: "Drying", energy: 9.2, emission: 3.1 },
    { name: "Assembly", energy: 4.5, emission: 1.5 },
    { name: "Finishing", energy: 8.0, emission: 2.7 },
];

const processEnergyData = [
    { name: "Electricity", extrusion: 45, molding: 52, drying: 48 },
    { name: "Natural Gas", extrusion: 30, molding: 20, drying: 25 },
    { name: "Steam", extrusion: 15, molding: 10, drying: 18 },
    { name: "Renewable", extrusion: 5, molding: 8, drying: 6 },
];

const materialCompositionData = [
    { name: "PP", contribution: 1200, share: 25 },
    { name: "PE", contribution: 950, share: 18 },
    { name: "PET", contribution: 1500, share: 30 },
    { name: "PVC", contribution: 820, share: 20 },
    { name: "Recycled PET", contribution: 450, share: 12 },
];

const emissionShareData = [
    { name: "Aluminum", value: 35, color: "#1A5D1A" },
    { name: "Polypropylene", value: 24, color: "#458C21" },
    { name: "HDPE", value: 18, color: "#52C41A" },
    { name: "Steel", value: 12, color: "#74B72E" },
    { name: "Paper/Cardboard", value: 7, color: "#98FB98" },
    { name: "Rubber/Additives", value: 4, color: "#C1FFC1" },
];

const carbonIntensityData = [
    { name: "Aluminum", virgin: 12.5, recycled: 0.5 },
    { name: "Steel", virgin: 2.5, recycled: 0.4 },
    { name: "Copper", virgin: 4.8, recycled: 0.8 },
    { name: "PET Plastic", virgin: 2.2, recycled: 0.5 },
    { name: "Glass", virgin: 0.8, recycled: 0.2 },
];

const DetailedRawMaterialEmission: React.FC = () => {
    const navigate = useNavigate();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    const renderManufacturingProcess = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={manufacturingProcessData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="energy" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={isModal ? 60 : 30} name="Energy Used (kWh/unit)" />
                <Bar dataKey="emission" fill="#B3E699" radius={[4, 4, 0, 0]} barSize={isModal ? 60 : 30} name="CO₂e (kg/unit)" />
            </BarChart>
        </ResponsiveContainer>
    );

    const renderProcessEnergy = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processEnergyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="extrusion" fill="#1A5D1A" radius={[4, 4, 0, 0]} name="Extrusion" />
                <Bar dataKey="molding" fill="#52C41A" radius={[4, 4, 0, 0]} name="Molding" />
                <Bar dataKey="drying" fill="#B3E699" radius={[4, 4, 0, 0]} name="Drying" />
            </BarChart>
        </ResponsiveContainer>
    );

    const renderMaterialComposition = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={materialCompositionData} margin={{ top: 20, right: 50, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="contribution" fill="#52C41A" radius={[4, 4, 0, 0]} name="Emission Contribution (kg CO₂e)" />
                <Line type="linear" dataKey="share" stroke="#1A5D1A" strokeWidth={3} name="Share of Total (%)" />
            </ComposedChart>
        </ResponsiveContainer>
    );

    const renderMaterialCarbonIntensity = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={carbonIntensityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="virgin" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={isModal ? 60 : 30} name="Virgin Material (kg CO₂e/kg)" />
                <Bar dataKey="recycled" fill="#B3E699" radius={[4, 4, 0, 0]} barSize={isModal ? 60 : 30} name="Recycled Material (kg CO₂e/kg)" />
            </BarChart>
        </ResponsiveContainer>
    );

    const renderEmissionShare = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emissionShareData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} angle={-20} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={isModal ? 80 : 40} name="Emission Contribution (%)">
                    {emissionShareData.map((entry, index) => (
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
                    title="Raw Material Emission Details"
                    subtitle="Comprehensive breakdown of material-specific carbon footprint"
                    onBack={() => navigate("/dashboard")}
                    icon={Box}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Manufacturing Process Emission" showExpand onExpand={() => setExpandedChart("process")}>
                        {renderManufacturingProcess()}
                    </ChartCard>
                    <ChartCard title="Process Energy Emission" showExpand onExpand={() => setExpandedChart("energy")}>
                        {renderProcessEnergy()}
                    </ChartCard>
                    <ChartCard title="Material Composition" showExpand onExpand={() => setExpandedChart("composition")}>
                        {renderMaterialComposition()}
                    </ChartCard>
                    <ChartCard title="Material Carbon Intensity" showExpand onExpand={() => setExpandedChart("intensity")}>
                        {renderMaterialCarbonIntensity()}
                    </ChartCard>

                    <div className="lg:col-span-2">
                        <ChartCard title="% Share of Total Emission" showExpand onExpand={() => setExpandedChart("share")}>
                            {renderEmissionShare()}
                        </ChartCard>
                    </div>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal isOpen={expandedChart === "process"} onClose={() => setExpandedChart(null)} title="Manufacturing Process Emission">
                {renderManufacturingProcess(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "energy"} onClose={() => setExpandedChart(null)} title="Process Energy Emission">
                {renderProcessEnergy(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "composition"} onClose={() => setExpandedChart(null)} title="Material Composition">
                {renderMaterialComposition(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "intensity"} onClose={() => setExpandedChart(null)} title="Material Carbon Intensity">
                {renderMaterialCarbonIntensity(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "share"} onClose={() => setExpandedChart(null)} title="% Share of Total Emission">
                {renderEmissionShare(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedRawMaterialEmission;
