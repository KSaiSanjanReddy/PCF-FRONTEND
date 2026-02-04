import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Users,
  Search,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  User,
  Building2,
  Plus,
  Edit,
  Trash2,
  X,
  UserCog,
} from "lucide-react";
import { Tabs, Select, message, Checkbox, Modal, Input, Form } from "antd";
import type { BackendUser } from "../../types";
import type { ModulePermission } from "../../types/userManagement";
import LoadingSpinner from "../../components/LoadingSpinner";
import authorizationService, { DEFAULT_MODULES } from "../../lib/authorizationService";

const { Option } = Select;

interface Role {
  role_id: string;
  role_name: string;
  description?: string;
  role_code?: string;
}

interface ModuleWithPermissions {
  module_id: string;
  module_name: string;
  description?: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  subModules?: ModuleWithPermissions[];
  expanded?: boolean;
}

type TabKey = "roles" | "by-role" | "by-user";

const AuthorizationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("roles");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Roles
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");

  // Role Modal
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<"create" | "edit">("create");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm] = Form.useForm();

  // Users
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [usersLoading, setUsersLoading] = useState(false);

  // Modules & Permissions
  const [modules, setModules] = useState<ModuleWithPermissions[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<ModulePermission[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load roles
  const loadRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const result = await authorizationService.getRoles(roleSearch);

      if (result.success) {
        setRoles(result.data);
      } else {
        // Fallback to old API
        const response = await fetch("https://enviguide.nextechltd.in/api/roles/get");
        const data = await response.json();
        if (data.status && data.data) {
          const rolesList = Array.isArray(data.data) ? data.data : data.data.rows || [];
          setRoles(rolesList);
        }
      }
    } catch (error) {
      console.error("Error loading roles:", error);
      message.error("Failed to load roles");
    } finally {
      setRolesLoading(false);
    }
  }, [roleSearch]);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const response = await fetch(
        "https://enviguide.nextechltd.in/api/user/getAll?pageNumber=1&pageSize=100"
      );
      const data = await response.json();

      if (data.status && data.data && data.data.userList) {
        setUsers(data.data.userList);
      } else if (Array.isArray(data.data)) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      message.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Initialize modules
  const initializeModules = useCallback(() => {
    const defaultModulesWithPermissions: ModuleWithPermissions[] = DEFAULT_MODULES.map(
      (mod, idx) => ({
        module_id: `default-${idx}`,
        module_name: mod.name,
        description: mod.description,
        create: false,
        read: false,
        update: false,
        delete: false,
        expanded: false,
        subModules: mod.subModules?.map((sub, subIdx) => ({
          module_id: `default-${idx}-${subIdx}`,
          module_name: sub,
          description: `${sub} under ${mod.name}`,
          create: false,
          read: false,
          update: false,
          delete: false,
        })),
      })
    );
    setModules(defaultModulesWithPermissions);
  }, []);

  // Load permissions for user
  const loadUserPermissions = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const result = await authorizationService.getPermissionsByUserId(userId);

      if (result.success) {
        setOriginalPermissions(result.data);

        // Apply permissions to modules
        setModules((prevModules) =>
          prevModules.map((mod) => {
            const permission = result.data.find(
              (p) => p.module_name.toLowerCase() === mod.module_name.toLowerCase()
            );

            return {
              ...mod,
              create: permission?.create || false,
              read: permission?.read || false,
              update: permission?.update || false,
              delete: permission?.delete || false,
              subModules: mod.subModules?.map((sub) => {
                const subPermission = result.data.find(
                  (p) => p.module_name.toLowerCase() === sub.module_name.toLowerCase()
                );
                return {
                  ...sub,
                  create: subPermission?.create || false,
                  read: subPermission?.read || false,
                  update: subPermission?.update || false,
                  delete: subPermission?.delete || false,
                };
              }),
            };
          })
        );
      }
    } catch (error) {
      console.error("Error loading user permissions:", error);
      message.error("Failed to load user permissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
    loadUsers();
    initializeModules();
  }, [loadRoles, loadUsers, initializeModules]);

  useEffect(() => {
    if (activeTab === "by-user" && selectedUser) {
      loadUserPermissions(selectedUser);
    }
  }, [activeTab, selectedUser, loadUserPermissions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadRoles(), loadUsers()]);
    initializeModules();
    if (selectedUser) {
      await loadUserPermissions(selectedUser);
    }
    setRefreshing(false);
  };

  // Role CRUD handlers
  const openRoleModal = (mode: "create" | "edit", role?: Role) => {
    setRoleModalMode(mode);
    if (mode === "edit" && role) {
      setEditingRole(role);
      roleForm.setFieldsValue({
        role_name: role.role_name,
        description: role.description || "",
        role_code: role.role_code || "",
      });
    } else {
      setEditingRole(null);
      roleForm.resetFields();
    }
    setRoleModalVisible(true);
  };

  const handleRoleSubmit = async () => {
    try {
      const values = await roleForm.validateFields();
      setSaving(true);

      if (roleModalMode === "create") {
        const result = await authorizationService.createRole({
          role_name: values.role_name,
          description: values.description,
          role_code: values.role_code,
        });

        if (result.success) {
          message.success("Role created successfully");
          setRoleModalVisible(false);
          loadRoles();
        } else {
          message.error(result.message);
        }
      } else if (editingRole) {
        const result = await authorizationService.updateRole([
          {
            role_id: editingRole.role_id,
            role_name: values.role_name,
            description: values.description,
            role_code: values.role_code,
          },
        ]);

        if (result.success) {
          message.success("Role updated successfully");
          setRoleModalVisible(false);
          loadRoles();
        } else {
          message.error(result.message);
        }
      }
    } catch (error) {
      console.error("Error submitting role:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    Modal.confirm({
      title: "Delete Role",
      content: "Are you sure you want to delete this role? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const result = await authorizationService.deleteRole(roleId);
        if (result.success) {
          message.success("Role deleted successfully");
          loadRoles();
        } else {
          message.error(result.message);
        }
      },
    });
  };

  const toggleModuleExpand = (moduleId: string) => {
    setModules((prevModules) =>
      prevModules.map((mod) =>
        mod.module_id === moduleId ? { ...mod, expanded: !mod.expanded } : mod
      )
    );
  };

  const handlePermissionChange = (
    moduleId: string,
    permission: "create" | "read" | "update" | "delete",
    value: boolean,
    isSubModule: boolean = false,
    parentId?: string
  ) => {
    setHasChanges(true);

    setModules((prevModules) =>
      prevModules.map((mod) => {
        if (isSubModule && parentId === mod.module_id) {
          return {
            ...mod,
            subModules: mod.subModules?.map((sub) =>
              sub.module_id === moduleId ? { ...sub, [permission]: value } : sub
            ),
          };
        } else if (!isSubModule && mod.module_id === moduleId) {
          return {
            ...mod,
            [permission]: value,
            subModules: mod.subModules?.map((sub) => ({
              ...sub,
              [permission]: value,
            })),
          };
        }
        return mod;
      })
    );
  };

  const handleSelectAll = (permission: "create" | "read" | "update" | "delete", value: boolean) => {
    setHasChanges(true);
    setModules((prevModules) =>
      prevModules.map((mod) => ({
        ...mod,
        [permission]: value,
        subModules: mod.subModules?.map((sub) => ({
          ...sub,
          [permission]: value,
        })),
      }))
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedUser && activeTab === "by-user") {
      message.warning("Please select a user first");
      return;
    }

    try {
      setSaving(true);

      const permissionsToSave: Omit<ModulePermission, "permission_id">[] = [];

      modules.forEach((mod) => {
        permissionsToSave.push({
          user_id: selectedUser,
          module_name: mod.module_name,
          create: mod.create,
          read: mod.read,
          update: mod.update,
          delete: mod.delete,
        });

        mod.subModules?.forEach((sub) => {
          permissionsToSave.push({
            user_id: selectedUser,
            module_name: sub.module_name,
            create: sub.create,
            read: sub.read,
            update: sub.update,
            delete: sub.delete,
          });
        });
      });

      for (const perm of permissionsToSave) {
        const existing = originalPermissions.find(
          (p) => p.module_name.toLowerCase() === perm.module_name.toLowerCase()
        );

        if (existing && existing.permission_id) {
          await authorizationService.updatePermissions([
            {
              ...perm,
              permission_id: existing.permission_id,
            },
          ]);
        } else {
          await authorizationService.addPermission(perm);
        }
      }

      message.success("Permissions saved successfully");
      setHasChanges(false);

      if (selectedUser) {
        await loadUserPermissions(selectedUser);
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      message.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.role_name?.toLowerCase().includes(roleSearch.toLowerCase()) ||
      role.description?.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const renderPermissionMatrix = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                Module
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                <div className="flex flex-col items-center gap-1">
                  <span>Create</span>
                  <Checkbox
                    checked={modules.every((m) => m.create)}
                    indeterminate={modules.some((m) => m.create) && !modules.every((m) => m.create)}
                    onChange={(e) => handleSelectAll("create", e.target.checked)}
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                <div className="flex flex-col items-center gap-1">
                  <span>Read</span>
                  <Checkbox
                    checked={modules.every((m) => m.read)}
                    indeterminate={modules.some((m) => m.read) && !modules.every((m) => m.read)}
                    onChange={(e) => handleSelectAll("read", e.target.checked)}
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                <div className="flex flex-col items-center gap-1">
                  <span>Update</span>
                  <Checkbox
                    checked={modules.every((m) => m.update)}
                    indeterminate={modules.some((m) => m.update) && !modules.every((m) => m.update)}
                    onChange={(e) => handleSelectAll("update", e.target.checked)}
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                <div className="flex flex-col items-center gap-1">
                  <span>Delete</span>
                  <Checkbox
                    checked={modules.every((m) => m.delete)}
                    indeterminate={modules.some((m) => m.delete) && !modules.every((m) => m.delete)}
                    onChange={(e) => handleSelectAll("delete", e.target.checked)}
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {modules.map((module) => (
              <>
                <tr key={module.module_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {module.subModules && module.subModules.length > 0 && (
                        <button
                          onClick={() => toggleModuleExpand(module.module_id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {module.expanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      )}
                      {(!module.subModules || module.subModules.length === 0) && (
                        <div className="w-6" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{module.module_name}</div>
                        {module.description && (
                          <div className="text-xs text-gray-500">{module.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Checkbox
                      checked={module.create}
                      onChange={(e) =>
                        handlePermissionChange(module.module_id, "create", e.target.checked)
                      }
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Checkbox
                      checked={module.read}
                      onChange={(e) =>
                        handlePermissionChange(module.module_id, "read", e.target.checked)
                      }
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Checkbox
                      checked={module.update}
                      onChange={(e) =>
                        handlePermissionChange(module.module_id, "update", e.target.checked)
                      }
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Checkbox
                      checked={module.delete}
                      onChange={(e) =>
                        handlePermissionChange(module.module_id, "delete", e.target.checked)
                      }
                    />
                  </td>
                </tr>
                {module.expanded &&
                  module.subModules?.map((sub) => (
                    <tr key={sub.module_id} className="hover:bg-gray-50 bg-gray-25">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2 pl-10">
                          <div className="w-2 h-2 bg-gray-300 rounded-full" />
                          <div>
                            <div className="text-sm text-gray-700">{sub.module_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Checkbox
                          checked={sub.create}
                          onChange={(e) =>
                            handlePermissionChange(
                              sub.module_id,
                              "create",
                              e.target.checked,
                              true,
                              module.module_id
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Checkbox
                          checked={sub.read}
                          onChange={(e) =>
                            handlePermissionChange(
                              sub.module_id,
                              "read",
                              e.target.checked,
                              true,
                              module.module_id
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Checkbox
                          checked={sub.update}
                          onChange={(e) =>
                            handlePermissionChange(
                              sub.module_id,
                              "update",
                              e.target.checked,
                              true,
                              module.module_id
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Checkbox
                          checked={sub.delete}
                          onChange={(e) =>
                            handlePermissionChange(
                              sub.module_id,
                              "delete",
                              e.target.checked,
                              true,
                              module.module_id
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Roles Tab
  const renderRolesTab = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search roles..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => openRoleModal("create")}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Role</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {rolesLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredRoles.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRoles.map((role) => (
                    <tr key={role.role_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <UserCog className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{role.role_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{role.role_code || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{role.description || "-"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRoleModal("edit", role)}
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.role_id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <UserCog className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Roles Found</h3>
                <p className="text-gray-500">
                  {roleSearch ? "No roles match your search." : "Create your first role to get started."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderByRoleTab = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
              <Select
                placeholder="Select a role to configure permissions"
                className="w-full"
                size="large"
                loading={rolesLoading}
                value={selectedRole || undefined}
                onChange={(value) => setSelectedRole(value)}
              >
                {roles.map((role) => (
                  <Option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {selectedRole ? (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Module Permissions</h3>
                <p className="text-sm text-gray-500">
                  Configure CRUD permissions for each module for this role
                </p>
              </div>
              {hasChanges && (
                <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  Unsaved changes
                </span>
              )}
            </div>
            {renderPermissionMatrix()}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Role</h3>
            <p className="text-gray-500">
              Choose a role from the dropdown above to configure its module permissions
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderByUserTab = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search & Select User</label>
              <Select
                showSearch
                placeholder="Search for a user by name or email"
                className="w-full"
                size="large"
                loading={usersLoading}
                value={selectedUser || undefined}
                onChange={(value) => setSelectedUser(value)}
                filterOption={(input, option) => {
                  const user = users.find((u) => u.user_id === option?.value);
                  return (
                    user?.user_name?.toLowerCase().includes(input.toLowerCase()) ||
                    user?.user_email?.toLowerCase().includes(input.toLowerCase()) ||
                    false
                  );
                }}
              >
                {users.map((user) => (
                  <Option key={user.user_id} value={user.user_id}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                        {user.user_name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <span className="font-medium">{user.user_name}</span>
                        <span className="text-gray-500 ml-2">({user.user_email})</span>
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {selectedUser ? (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Permissions</h3>
                <p className="text-sm text-gray-500">
                  Configure individual permissions for this user (overrides role defaults)
                </p>
              </div>
              {hasChanges && (
                <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  Unsaved changes
                </span>
              )}
            </div>
            {renderPermissionMatrix()}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a User</h3>
            <p className="text-gray-500">
              Choose a user from the dropdown above to configure their individual permissions
            </p>
          </div>
        )}
      </div>
    );
  };

  const tabItems = [
    {
      key: "roles",
      label: (
        <span className="flex items-center gap-2">
          <UserCog className="h-4 w-4" />
          Manage Roles
        </span>
      ),
      children: renderRolesTab(),
    },
    {
      key: "by-role",
      label: (
        <span className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          By Role
        </span>
      ),
      children: renderByRoleTab(),
    },
    {
      key: "by-user",
      label: (
        <span className="flex items-center gap-2">
          <User className="h-4 w-4" />
          By User
        </span>
      ),
      children: renderByUserTab(),
    },
  ];

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Authorizations</h1>
                <p className="text-gray-500">
                  Manage roles and module-level access permissions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
              {(activeTab === "by-role" || activeTab === "by-user") && (
                <button
                  onClick={handleSavePermissions}
                  disabled={saving || !hasChanges || (!selectedRole && !selectedUser)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 transition-colors"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key as TabKey);
            setHasChanges(false);
          }}
          items={tabItems}
          className="authorization-tabs"
        />
      </div>

      {/* Role Modal */}
      <Modal
        title={roleModalMode === "create" ? "Create New Role" : "Edit Role"}
        open={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        footer={[
          <button
            key="cancel"
            onClick={() => setRoleModalVisible(false)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 mr-2"
          >
            Cancel
          </button>,
          <button
            key="submit"
            onClick={handleRoleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : roleModalMode === "create" ? "Create Role" : "Update Role"}
          </button>,
        ]}
      >
        <Form form={roleForm} layout="vertical" className="mt-4">
          <Form.Item
            name="role_name"
            label="Role Name"
            rules={[{ required: true, message: "Please enter a role name" }]}
          >
            <Input placeholder="e.g., Manager, Supervisor" />
          </Form.Item>
          <Form.Item name="role_code" label="Role Code">
            <Input placeholder="e.g., MGR001" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Describe this role's responsibilities" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AuthorizationsPage;
