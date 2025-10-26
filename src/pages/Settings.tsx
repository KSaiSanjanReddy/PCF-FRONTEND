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
} from "lucide-react";

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
          name: "Create New User",
          description: "Add a new user to the system with custom permissions",
          path: "/settings/users/create",
          icon: UserPlus,
          badge: "NEW",
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
      ],
    },
  ];

  const quickActions = [
    {
      label: "Supplier Questionnaire",
      icon: FileText,
      action: () => navigate("/supplier-questionnaire"),
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
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] p-5">
      <div className="mx-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm relative overflow-hidden border-t-4 border-[#6366f1]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg shadow-[#6366f1]/30">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1a202c] mb-1">
                Settings
              </h1>
              <p className="text-[#718096] text-[15px]">
                Configure your system and manage your application
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0aec0] text-lg" />
          <input
            type="text"
            className="w-full pl-12 pr-5 py-3.5 border-2 border-[#e2e8f0] rounded-xl bg-white text-[15px] focus:outline-none focus:border-[#6366f1] focus:ring-3 focus:ring-[#6366f1]/15 transition-all"
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
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center flex-shrink-0">
                    <GroupIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-[#2d3748]">
                      {group.title}
                    </h2>
                    <p className="text-sm text-[#718096] leading-relaxed">
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
                        className="bg-white rounded-xl p-6 cursor-pointer transition-all duration-300 border-2 border-transparent relative overflow-hidden group hover:translate-y-[-4px] hover:shadow-xl hover:shadow-[#6366f1]/10 hover:border-[#6366f1]/30"
                        onClick={() => navigate(item.path)}
                      >
                        {/* Top border gradient on hover */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              item.cardType === "primary"
                                ? "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] shadow-lg shadow-[#6366f1]/30"
                                : item.cardType === "secondary"
                                ? "bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] shadow-lg shadow-[#8b5cf6]/25"
                                : "bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] border border-[#cbd5e0] group-hover:border-[#6366f1] group-hover:bg-gradient-to-br group-hover:from-[#6366f1]/10 group-hover:to-[#8b5cf6]/10"
                            }`}
                          >
                            <ItemIcon
                              className={`w-5 h-5 transition-colors duration-300 ${
                                item.cardType === "default"
                                  ? "text-[#475569] group-hover:text-[#6366f1]"
                                  : "text-white"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[#1a202c]  flex items-center gap-2">
                              {item.name}
                              {item.badge && (
                                <span className="text-[10px] px-2 py-0.5 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white rounded-md font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-[#718096] leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Arrow Icon */}
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[#cbd5e0] text-xl transition-all duration-300 group-hover:text-[#6366f1] group-hover:translate-x-1">
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
        <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#2d3748] mb-4">
            Quick Actions
          </h3>
          <div className="flex gap-3 flex-wrap">
            {quickActions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={index}
                  className="px-5 py-2.5 border-2 border-[#e2e8f0] bg-white rounded-lg text-sm font-medium text-[#4a5568] cursor-pointer transition-all duration-200 hover:border-[#6366f1] hover:text-[#6366f1] hover:bg-[#6366f1]/5 active:scale-[0.98] flex items-center gap-2"
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
