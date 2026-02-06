import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  Truck,
  Factory,
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
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  StatCard,
  ChartCard,
  DashboardHeader,
  ChartModal
} from "../components/DashboardComponents";
import { useDashboardPermissions } from "../contexts/PermissionContext";
import Welcome from "./Welcome";

const productLifeCycleData = [
  { name: "Material", value: 850 },
  { name: "Manuf.", value: 1243 },
  { name: "Dist.", value: 487 },
  { name: "Use", value: 156 },
  { name: "EoL", value: 85 },
];

const supplierEmissionData = [
  { name: "S1", value: 450 },
  { name: "S2", value: 320 },
  { name: "S3", value: 210 },
  { name: "S4", value: 165 },
  { name: "S5", value: 98 },
];

const rawMaterialData = [
  { name: "Steel", value: 400 },
  { name: "Plastic", value: 250 },
  { name: "Alu", value: 120 },
  { name: "Glass", value: 55 },
  { name: "Other", value: 31 },
];

const packagingData = [
  { name: "Cardboard", value: 120 },
  { name: "Film", value: 60 },
  { name: "Pallet", value: 40 },
  { name: "Tape", value: 14 },
];

const transportationData = [
  { name: "Road", value: 270 },
  { name: "Sea", value: 80 },
  { name: "Air", value: 48 },
  { name: "Rail", value: 25 },
];

const energyData = [
  { name: "Grid", value: 450 },
  { name: "Solar", value: 20 },
  { name: "Wind", value: 30 },
  { name: "Gas", value: 180 },
];

const recyclabilityData = [
  { name: "Recyclable", value: 67.5, color: "#52C41A" },
  { name: "Non-Recyclable", value: 22.5, color: "#d1d1d1ff" },
  { name: "Recoverable", value: 10, color: "#9CA3AF" },
];

const wasteData = [
  { name: "Hazardous", value: 45 },
  { name: "General", value: 82 },
  { name: "Organic", value: 30 },
  { name: "Metal", value: 30 },
];

const impactCategoriesData = [
  { name: "GWP", value: 100 },
  { name: "ODP", value: 20 },
  { name: "AP", value: 45 },
  { name: "EP", value: 60 },
  { name: "POCP", value: 35 },
];

const pcfTrendData = [
  { month: "Jan", value: 2950 },
  { month: "Feb", value: 2900 },
  { month: "Mar", value: 2880 },
  { month: "Apr", value: 2860 },
  { month: "May", value: 2847 },
  { month: "Jun", value: 2840 },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const { canViewDashboard, loading: permissionsLoading } = useDashboardPermissions();

  // Show loading state while permissions are being checked
  if (permissionsLoading) {
    return (
      <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Welcome page if user doesn't have dashboard access
  if (!canViewDashboard) {
    return <Welcome />;
  }

  const renderProductLifeCycle = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={productLifeCycleData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Emission (kg CO₂e)" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderSupplierEmission = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={supplierEmissionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Emission (kg CO₂e)" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderRawMaterialEmission = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rawMaterialData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Emission (kg CO₂e)" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPackagingEmission = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={packagingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Emission (kg CO₂e)" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderTransportationEmission = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={transportationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Emission (kg CO₂e)" />
      </BarChart>
    </ResponsiveContainer>
  );
  return (
    <div className="flex-1 overflow-auto bg-[#F8F9FA] p-8 pt-6">
      <div className="mx-auto space-y-6">
        <DashboardHeader />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total CO₂e Emissions"
            value="2,847 kg"
            subValue="vs. previous period"
            trend={-12.3}
            icon={Leaf}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            title="Manufacturing Emissions"
            value="1,243 kg"
            subValue="43.7% of total"
            trend={5.2}
            icon={Factory}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Recyclability Rate"
            value="72.5%"
            subValue="Target: 85%"
            trend={8.1}
            icon={RefreshCw}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Transport Emissions"
            value="487 kg"
            subValue="17.1% of total"
            trend={-18.4}
            icon={Truck}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Product Life Cycle Emission"
            subtitle="Total: 2,847 kg CO₂e"
            onViewDetails={() => navigate("/dashboard/detailed-lifecycle")}
          >
            {renderProductLifeCycle()}
          </ChartCard>

          <ChartCard
            title="Supplier Emission"
            subtitle="Total: 1,243 kg CO₂e"
            onViewDetails={() => navigate("/dashboard/detailed-supplier")}
          >
            {renderSupplierEmission()}
          </ChartCard>

          <ChartCard
            title="Raw Material Emission"
            subtitle="Total: 856 kg CO₂e"
            onViewDetails={() => navigate("/dashboard/detailed-raw-material")}
          >
            {renderRawMaterialEmission()}
          </ChartCard>

          <ChartCard
            title="Packaging Emission"
            subtitle="Total: 234 kg CO₂e"
            onViewDetails={() => navigate("/dashboard/detailed-packaging")}
          >
            {renderPackagingEmission()}
          </ChartCard>

          <ChartCard
            title="Transportation Emission"
            subtitle="Total: 423 kg CO₂e"
            onViewDetails={() => navigate("/dashboard/detailed-transportation")}
          >
            {renderTransportationEmission()}
          </ChartCard>

          <ChartCard title="Energy Emission" subtitle="Total: 678 kg CO₂e" onViewDetails={() => navigate("/dashboard/detailed-energy")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Energy Emission (kg CO₂e)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Recyclability" subtitle="Average: 67.5%" onViewDetails={() => navigate("/dashboard/detailed-recyclability")}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={recyclabilityData}
                  cx="40%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ value }) => `${value}%`}
                  labelLine={false}
                >
                  {recyclabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="square"
                  iconSize={10}
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Waste Emission" subtitle="Total: 187 kg CO₂e" onViewDetails={() => navigate("/dashboard/detailed-waste")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Waste Emission (kg CO₂e)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Impact Categories" subtitle="Environmental Impact Analysis" onViewDetails={() => navigate("/dashboard/detailed-impact")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactCategoriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar dataKey="value" fill="#52C41A" radius={[4, 4, 0, 0]} barSize={40} name="Impact (kg CO₂e)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="PCF Dashboard Graph" subtitle="Overall Emission Trend Summary" onViewDetails={() => navigate("/dashboard/detailed-pcf-trend")}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pcfTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={['dataMin - 50', 'dataMax + 50']} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Line type="linear" dataKey="value" stroke="#52C41A" strokeWidth={3} dot={{ fill: '#52C41A', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Total Emission (kg CO₂e)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <ChartModal isOpen={expandedChart === "lifecycle"} onClose={() => setExpandedChart(null)} title="Product Life Cycle Emission">
        <div className="h-full">{renderProductLifeCycle()}</div>
      </ChartModal>
      <ChartModal isOpen={expandedChart === "supplier"} onClose={() => setExpandedChart(null)} title="Supplier Emission">
        <div className="h-full">{renderSupplierEmission()}</div>
      </ChartModal>
      <ChartModal isOpen={expandedChart === "raw-material"} onClose={() => setExpandedChart(null)} title="Raw Material Emission">
        <div className="h-full">{renderRawMaterialEmission()}</div>
      </ChartModal>
      <ChartModal isOpen={expandedChart === "packaging"} onClose={() => setExpandedChart(null)} title="Packaging Emission">
        <div className="h-full">{renderPackagingEmission()}</div>
      </ChartModal>
      <ChartModal isOpen={expandedChart === "transportation"} onClose={() => setExpandedChart(null)} title="Transportation Emission">
        <div className="h-full">{renderTransportationEmission()}</div>
      </ChartModal>
    </div>
  );
};

export default Dashboard;

