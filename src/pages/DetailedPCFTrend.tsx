import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Users,
    ChevronDown,
    LineChart as LineChartIcon
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

const pcfReductionData = [
    { name: "Q4 21", emission: 1200, reduction: 0 },
    { name: "Q1 22", emission: 1150, reduction: 4.1 },
    { name: "Q2 22", emission: 1100, reduction: 8.3 },
    { name: "Q3 22", emission: 1050, reduction: 12.5 },
    { name: "Q4 22", emission: 980, reduction: 18.3 },
    { name: "Q1 23", emission: 920, reduction: 23.3 },
    { name: "Q2 23", emission: 880, reduction: 26.6 },
    { name: "Q3 23", emission: 850, reduction: 29.1 },
    { name: "Q4 23", emission: 780, reduction: 35.0 },
    { name: "Q1 24", emission: 750, reduction: 37.5 },
    { name: "Q2 24", emission: 720, reduction: 40.0 },
    { name: "Q3 24", emission: 680, reduction: 43.3 },
    { name: "Q4 24", emission: 650, reduction: 45.8 },
    { name: "Q1 25", emission: 600, reduction: 50.0 },
    { name: "Q2 25", emission: 580, reduction: 51.6 },
];

const targetVsActualData = [
    { name: "2021", target: 1250, actual: 1200 },
    { name: "2022", target: 1100, actual: 1080 },
    { name: "2023", target: 950, actual: 920 },
    { name: "2024", target: 800, actual: 750 },
    { name: "2025", target: 650, actual: 600 },
];

const forecastData = [
    { name: "2024", emission: 900 },
    { name: "2026", emission: 750 },
    { name: "2028", emission: 580 },
    { name: "2030", emission: 450 },
];

const stageComparisonData = [
    { name: "Supplier", current: 250, forecast: 200 },
    { name: "Raw Material", current: 400, forecast: 320 },
    { name: "Manufacturing", current: 300, forecast: 240 },
    { name: "Transportation", current: 150, forecast: 120 },
    { name: "Packaging", current: 80, forecast: 65 },
    { name: "Use Phase", current: 200, forecast: 180 },
    { name: "End of Life", current: 100, forecast: 80 },
];

const DetailedPCFTrend: React.FC = () => {
    const navigate = useNavigate();
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    const renderReductionGraph = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={pcfReductionData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} angle={-45} textAnchor="end" interval={0} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={[0, 10]} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="emission" fill="#52C41A" radius={[4, 4, 0, 0]} name="Total Emission (kg CO₂e)" />
                <Line yAxisId="right" type="linear" dataKey="reduction" stroke="#1A5D1A" strokeWidth={3} dot={{ fill: '#1A5D1A', r: 4 }} name="% Reduction" />
            </ComposedChart>
        </ResponsiveContainer>
    );

    const renderTargetVsActual = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={targetVsActualData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="target" fill="#D9F5C5" radius={[4, 4, 0, 0]} name="Target Emission" />
                <Bar dataKey="actual" fill="#52C41A" radius={[4, 4, 0, 0]} name="Actual Emission" />
            </BarChart>
        </ResponsiveContainer>
    );

    const renderForecast = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip />
                <Bar dataKey="emission" fill="#52C41A" radius={[4, 4, 0, 0]} name="Forecasted Emission" />
            </BarChart>
        </ResponsiveContainer>
    );

    const renderComparison = (isModal = false) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} angle={-30} textAnchor="end" interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="current" fill="#52C41A" radius={[4, 4, 0, 0]} name="Current Emission" />
                <Bar dataKey="forecast" fill="#D9F5C5" radius={[4, 4, 0, 0]} name="Forecasted Emission" />
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
            <div className="mx-auto">
                <DetailedHeader
                    title="PCF Visualisation Trends"
                    subtitle="Detailed emission insights across life cycle stages"
                    onBack={() => navigate("/dashboard")}
                    icon={LineChartIcon}
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
                    <ChartCard title="PCF Reduction Graph" showExpand onExpand={() => setExpandedChart("reduction")}>
                        {renderReductionGraph()}
                    </ChartCard>
                    <ChartCard title="Target vs Actual Emission Graph" showExpand onExpand={() => setExpandedChart("target")}>
                        {renderTargetVsActual()}
                    </ChartCard>
                    <ChartCard title="Forecasted Emission" showExpand onExpand={() => setExpandedChart("forecast")}>
                        {renderForecast()}
                    </ChartCard>
                    <ChartCard title="Emission Comparison" showExpand onExpand={() => setExpandedChart("comparison")}>
                        {renderComparison()}
                    </ChartCard>
                </div>
            </div>

            {/* Expansion Modals */}
            <ChartModal isOpen={expandedChart === "reduction"} onClose={() => setExpandedChart(null)} title="PCF Reduction Graph">
                {renderReductionGraph(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "target"} onClose={() => setExpandedChart(null)} title="Target vs Actual Emission Graph">
                {renderTargetVsActual(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "forecast"} onClose={() => setExpandedChart(null)} title="Forecasted Emission">
                {renderForecast(true)}
            </ChartModal>
            <ChartModal isOpen={expandedChart === "comparison"} onClose={() => setExpandedChart(null)} title="Emission Comparison">
                {renderComparison(true)}
            </ChartModal>
        </div>
    );
};

export default DetailedPCFTrend;
