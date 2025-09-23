import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Package,
  Grid,
  FolderOpen,
  PlayCircle,
  Archive,
  Puzzle,
  CheckSquare,
  BarChart3,
  Settings,
  User,
  Users,
  Shield,
  IdCard,
  Lock,
  Database,
  CreditCard,
  Server,
  Bell,
  MessageCircle,
  Smartphone,
  AlertTriangle,
  Video,
  Wifi,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { menuItems } from "../config/menu";
import { cn } from "../lib/utils";
import type { MenuItem } from "../types";

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  FileText,
  Package,
  Grid,
  FolderOpen,
  PlayCircle,
  Archive,
  Puzzle,
  CheckSquare,
  BarChart3,
  Settings,
  User,
  Users,
  Shield,
  IdCard,
  Lock,
  Database,
  CreditCard,
  Server,
  Bell,
  MessageCircle,
  Smartphone,
  AlertTriangle,
  Video,
  Wifi,
};

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onMinimizedChange: (minimized: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onMinimizedChange,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleExpanded = (itemId: string) => {
    if (isMinimized) return; // Don't expand when minimized
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleMinimized = () => {
    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    onMinimizedChange(newMinimized);
    // Clear expanded items when minimizing
    if (newMinimized) {
      setExpandedItems(new Set());
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
    navigate("/login");
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive =
      location.pathname === item.path ||
      (hasChildren &&
        item.children?.some((child) => location.pathname === child.path));

    const IconComponent = iconMap[item.icon] || FileText;

    if (isMinimized) {
      // Minimized view - only show icons
      return (
        <div key={item.id} className="relative">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.id)}
              className={cn(
                "flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg transition-all duration-200 group relative",
                "hover:bg-purple-600 hover:text-white hover:shadow-md",
                isActive
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-white hover:text-white"
              )}
              title={item.title}
            >
              <IconComponent className="h-5 w-5" />
              {/* Tooltip for minimized state */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                {item.title}
              </div>
            </button>
          ) : (
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg transition-all duration-200 group relative",
                  "hover:bg-purple-600 hover:text-white hover:shadow-md",
                  isActive
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-white hover:text-white"
                )
              }
              title={item.title}
            >
              <IconComponent className="h-5 w-5" />
              {/* Tooltip for minimized state */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                {item.title}
              </div>
            </NavLink>
          )}
        </div>
      );
    }

    // Full view - show icons and text
    return (
      <div key={item.id}>
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.id)}
              className={cn(
                "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                "hover:bg-purple-600 hover:text-white hover:shadow-md",
                isActive
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-white hover:text-white",
                level === 0 ? "text-base font-semibold" : "text-sm font-medium",
                "group"
              )}
            >
              <IconComponent
                className={cn(
                  "h-5 w-5 mr-3 transition-colors duration-200",
                  isActive
                    ? "text-white"
                    : "text-gray-300 group-hover:text-white"
                )}
              />
              <span className="flex-1 text-left">{item.title}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-white transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-white transition-transform duration-200" />
              )}
            </button>
          ) : (
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  "hover:bg-purple-600 hover:text-white hover:shadow-md",
                  isActive
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-white hover:text-white",
                  level === 0
                    ? "text-base font-semibold"
                    : "text-sm font-medium",
                  "group"
                )
              }
            >
              <IconComponent
                className={cn(
                  "h-5 w-5 mr-3 transition-colors duration-200",
                  "text-gray-300 group-hover:text-white"
                )}
              />
              <span className="flex-1">{item.title}</span>
            </NavLink>
          )}
        </div>

        {hasChildren && isExpanded && !isMinimized && (
          <div className="ml-6 mt-2 space-y-1 pl-4">
            {item.children?.map((child) => (
              <div key={child.id} className="flex items-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full mr-3 flex-shrink-0"></div>
                <NavLink
                  to={child.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center w-full py-2 text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "text-purple-300 font-semibold"
                        : "text-gray-300 hover:text-white"
                    )
                  }
                >
                  <span>{child.title}</span>
                </NavLink>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-[#1A1D29] shadow-xl flex flex-col h-screen transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isMinimized ? "w-20" : "w-72"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center border-b border-gray-700 transition-all duration-300",
            isMinimized
              ? "justify-center px-2 py-4"
              : "justify-between px-6 py-6"
          )}
        >
          {!isMinimized && (
            <div className="flex items-center space-x-3">
              <img
                src="/logo-dark.png"
                alt="EnviGuide Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white">EnviGuide</h1>
                <p className="text-gray-400 text-sm">Management Suite</p>
              </div>
            </div>
          )}

          {isMinimized && (
            <img
              src="/logo-dark.png"
              alt="EnviGuide Logo"
              className="w-10 h-10 object-contain"
            />
          )}

          {/* Close button for mobile */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={cn(
            "flex-1  transition-all duration-300",
            isMinimized
              ? "px-2 py-4 space-y-1"
              : "px-6 py-6 space-y-2 overflow-auto"
          )}
        >
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "border-t border-gray-700 transition-all duration-300 flex items-center",
            isMinimized ? "p-2 justify-center" : "p-6 justify-between"
          )}
        >
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center w-[80%] text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 hover:shadow-md group",
              isMinimized ? "justify-center p-2 hidden" : "px-4 py-3"
            )}
            title={isMinimized ? "Logout" : undefined}
          >
            {!isMinimized && <span className="flex-1 text-left">Logout</span>}
            <LogOut
              className={cn(
                "text-white group-hover:scale-110 transition-transform duration-200",
                isMinimized ? "h-5 w-5" : "h-5 w-5"
              )}
            />
          </button>

          <div
            className={cn(
              "transition-all duration-300",
              isMinimized ? "flex justify-center" : "flex justify-end"
            )}
          >
            <button
              onClick={toggleMinimized}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
              title={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isMinimized ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
