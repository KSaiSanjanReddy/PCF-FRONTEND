import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { menuItems } from '../config/menu';
import { cn } from '../lib/utils';
import type { MenuItem } from '../types';

const Sidebar: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const location = useLocation();

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = location.pathname === item.path || 
                    (hasChildren && item.children?.some(child => location.pathname === child.path));

    return (
      <div key={item.id}>
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.id)}
              className={cn(
                "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                "hover:bg-gray-100 hover:text-gray-900",
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-600",
                level === 0 ? "text-base font-semibold" : ""
              )}
            >
              <span className="flex-1 text-left">{item.title}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  "hover:bg-gray-100 hover:text-gray-900",
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-600",
                  level === 0 ? "text-base font-semibold" : ""
                )
              }
            >
              <span className="flex-1">{item.title}</span>
            </NavLink>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Enviguide</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2024 ViPLave Edit Works
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
