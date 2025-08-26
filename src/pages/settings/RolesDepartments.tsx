import React, { useEffect, useState } from 'react';
import { Shield, Building, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import authService from '../../lib/authService';
import type { Department, Role } from '../../types';
import Notification from '../../components/Notification';

type TabKey = 'roles' | 'departments';

interface EditableRole extends Partial<Role> {
  isNew?: boolean;
  isEditing?: boolean;
  isViewMode?: boolean;
  description?: string;
  originalValues?: { role_name?: string; description?: string };
}

interface EditableDepartment extends Partial<Department> {
  isNew?: boolean;
  isEditing?: boolean;
  isViewMode?: boolean;
  description?: string;
  originalValues?: { department_name?: string; description?: string };
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-3 px-12 py-4 text-base font-semibold transition-all duration-300 ease-in-out rounded-lg ${
      active 
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200' 
        : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const RolesDepartments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('roles');
  const [roles, setRoles] = useState<EditableRole[]>([]);
  const [departments, setDepartments] = useState<EditableDepartment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  }>({
    type: 'success',
    message: '',
    isVisible: false
  });

  useEffect(() => {
    let cancel = false;
    async function load() {
      console.log('Loading roles and departments...');
      try {
        const [r, d] = await Promise.all([authService.getRoles(), authService.getDepartments()]);
        console.log('Loaded roles:', r);
        console.log('Loaded departments:', d);
        if (!cancel) {
          // Set all existing items to view mode by default
          const rolesWithViewMode = (r || []).map(role => ({ 
            ...role, 
            isViewMode: true, 
            isEditing: false, 
            originalValues: undefined 
          }));
          const deptsWithViewMode = (d || []).map(dept => ({ 
            ...dept, 
            isViewMode: true, 
            isEditing: false, 
            originalValues: undefined 
          }));
          setRoles(rolesWithViewMode);
          setDepartments(deptsWithViewMode);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, []);

  // Update hasChanges whenever roles or departments change
  useEffect(() => {
    const hasNewItems = roles.some(r => r.isNew) || departments.some(d => d.isNew);
    
    // Check if any editing items have actual changes from their original values
    const hasActualChanges = roles.some(r => {
      if (!r.isEditing || !r.originalValues) return false;
      return r.role_name !== r.originalValues.role_name || r.description !== r.originalValues.description;
    }) || departments.some(d => {
      if (!d.isEditing || !d.originalValues) return false;
      return d.department_name !== d.originalValues.department_name || d.description !== d.originalValues.description;
    });
    
    setHasChanges(hasNewItems || hasActualChanges);
  }, [roles, departments]);

  function addNewRole() {
    const newRole: EditableRole = {
      role_id: `new_${Date.now()}`,
      role_name: '',
      description: '',
      isNew: true,
      isEditing: true,
      isViewMode: false,
    };
    setRoles(prev => [newRole, ...prev]);
    setHasChanges(true);
  }

  function addNewDepartment() {
    const newDept: EditableDepartment = {
      department_id: `new_${Date.now()}`,
      department_name: '',
      description: '',
      isNew: true,
      isEditing: true,
      isViewMode: false,
    };
    setDepartments(prev => [newDept, ...prev]);
    setHasChanges(true);
  }

  function updateRole(id: string, field: keyof EditableRole, value: string) {
    setRoles(prev => prev.map(r => r.role_id === id ? { ...r, [field]: value } : r));
    setHasChanges(true);
  }

  function updateDepartment(id: string, field: keyof EditableDepartment, value: string) {
    setDepartments(prev => prev.map(d => d.department_id === id ? { ...d, [field]: value } : d));
    setHasChanges(true);
  }

  function removeNewItem(id: string, isRole: boolean) {
    if (isRole) {
      setRoles(prev => {
        const filtered = prev.filter(r => r.role_id !== id);
        // Check if there are still other new items
        const hasOtherNewItems = filtered.some(r => r.isNew) || departments.some(d => d.isNew);
        const hasEditingItems = filtered.some(r => r.isEditing) || departments.some(d => d.isEditing);
        setHasChanges(hasOtherNewItems || hasEditingItems);
        return filtered;
      });
    } else {
      setDepartments(prev => {
        const filtered = prev.filter(d => d.department_id !== id);
        // Check if there are still other new items
        const hasOtherNewItems = roles.some(r => r.isNew) || filtered.some(d => d.isNew);
        const hasEditingItems = roles.some(r => r.isEditing) || filtered.some(d => d.isEditing);
        setHasChanges(hasOtherNewItems || hasEditingItems);
        return filtered;
      });
    }
  }

  function toggleEditMode(id: string, isRole: boolean) {
    if (isRole) {
      setRoles(prev => prev.map(r => 
        r.role_id === id 
          ? { 
              ...r, 
              isEditing: !r.isEditing, 
              isViewMode: r.isEditing,
              originalValues: !r.isEditing ? { role_name: r.role_name, description: r.description } : undefined
            }
          : r
      ));
    } else {
      setDepartments(prev => prev.map(d => 
        d.department_id === id 
          ? { 
              ...d, 
              isEditing: !d.isEditing, 
              isViewMode: d.isEditing,
              originalValues: !d.isEditing ? { department_name: d.department_name, description: d.description } : undefined
            }
          : d
      ));
    }
    setHasChanges(true);
  }

  function cancelEdit(id: string, isRole: boolean) {
    if (isRole) {
      setRoles(prev => prev.map(r => 
        r.role_id === id 
          ? { 
              ...r, 
              isEditing: false, 
              isViewMode: true,
              role_name: r.originalValues?.role_name || r.role_name,
              description: r.originalValues?.description || r.description,
              originalValues: undefined
            }
          : r
      ));
    } else {
      setDepartments(prev => prev.map(d => 
        d.department_id === id 
          ? { 
              ...d, 
              isEditing: false, 
              isViewMode: true,
              department_name: d.originalValues?.department_name || d.department_name,
              description: d.originalValues?.description || d.description,
              originalValues: undefined
            }
          : d
      ));
    }
    // Don't set hasChanges to false here - let the useEffect handle it
  }

  // Check if role name already exists
  function isRoleNameDuplicate(name: string, excludeId?: string): boolean {
    return roles.some(r => 
      !r.isNew && // Only check against existing roles, not new ones
      r.role_name?.toLowerCase() === name.toLowerCase() && 
      r.role_id !== excludeId
    );
  }

  // Check if department name already exists
  function isDepartmentNameDuplicate(name: string, excludeId?: string): boolean {
    return departments.some(d => 
      !d.isNew && // Only check against existing departments, not new ones
      d.department_name?.toLowerCase() === name.toLowerCase() && 
      d.department_id !== excludeId
    );
  }

  // Helper function to show notifications
  function showNotification(type: 'success' | 'error', message: string) {
    setNotification({
      type,
      message,
      isVisible: true
    });
  }

  // Function to close notifications
  function closeNotification() {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }

  async function handleSave() {
    if (loading || !hasChanges) {
      console.log('Save blocked - loading:', loading, 'hasChanges:', hasChanges);
      return;
    }

    setLoading(true);
    try {
      const newRoles = roles.filter(r => r.isNew && r.role_name?.trim());
      const newDepartments = departments.filter(d => d.isNew && d.department_name?.trim());
      
      // Get edited roles and departments
      const editedRoles = roles.filter(r => !r.isNew && r.isEditing && r.role_name?.trim());
      const editedDepartments = departments.filter(d => !d.isNew && d.isEditing && d.department_name?.trim());

      console.log('=== SAVE OPERATION DEBUG ===');
      console.log('All roles:', roles);
      console.log('All departments:', departments);
      console.log('New roles to create:', newRoles);
      console.log('New departments to create:', newDepartments);
      console.log('Edited roles to update:', editedRoles);
      console.log('Edited departments to update:', editedDepartments);
      console.log('Total items to process:', newRoles.length + newDepartments.length + editedRoles.length + editedDepartments.length);
      console.log('================================');

      if (newRoles.length === 0 && newDepartments.length === 0 && editedRoles.length === 0 && editedDepartments.length === 0) {
        console.log('No changes to save');
        setHasChanges(false);
        setLoading(false);
        return;
      }

      // Validate for duplicates before saving
      const duplicateRoles = newRoles.filter(r => isRoleNameDuplicate(r.role_name!));
      const duplicateDepartments = newDepartments.filter(d => isDepartmentNameDuplicate(d.department_name!));

      if (duplicateRoles.length > 0 || duplicateDepartments.length > 0) {
        let errorMessage = 'The following items already exist: ';
        if (duplicateRoles.length > 0) {
          errorMessage += `Roles: ${duplicateRoles.map(r => r.role_name).join(', ')}`;
        }
        if (duplicateDepartments.length > 0) {
          errorMessage += `${duplicateRoles.length > 0 ? ', ' : ''}Departments: ${duplicateDepartments.map(d => d.department_name).join(', ')}`;
        }
        errorMessage += '. Please use different names.';
        showNotification('error', errorMessage);
        setLoading(false);
        return;
      }

      const results = await Promise.all([
        // Create new items
        ...newRoles.map(r => authService.createRole({ 
          role_name: r.role_name!,
          description: r.description || undefined
        })),
        ...newDepartments.map(d => authService.createDepartment({ 
          department_name: d.department_name!,
          description: d.department_name || undefined
        })),
        // Update existing items
        ...editedRoles.map(r => authService.updateRole({
          role_id: r.role_id!,
          role_name: r.role_name!,
          description: r.description || undefined
        })),
        ...editedDepartments.map(d => authService.updateDepartment({
          department_id: d.department_id!,
          department_name: d.department_name!,
          description: d.description || undefined
        }))
      ]);

      console.log('API results:', results);

      const allSuccess = results.every(r => r.success);
      if (allSuccess) {
        // Refresh data to show the newly created records
        console.log('Refreshing data from backend...');
        const [refreshedRoles, refreshedDepts] = await Promise.all([
          authService.getRoles(),
          authService.getDepartments()
        ]);
        
        console.log('Refreshed roles:', refreshedRoles);
        console.log('Refreshed departments:', refreshedDepts);
        
        // Update state with fresh data from backend
        const rolesWithViewMode = (refreshedRoles || []).map(role => ({ 
          ...role, 
          isViewMode: true, 
          isEditing: false, 
          originalValues: undefined 
        }));
        const deptsWithViewMode = (refreshedDepts || []).map(dept => ({ 
          ...dept, 
          isViewMode: true, 
          isEditing: false, 
          originalValues: undefined 
        }));
        setRoles(rolesWithViewMode);
        setDepartments(deptsWithViewMode);
        setHasChanges(false);

        // Show success message with details
        let successMessage = 'Successfully saved: ';
        if (newRoles.length > 0) {
          successMessage += `New Roles: ${newRoles.map(r => r.role_name).join(', ')}`;
        }
        if (newDepartments.length > 0) {
          successMessage += `${newRoles.length > 0 ? ', ' : ''}New Departments: ${newDepartments.map(d => d.department_name).join(', ')}`;
        }
        if (editedRoles.length > 0) {
          successMessage += `${(newRoles.length > 0 || newDepartments.length > 0) ? ', ' : ''}Updated Roles: ${editedRoles.map(r => r.role_name).join(', ')}`;
        }
        if (editedDepartments.length > 0) {
          successMessage += `${(newRoles.length > 0 || newDepartments.length > 0 || editedRoles.length > 0) ? ', ' : ''}Updated Departments: ${editedDepartments.map(d => d.department_name).join(', ')}`;
        }
        showNotification('success', successMessage);
      } else {
        showNotification('error', 'Some items failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification('error', 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Roles & Departments</h2>
          <p className="text-gray-600">Manage system roles and department structure</p>
        </div>
        {/* Debug info */}
        {/* <div className="text-sm text-gray-500">
          <div>Roles: {roles.length} (New: {roles.filter(r => r.isNew).length}, Editing: {roles.filter(r => r.isEditing).length})</div>
          <div>Depts: {departments.length} (New: {departments.filter(d => d.isNew).length}, Editing: {departments.filter(d => d.isEditing).length})</div>
          <div>Has Changes: {hasChanges ? 'Yes' : 'No'}</div>
          <button 
            onClick={() => {
              console.log('Current roles:', roles);
              console.log('Current departments:', departments);
              console.log('Has changes:', hasChanges);
            }}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Debug State
          </button>
        </div> */}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 pt-6">
          <div className="flex justify-center">
            <div className="inline-flex rounded-xl overflow-hidden bg-gray-100 p-1.5 border border-gray-200 shadow-sm">
              <TabButton active={activeTab === 'roles'} onClick={() => setActiveTab('roles')} icon={<Shield className="h-5 w-5  " />} label="Roles Management" />
              <TabButton active={activeTab === 'departments'} onClick={() => setActiveTab('departments')} icon={<Building className="h-5 w-5" />} label="Departments Management" />
            </div>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'roles' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">System Roles</h3>
                </div>
                <button
                  onClick={addNewRole}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition-all duration-200"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">Add New Role</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-700 border-b-2 border-gray-200 bg-gray-50">
                      <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider">ROLE CODE</th>
                      <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider">ROLE NAME</th>
                      <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider">DESCRIPTION</th>
                      <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {roles.map((role) => (
                      <tr key={role.role_id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6">
                          {role.isNew ? (
                            <span className="text-gray-400 text-sm">Auto-generated</span>
                          ) : (
                            <span className="font-mono text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {role.role_id?.slice(0, 6)?.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                            <input
                              type="text"
                            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                              role.isNew || role.isEditing 
                                ? 'border-gray-300 bg-white shadow-sm' 
                                : 'border-gray-200 bg-gray-50'
                            }`}
                              placeholder="Enter role name"
                              value={role.role_name || ''}
                              onChange={(e) => updateRole(role.role_id!, 'role_name', e.target.value)}
                            disabled={!role.isNew && !role.isEditing}
                            />
                        </td>
                        <td className="py-4 px-6">
                            <input
                              type="text"
                            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                              role.isNew || role.isEditing 
                                ? 'border-gray-300 bg-white shadow-sm' 
                                : 'border-gray-200 bg-gray-50'
                            }`}
                              placeholder="Enter description"
                              value={role.description || ''}
                              onChange={(e) => updateRole(role.role_id!, 'description', e.target.value)}
                            disabled={!role.isNew && !role.isEditing}
                            />
                        </td>
                        <td className="py-4 px-6">
                          {role.isNew ? (
                            <button
                              onClick={() => removeNewItem(role.role_id!, true)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                              title="Remove"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          ) : role.isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSave()}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-sm font-medium shadow-sm transition-all duration-200"
                                title="Save"
                              >
                                <Save className="h-4 w-4" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => cancelEdit(role.role_id!, true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-medium transition-all duration-200"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => toggleEditMode(role.role_id!, true)}
                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200" 
                                title="Edit"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200" title="Delete">
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">System Departments</h3>
                </div>
                <button
                  onClick={addNewDepartment}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition-all duration-200"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">Add New Department</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-700 border-b-2 border-gray-200 bg-gray-50">
                      <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider">DEPARTMENT CODE</th>
                      <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider">DEPARTMENT NAME</th>
                      <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider">DESCRIPTION</th>
                      <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {departments.map((dept) => (
                      <tr key={dept.department_id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6">
                          {dept.isNew ? (
                            <span className="text-gray-400 text-sm">Auto-generated</span>
                          ) : (
                            <span className="font-mono text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {dept.department_id?.slice(0, 6)?.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                            <input
                              type="text"
                            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                              dept.isNew || dept.isEditing 
                                ? 'border-gray-300 bg-white shadow-sm' 
                                : 'border-gray-200 bg-gray-50'
                            }`}
                              placeholder="Enter department name"
                              value={dept.department_name || ''}
                              onChange={(e) => updateDepartment(dept.department_id!, 'department_name', e.target.value)}
                            disabled={!dept.isNew && !dept.isEditing}
                            />
                        </td>
                        <td className="py-4 px-6">
                            <input
                              type="text"
                            className={`w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                              dept.isNew || dept.isEditing 
                                ? 'border-gray-300 bg-white shadow-sm' 
                                : 'border-gray-200 bg-gray-50'
                            }`}
                              placeholder="Enter description"
                              value={dept.description || ''}
                              onChange={(e) => updateDepartment(dept.department_id!, 'description', e.target.value)}
                            disabled={!dept.isNew && !dept.isEditing}
                            />
                        </td>
                        <td className="py-4 px-6">
                          {dept.isNew ? (
                            <button
                              onClick={() => removeNewItem(dept.department_id!, false)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                              title="Remove"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          ) : dept.isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSave()}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-sm font-medium shadow-sm transition-all duration-200"
                                title="Save"
                              >
                                <Save className="h-4 w-4" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => cancelEdit(dept.department_id!, false)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-medium transition-all duration-200"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => toggleEditMode(dept.department_id!, false)}
                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200" 
                                title="Edit"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200" title="Delete">
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer Save Button */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-xl">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">You have unsaved changes</span>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 shadow-lg shadow-blue-200 transition-all duration-200 font-semibold"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Notification Component */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={closeNotification}
        duration={5000}
      />
    </div>
  );
};

export default RolesDepartments;


