import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Users,
  UserPlus,
  Package,
  Puzzle,
  Building2,
  ChevronRight,
} from "lucide-react";

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const settingsGroups = [
    {
      title: "User Settings",
      description: "Manage users and permissions",
      icon: Users,
      items: [
        {
          name: "Manage Users",
          description: "View and manage existing users",
          path: "/settings/users",
          icon: Users,
        },
        {
          name: "Create New User",
          description: "Add a new user to the system",
          path: "/settings/users/create",
          icon: UserPlus,
        },
      ],
    },
    {
      title: "Setup Data",
      description: "Configure system data and categories",
      icon: Package,
      items: [
        {
          name: "Products",
          description: "Manage product categories and types",
          path: "/settings/products",
          icon: Package,
        },
        {
          name: "Components",
          description: "Configure component types and specifications",
          path: "/settings/components",
          icon: Puzzle,
        },
        {
          name: "Industry",
          description: "Set up industry categories and classifications",
          path: "/settings/industry",
          icon: Building2,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <SettingsIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">
              Configure system settings and manage your application
            </p>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-12">
          {settingsGroups.map((group) => {
            const GroupIcon = group.icon;

            return (
              <div key={group.title} className="space-y-6">
                {/* Group Header */}
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <GroupIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {group.title}
                    </h2>
                    <p className="text-gray-600 text-sm">{group.description}</p>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;

                    return (
                      <div
                        key={item.name}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
                        onClick={() => navigate(item.path)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <ItemIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Chevron Icon */}
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Settings;
