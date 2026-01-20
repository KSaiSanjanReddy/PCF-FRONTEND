import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Leaf,
  Factory,
  Truck,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Stats cards data
  const stats = [
    {
      title: "Total Products",
      value: "156",
      change: "+12%",
      trend: "up",
      icon: Package,
      color: "green",
      path: "/product-portfolio/all-products",
    },
    {
      title: "PCF Requests",
      value: "24",
      change: "+8%",
      trend: "up",
      icon: FileText,
      color: "blue",
      path: "/pcf-request",
    },
    {
      title: "Active Tasks",
      value: "18",
      change: "-3%",
      trend: "down",
      icon: Clock,
      color: "amber",
      path: "/task-management",
    },
    {
      title: "Suppliers",
      value: "42",
      change: "+5%",
      trend: "up",
      icon: Users,
      color: "purple",
      path: "/supplier-questionnaire-list",
    },
  ];

  // Carbon footprint breakdown
  const carbonBreakdown = [
    { label: "Scope 1 - Direct", value: 35, icon: Factory, color: "bg-red-500" },
    { label: "Scope 2 - Energy", value: 28, icon: Zap, color: "bg-amber-500" },
    { label: "Scope 3 - Supply Chain", value: 37, icon: Truck, color: "bg-blue-500" },
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      type: "pcf",
      title: "PCF Request #1234 submitted",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: 2,
      type: "task",
      title: "Task 'Update emissions data' completed",
      time: "4 hours ago",
      status: "success",
    },
    {
      id: 3,
      type: "questionnaire",
      title: "Supplier questionnaire pending review",
      time: "6 hours ago",
      status: "warning",
    },
    {
      id: 4,
      type: "product",
      title: "New product 'EcoWidget Pro' added",
      time: "1 day ago",
      status: "info",
    },
  ];

  // Quick actions
  const quickActions = [
    { label: "New PCF Request", path: "/pcf-request/new", icon: FileText },
    { label: "Add Product", path: "/product-portfolio/new", icon: Package },
    { label: "Create Task", path: "/task-management/new", icon: Clock },
    { label: "View Reports", path: "/reports", icon: TrendingUp },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
      green: { bg: "bg-green-600", text: "text-green-600", light: "bg-green-50" },
      blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50" },
      amber: { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50" },
      purple: { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-50" },
    };
    return colors[color] || colors.green;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-gray-500">
              Here's what's happening with your environmental data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700">
            <Leaf className="w-4 h-4 mr-1.5" />
            Carbon Neutral Goal: 78%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <div
              key={index}
              onClick={() => navigate(stat.path)}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-200 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 ${colors.light} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-500"}`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.title}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carbon Footprint Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Carbon Footprint Breakdown
            </h2>
            <span className="text-sm text-gray-500">Last 30 days</span>
          </div>

          {/* Carbon Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {carbonBreakdown.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{item.value}%</div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total Emissions */}
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">
                  Total Carbon Emissions
                </p>
                <p className="text-3xl font-bold text-green-800">
                  12,456 <span className="text-lg font-normal">tCO2e</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600 font-medium">vs last year</p>
                <p className="text-lg font-semibold text-green-700">-15.3%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {getStatusIcon(activity.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 rounded-xl border border-gray-200 hover:border-green-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <action.icon className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                  {action.label}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
