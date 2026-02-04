import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Settings as SettingsIcon,
  Users,
  UserPlus,
  Package,
  Puzzle,
  Building2,
  ChevronRight,
  Search,
  ScrollText,
  Shield,
  Bell,
  HardDrive,
  RefreshCw,
  FileText,
  Award,
  Zap,
  Fuel,
  Factory,
  Droplets,
  Truck,
  Gauge,
  Layers,
  Tag,
  Globe,
  Calculator,
  Wrench,
  Box,
  Activity,
  Wind,
  Flame,
  Battery,
  Recycle,
  Droplet,
  GaugeCircle,
  Route,
  Car,
  Clock,
  CheckCircle,
  FileCheck,
} from "lucide-react";
import { dataSetupGroups, singleEntityPages } from "../config/dataSetupGroups";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const settingsGroups = [
    {
      title: "User Management",
      description: "Manage users, permissions, and access controls",
      icon: Users,
      items: [
        {
          name: "Manage Users",
          description:
            "View, edit, and manage existing user accounts and their permissions",
          path: "/settings/users",
          icon: Users,
          badge: null,
          cardType: "default",
        },
        {
          name: "Authorizations",
          description:
            "Configure module-level access permissions for roles and users",
          path: "/settings/authorizations",
          icon: Shield,
          badge: "NEW",
          cardType: "default",
        },
        {
          name: "Create New User",
          description: "Add a new user to the system with custom permissions",
          path: "/settings/users/create",
          icon: UserPlus,
          badge: null,
          cardType: "default",
        },
      ],
    },
    {
      title: "Data Configuration",
      description: "Configure system data, categories, and classifications",
      icon: Package,
      items: [
        {
          name: "Products",
          description:
            "Manage product categories, types, and organizational structure",
          path: "/settings/products",
          icon: Package,
          badge: null,
          cardType: "default",
        },
        {
          name: "Components",
          description:
            "Configure component types, specifications, and attributes",
          path: "/settings/components",
          icon: Puzzle,
          badge: null,
          cardType: "default",
        },
        {
          name: "Industry",
          description: "Set up industry categories and classification systems",
          path: "/settings/industry",
          icon: Building2,
          badge: null,
          cardType: "default",
        },
        // Grouped configurations
        ...dataSetupGroups.map((group) => ({
          name: group.title,
          description: group.description,
          path: `/settings/data-setup/${group.key}/${group.tabs[0]?.key || ""}`,
          icon:
            group.key === "emissions" ? Factory :
            group.key === "electricity" ? Zap :
            group.key === "energy" ? Battery :
            group.key === "materials" ? Layers :
            group.key === "transport" ? Truck :
            group.key === "water-waste" ? Droplets :
            group.key === "units" ? GaugeCircle :
            group.key === "standards" ? FileCheck :
            group.key === "lifecycle" ? Activity :
            group.key === "manufacturing" ? Factory : Package,
          badge: null,
          cardType: "default" as const,
        })),
        // Single entity pages
        ...singleEntityPages.map((page) => ({
          name: page.title,
          description: page.description,
          path: page.path,
          icon: page.key === "manufacturer" ? Factory :
                page.key === "category" ? Tag :
                page.key === "tag" ? Tag :
                page.key === "supplier-tier" ? Building2 :
                page.key === "refrigerent-type" ? Wind :
                page.key === "country-iso-two" || page.key === "country-iso-three" ? Globe :
                page.key === "time-zone" ? Clock : Tag,
          badge: null,
          cardType: "default" as const,
        })),
      ],
    },
  ];

  const quickActions = [
    {
      label: "Supplier Questionnaire",
      icon: FileText,
      action: () => navigate("/supplier-questionnaire"),
    },
    {
      label: "Data Quality Rating",
      icon: Award,
      action: () => navigate("/data-quality-rating"),
    },
    { label: "View Logs", icon: ScrollText, action: () => {} },
    { label: "Security Settings", icon: Shield, action: () => {} },
    { label: "Notifications", icon: Bell, action: () => {} },
    { label: "Backup Data", icon: HardDrive, action: () => {} },
    { label: "System Updates", icon: RefreshCw, action: () => {} },
  ];

  const filteredGroups = settingsGroups.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-5">
      <div className="mx-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm relative overflow-hidden border-t-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">
                Settings
              </h1>
              <p className="text-slate-600 text-[15px]">
                Configure your system and manage your application
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            className="w-full pl-12 pr-5 py-3.5 border-2 border-gray-200 rounded-xl bg-white text-[15px] focus:outline-none focus:border-green-500 focus:ring-3 focus:ring-green-500/15 transition-all"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {filteredGroups.map((group) => {
            const GroupIcon = group.icon;

            return (
              <div key={group.title} className="space-y-5">
                {/* Section Header */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GroupIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-700">
                      {group.title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {group.description}
                    </p>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;

                    return (
                      <div
                        key={item.name}
                        className="bg-white rounded-xl p-6 cursor-pointer transition-all duration-300 border-2 border-transparent relative overflow-hidden group hover:translate-y-[-4px] hover:shadow-xl hover:shadow-green-500/10 hover:border-green-500/30"
                        onClick={() => navigate(item.path)}
                      >
                        {/* Top border gradient on hover */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-500 to-green-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              item.cardType === "primary"
                                ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30"
                                : item.cardType === "secondary"
                                ? "bg-gradient-to-br from-green-600 to-green-700 shadow-lg shadow-green-600/25"
                                : "bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 group-hover:border-green-500 group-hover:bg-gradient-to-br group-hover:from-green-500/10 group-hover:to-green-600/10"
                            }`}
                          >
                            <ItemIcon
                              className={`w-5 h-5 transition-colors duration-300 ${
                                item.cardType === "default"
                                  ? "text-slate-700 group-hover:text-green-500"
                                  : "text-white"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-slate-900  flex items-center gap-2">
                              {item.name}
                              {item.badge && (
                                <span className="text-[10px] px-2 py-0.5 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-md font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Arrow Icon */}
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 text-xl transition-all duration-300 group-hover:text-green-500 group-hover:translate-x-1">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-base font-semibold text-slate-700 mb-4">
            Quick Actions
          </h3>
          <div className="flex gap-3 flex-wrap">
            {quickActions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={index}
                  className="px-5 py-2.5 border-2 border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 cursor-pointer transition-all duration-200 hover:border-green-500 hover:text-green-500 hover:bg-green-500/5 active:scale-[0.98] flex items-center gap-2"
                  onClick={action.action}
                >
                  <ActionIcon className="w-4 h-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
