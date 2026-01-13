import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  X,
  Save,
  Download,
  Upload,
} from "lucide-react";
import {
  listSetup,
  addSetup,
  updateSetup,
  deleteSetup,
  type SetupItem,
  type SetupEntity,
} from "../../lib/dataSetupService";
import LoadingSpinner from "../../components/LoadingSpinner";

interface DataSetupItem {
  id: string;
  code: string;
  name: string;
  description: string;
}

interface TabConfig {
  key: string;
  label: string;
  entity: SetupEntity;
}

interface DataSetupTabsProps {
  title: string;
  description?: string;
  tabs: TabConfig[];
  defaultTab?: string;
}

const DataSetupTabs: React.FC<DataSetupTabsProps> = ({
  title,
  description,
  tabs,
  defaultTab,
}) => {
  const navigate = useNavigate();
  const { tab: urlTab } = useParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<string>(
    urlTab || defaultTab || tabs[0]?.key || ""
  );

  // State for each tab's data
  const [tabData, setTabData] = useState<Record<string, DataSetupItem[]>>({});
  const [newItem, setNewItem] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [editingItem, setEditingItem] = useState<{
    item: DataSetupItem;
    tab: string;
  } | null>(null);
  const [editItem, setEditItem] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    item: DataSetupItem;
    tab: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentTabConfig = tabs.find((t) => t.key === activeTab);
  const currentEntity = currentTabConfig?.entity;
  const currentData = tabData[activeTab] || [];

  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab, activeTab]);

  useEffect(() => {
    const load = async () => {
      if (!currentEntity) return;
      setIsLoading(true);
      const data = await listSetup(currentEntity);
      const normalized: DataSetupItem[] = (data as SetupItem[]).map(
        (i, idx) => ({
          id:
            (i as any).id?.toString?.() ||
            (i as any)._id?.toString?.() ||
            `${idx + 1}`,
          code: i.code,
          name: i.name,
          description: i.description || "",
        })
      );
      setTabData((prev) => ({ ...prev, [activeTab]: normalized }));
      setIsLoading(false);
    };
    load();
  }, [activeTab, currentEntity]);

  const handleDelete = async (id: string) => {
    if (!currentEntity) return;
    const ok = await deleteSetup(currentEntity, id);
    if (ok) {
      setTabData((prev) => ({
        ...prev,
        [activeTab]: (prev[activeTab] || []).filter((item) => item.id !== id),
      }));
    }
  };

  const handleAddNew = async () => {
    if (
      !currentEntity ||
      !newItem.code ||
      !newItem.name ||
      !newItem.description
    )
      return;
    const ok = await addSetup(currentEntity, newItem);
    if (ok) {
      const data = await listSetup(currentEntity);
      const normalized: DataSetupItem[] = (data as SetupItem[]).map(
        (i, idx) => ({
          id:
            (i as any).id?.toString?.() ||
            (i as any)._id?.toString?.() ||
            `${idx + 1}`,
          code: i.code,
          name: i.name,
          description: i.description || "",
        })
      );
      setTabData((prev) => ({ ...prev, [activeTab]: normalized }));
      setNewItem({ code: "", name: "", description: "" });
    }
  };

  const handleInputChange = (field: keyof typeof newItem, value: string) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (item: DataSetupItem) => {
    setEditingItem({ item, tab: activeTab });
    setEditItem({
      code: item.code,
      name: item.name,
      description: item.description,
    });
  };

  const handleSaveEdit = async () => {
    if (
      !currentEntity ||
      !editingItem ||
      !editItem.code ||
      !editItem.name ||
      !editItem.description
    )
      return;

    // Optimistic UI update
    setTabData((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map((item) =>
        item.id === editingItem.item.id
          ? {
              ...item,
              code: editItem.code,
              name: editItem.name,
              description: editItem.description,
            }
          : item
      ),
    }));

    const currentEditing = editingItem;
    handleCancelEdit();

    // Process API in background
    (async () => {
      const ok = await updateSetup(currentEntity, {
        id: currentEditing.item.id,
        code: editItem.code,
        name: editItem.name,
        description: editItem.description,
      });
      if (!ok) {
        console.error(
          "Update failed for",
          currentEntity,
          currentEditing.item.id
        );
      }
    })();
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditItem({ code: "", name: "", description: "" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleDeleteClick = (item: DataSetupItem) => {
    setItemToDelete({ item, tab: activeTab });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await handleDelete(itemToDelete.item.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleEditInputChange = (
    field: keyof typeof editItem,
    value: string
  ) => {
    setEditItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setEditingItem(null);
    setEditItem({ code: "", name: "", description: "" });
    setNewItem({ code: "", name: "", description: "" });
  };

  const handleExport = () => {
    if (!currentData || currentData.length === 0) {
      alert("No data to export");
      return;
    }

    // Convert data to CSV
    const headers = ["Code", "Name", "Description"];
    const rows = currentData.map((item) => [
      item.code,
      item.name,
      item.description,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${currentTabConfig?.label || "data"}-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        alert("CSV file must have at least a header row and one data row");
        return;
      }

      // Parse CSV (simple parser, assumes quoted values)
      const rows = lines.slice(1).map((line) => {
        const values: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        return values;
      });

      // Validate and import
      const itemsToAdd = rows
        .filter((row) => row.length >= 3 && row[0] && row[1] && row[2])
        .map((row) => ({
          code: row[0].replace(/^"|"$/g, ""),
          name: row[1].replace(/^"|"$/g, ""),
          description: row[2].replace(/^"|"$/g, ""),
        }));

      if (itemsToAdd.length === 0) {
        alert("No valid data found in CSV file");
        return;
      }

      // Import items one by one
      let successCount = 0;
      let failCount = 0;

      for (const item of itemsToAdd) {
        try {
          const ok = await addSetup(currentEntity!, item);
          if (ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      // Reload data
      if (successCount > 0) {
        const data = await listSetup(currentEntity!);
        const normalized: DataSetupItem[] = (data as SetupItem[]).map(
          (i, idx) => ({
            id:
              (i as any).id?.toString?.() ||
              (i as any)._id?.toString?.() ||
              `${idx + 1}`,
            code: i.code,
            name: i.name,
            description: i.description || "",
          })
        );
        setTabData((prev) => ({ ...prev, [activeTab]: normalized }));
        alert(
          `Import completed: ${successCount} items imported${
            failCount > 0 ? `, ${failCount} failed` : ""
          }`
        );
      } else {
        alert("Import failed. Please check your CSV format.");
      }
    };
    input.click();
  };

  if (!currentEntity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Configuration
          </h1>
          <p className="text-gray-600 mb-4">
            The requested data setup configuration was not found.
          </p>
          <button
            onClick={() => navigate("/settings")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Settings</span>
        </button>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                  <p className="text-gray-600 mt-1">{description}</p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleImport}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import CSV</span>
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Export CSV"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs - Only show if more than one tab */}
          {tabs.length > 1 && (
            <div className="px-6 pt-4">
              <div className="flex space-x-8 border-b border-gray-200 mb-5">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
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
            </div>
          )}

          {/* Keyboard Shortcuts Hint */}
          <div className="px-6 pt-4">
            <div
              className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200"
              style={{ display: editingItem ? "flex" : "none" }}
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
            {isLoading ? (
              <div className="py-16 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-green-50 to-green-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
                          Name
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
                            editingItem?.item.id === item.id &&
                            editingItem?.tab === activeTab
                              ? "bg-blue-50 border-l-4 border-blue-500"
                              : ""
                          } ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                        >
                          {editingItem?.item.id === item.id &&
                          editingItem?.tab === activeTab ? (
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
                                    handleEditInputChange(
                                      "name",
                                      e.target.value
                                    )
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
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                                    title="Cancel (Esc)"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
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
                          <input
                            type="text"
                            placeholder="Enter code"
                            value={newItem.code}
                            onChange={(e) =>
                              handleInputChange("code", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors placeholder-gray-400"
                          />
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
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No items found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Get started by adding your first item.
                    </p>
                  </div>
                )}
              </div>
            )}
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
                    Delete Item
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Code:</span>{" "}
                  {itemToDelete.item.code}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Name:</span>{" "}
                  {itemToDelete.item.name}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Description:</span>{" "}
                  {itemToDelete.item.description}
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

export default DataSetupTabs;
