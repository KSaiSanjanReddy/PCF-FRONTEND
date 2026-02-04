import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { ModulePermission } from "../types/userManagement";
import authorizationService from "../lib/authorizationService";
import { useAuth } from "./AuthContext";

interface PermissionContextType {
  permissions: ModulePermission[];
  loading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
  hasPermission: (moduleName: string, action: "create" | "read" | "update" | "delete") => boolean;
  canCreate: (moduleName: string) => boolean;
  canRead: (moduleName: string) => boolean;
  canUpdate: (moduleName: string) => boolean;
  canDelete: (moduleName: string) => boolean;
  hasModuleAccess: (moduleName: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Module name mappings for flexibility
const MODULE_ALIASES: Record<string, string[]> = {
  "pcf request": ["pcf request", "pcf", "pcf-request"],
  "product portfolio": ["product portfolio", "products", "product-portfolio", "all products"],
  "components master": ["components master", "components", "components-master"],
  "document master": ["document master", "documents", "document-master"],
  "task management": ["task management", "tasks", "task-management"],
  "reports": ["reports", "report"],
  "data quality rating": ["data quality rating", "dqr", "data-quality-rating"],
  "supplier questionnaire": ["supplier questionnaire", "supplier", "supplier-questionnaire"],
  "settings": ["settings", "setting"],
  "dashboard": ["dashboard"],
  "users": ["users", "manage users"],
  "authorizations": ["authorizations", "authorization", "permissions"],
};

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    if (!isAuthenticated || !user?.userId) {
      setPermissions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await authorizationService.getPermissionsByUserId(user.userId);

      if (result.success) {
        setPermissions(result.data);
      } else {
        // If no permissions found, allow all access (for backwards compatibility)
        // You can change this to deny all if you want strict permissions
        console.warn("No permissions found for user, allowing full access");
        setPermissions([]);
      }
    } catch (err) {
      console.error("Error loading permissions:", err);
      setError("Failed to load permissions");
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.userId]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const refreshPermissions = useCallback(async () => {
    await loadPermissions();
  }, [loadPermissions]);

  // Normalize module name for comparison
  const normalizeModuleName = (name: string): string => {
    const normalized = name.toLowerCase().trim();

    // Check if name matches any alias
    for (const [canonical, aliases] of Object.entries(MODULE_ALIASES)) {
      if (aliases.includes(normalized)) {
        return canonical;
      }
    }

    return normalized;
  };

  // Find permission for a module (handles aliases)
  const findPermission = (moduleName: string): ModulePermission | undefined => {
    const normalized = normalizeModuleName(moduleName);

    return permissions.find((p) => {
      const permModuleNormalized = normalizeModuleName(p.module_name);
      return permModuleNormalized === normalized;
    });
  };

  const hasPermission = useCallback(
    (moduleName: string, action: "create" | "read" | "update" | "delete"): boolean => {
      // If no permissions are configured, allow access (backwards compatibility)
      if (permissions.length === 0) {
        return true;
      }

      const permission = findPermission(moduleName);

      if (!permission) {
        // If module not found in permissions, deny access
        // Change to `return true` if you want to allow access for unconfigured modules
        return true; // Allow access if module not configured
      }

      return permission[action] === true;
    },
    [permissions]
  );

  const canCreate = useCallback(
    (moduleName: string): boolean => hasPermission(moduleName, "create"),
    [hasPermission]
  );

  const canRead = useCallback(
    (moduleName: string): boolean => hasPermission(moduleName, "read"),
    [hasPermission]
  );

  const canUpdate = useCallback(
    (moduleName: string): boolean => hasPermission(moduleName, "update"),
    [hasPermission]
  );

  const canDelete = useCallback(
    (moduleName: string): boolean => hasPermission(moduleName, "delete"),
    [hasPermission]
  );

  const hasModuleAccess = useCallback(
    (moduleName: string): boolean => {
      // User has module access if they can at least read
      return canRead(moduleName);
    },
    [canRead]
  );

  const value: PermissionContextType = {
    permissions,
    loading,
    error,
    refreshPermissions,
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    hasModuleAccess,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};

// Higher-order component for route protection
export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  moduleName: string,
  action: "create" | "read" | "update" | "delete" = "read"
) => {
  return function WithPermissionComponent(props: P) {
    const { hasPermission, loading } = usePermissions();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      );
    }

    if (!hasPermission(moduleName, action)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-center max-w-md">
            You don't have permission to access this page. Please contact your administrator if you
            believe this is an error.
          </p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Component for conditional rendering based on permissions
export const PermissionGate: React.FC<{
  module: string;
  action?: "create" | "read" | "update" | "delete";
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ module, action = "read", children, fallback = null }) => {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!hasPermission(module, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionContext;
