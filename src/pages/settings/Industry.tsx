import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowLeft,
  Download,
  Upload,
  Users,
  X,
  Save,
} from "lucide-react";

interface IndustryData {
  id: string;
  code: string;
  name: string;
  description: string;
}

const Industry: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"type" | "category">("type");

  const [industryTypes, setIndustryTypes] = useState<IndustryData[]>([
    {
      id: "1",
      code: "CHS001",
      name: "Chassis",
      description: "Business entities and corporate organizations",
    },
    {
      id: "2",
      code: "FUL002",
      name: "BatteryCell",
      description: "Private individuals and personal clients",
    },
    {
      id: "3",
      code: "CE003",
      name: "Aluminium",
      description: "Government agencies and public sector organizations",
    },
  ]);

  const [industryCategories, setIndustryCategories] = useState<IndustryData[]>([
    {
      id: "1",
      code: "CAT001",
      name: "Electronics",
      description: "Electronic components and devices",
    },
    {
      id: "2",
      code: "CAT002",
      name: "Mechanical",
      description: "Mechanical parts and assemblies",
    },
    {
      id: "3",
      code: "CAT003",
      name: "Software",
      description: "Software products and applications",
    },
  ]);

  const [newItem, setNewItem] = useState({
    code: "",
    name: "",
    description: "",
  });

  const [editingItem, setEditingItem] = useState<IndustryData | null>(null);
  const [editItem, setEditItem] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<IndustryData | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const getCurrentData = () => {
    switch (activeTab) {
      case "type":
        return industryTypes;
      case "category":
        return industryCategories;
      default:
        return industryTypes;
    }
  };

  const getCurrentSetter = () => {
    switch (activeTab) {
      case "type":
        return setIndustryTypes;
      case "category":
        return setIndustryCategories;
      default:
        return setIndustryTypes;
    }
  };

  const handleDelete = (id: string) => {
    const setter = getCurrentSetter();
    const currentData = getCurrentData();
    setter(currentData.filter((item) => item.id !== id));
  };

  const handleAddNew = () => {
    if (newItem.code && newItem.name && newItem.description) {
      const setter = getCurrentSetter();
      const currentData = getCurrentData();
      const newId = (currentData.length + 1).toString();

      setter([
        ...currentData,
        {
          id: newId,
          code: newItem.code,
          name: newItem.name,
          description: newItem.description,
        },
      ]);

      setNewItem({ code: "", name: "", description: "" });
    }
  };

  const handleInputChange = (field: keyof typeof newItem, value: string) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (item: IndustryData) => {
    setEditingItem(item);
    setEditItem({
      code: item.code,
      name: item.name,
      description: item.description,
    });
  };

  const handleSaveEdit = () => {
    if (editingItem && editItem.code && editItem.name && editItem.description) {
      const setter = getCurrentSetter();
      const currentData = getCurrentData();

      setter(
        currentData.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                code: editItem.code,
                name: editItem.name,
                description: editItem.description,
              }
            : item
        )
      );

      handleCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditItem({ code: "", name: "", description: "" });
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
  };

  const handleAutoSave = () => {
    if (editingItem && editItem.code && editItem.name && editItem.description) {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new timeout for auto-save (2 seconds after last change)
      const timeout = setTimeout(() => {
        handleSaveEdit();
      }, 2000);

      setAutoSaveTimeout(timeout);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      // Ctrl+Enter to save
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      // Escape to cancel
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleDeleteClick = (item: IndustryData) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      handleDelete(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  const handleEditInputChange = (
    field: keyof typeof editItem,
    value: string
  ) => {
    setEditItem((prev) => ({ ...prev, [field]: value }));
    // Trigger auto-save after input change
    setTimeout(() => handleAutoSave(), 100);
  };

  const currentData = getCurrentData();
  const getTabTitle = () => {
    switch (activeTab) {
      case "type":
        return "Industry Type";
      case "category":
        return "Industry Category";
      default:
        return "Industry Type";
    }
  };

  const getCodeTitle = () => {
    switch (activeTab) {
      case "type":
        return "Industry Type Code";
      case "category":
        return "Industry Category Code";
      default:
        return "Industry Type Code";
    }
  };

  const getNameTitle = () => {
    switch (activeTab) {
      case "type":
        return "Industry Type Name";
      case "category":
        return "Industry Category Name";
      default:
        return "Industry Type Name";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Setup Data</span>
        </button>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Industry Setup Data
                  </h1>
                  <p className="text-gray-600">
                    Define sub-categories within main product groups.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Import CSV</span>
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4 flex justify-between items-center">
            <div className="flex space-x-8 border-b border-gray-200 mb-5">
              {[
                { key: "type", label: "Industry Type" },
                { key: "category", label: "Industry Category" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200"
              style={{ opacity: editingItem ? 1 : 0 }}
            >
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Keyboard shortcuts available
                </p>
                <p className="text-xs text-blue-600">
                  <kbd className="px-1.5 py-0.5 bg-blue-100 rounded text-xs font-mono">
                    Ctrl+Enter
                  </kbd>{" "}
                  to save •
                  <kbd className="px-1.5 py-0.5 bg-blue-100 rounded text-xs font-mono ml-1">
                    Esc
                  </kbd>{" "}
                  to cancel
                </p>
              </div>
              <button
                onClick={handleCancelEdit}
                className="text-blue-400 hover:text-blue-600 transition-colors"
                title="Close hint"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="px-6 pb-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-green-50 to-green-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
                        {getCodeTitle()}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
                        {getNameTitle()}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-green-800 uppercase tracking-wider w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`group hover:bg-gray-50 transition-colors duration-150 ${
                          editingItem?.id === item.id
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : ""
                        } ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                      >
                        {editingItem?.id === item.id ? (
                          // Enhanced Edit Mode
                          <>
                            <td className="px-6 py-4">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={editItem.code}
                                  onChange={(e) =>
                                    handleEditInputChange(
                                      "code",
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={handleKeyDown}
                                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 bg-white shadow-sm"
                                  placeholder="Enter code"
                                  autoFocus
                                />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={editItem.name}
                                onChange={(e) =>
                                  handleEditInputChange("name", e.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 bg-white shadow-sm"
                                placeholder="Enter name"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={editItem.description}
                                onChange={(e) =>
                                  handleEditInputChange(
                                    "description",
                                    e.target.value
                                  )
                                }
                                onKeyDown={handleKeyDown}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 bg-white shadow-sm"
                                placeholder="Enter description"
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={handleSaveEdit}
                                  disabled={
                                    !editItem.code ||
                                    !editItem.name ||
                                    !editItem.description
                                  }
                                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md disabled:hover:shadow-none flex items-center space-x-1"
                                  title="Save (Ctrl+Enter)"
                                >
                                  <Save className="h-3 w-3" />
                                  <span>Save</span>
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                                  title="Cancel (Esc)"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // View Mode
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {item.code}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600 max-w-xs">
                                {item.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                  title="Edit item"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(item)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  title="Delete item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}

                    {/* Add New Row */}
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-dashed border-gray-300">
                      <td className="px-6 py-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter code"
                            value={newItem.code}
                            onChange={(e) =>
                              handleInputChange("code", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors placeholder-gray-400"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          placeholder="Enter name"
                          value={newItem.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors placeholder-gray-400"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          placeholder="Enter description"
                          value={newItem.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors placeholder-gray-400"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={handleAddNew}
                            disabled={
                              !newItem.code ||
                              !newItem.name ||
                              !newItem.description
                            }
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md disabled:hover:shadow-none flex items-center space-x-1"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add</span>
                          </button>
                          <button
                            onClick={() =>
                              setNewItem({
                                code: "",
                                name: "",
                                description: "",
                              })
                            }
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Clear form"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {currentData.length === 0 && (
                <div className="text-center py-12 bg-gray-50">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {getTabTitle().toLowerCase()} found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get started by adding your first{" "}
                    {getTabTitle().toLowerCase()}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete {getTabTitle()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Code:</span> {itemToDelete.code}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Name:</span> {itemToDelete.name}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Description:</span>{" "}
                  {itemToDelete.description}
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Industry;
