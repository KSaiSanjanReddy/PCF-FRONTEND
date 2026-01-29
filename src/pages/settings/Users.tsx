import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  RefreshCw,
  X,
  User,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { BackendUser } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Select, DatePicker } from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

interface FilterState {
  searchColumn: string;
  searchValue: string;
  fromDate: string;
  toDate: string;
  role: string;
  sortBy: string;
  sortOrder: string;
}

const SEARCH_COLUMNS = [
  { value: "user_name", label: "Name" },
  { value: "user_email", label: "Email" },
  { value: "user_phone_number", label: "Phone" },
  { value: "user_department", label: "Department" },
];

const ROLES = [
  { value: "", label: "All Roles" },
  { value: "Admin", label: "Admin" },
  { value: "User", label: "User" },
  { value: "Manager", label: "Manager" },
  { value: "Viewer", label: "Viewer" },
];

const SORT_OPTIONS = [
  { value: "user_name", label: "Name" },
  { value: "user_email", label: "Email" },
  { value: "created_at", label: "Created Date" },
  { value: "user_role", label: "Role" },
];

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BackendUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchColumn: "user_name",
    searchValue: "",
    fromDate: "",
    toDate: "",
    role: "",
    sortBy: "",
    sortOrder: "asc",
  });

  // Quick search (for the main search bar)
  const [quickSearch, setQuickSearch] = useState("");

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.append("pageNumber", pagination.current.toString());
    params.append("pageSize", pagination.pageSize.toString());

    // Use quick search or filter search
    const searchValue = quickSearch || filters.searchValue;
    if (searchValue) {
      params.append("searchColumn", filters.searchColumn);
      params.append("searchValue", searchValue);
    }

    if (filters.fromDate) {
      params.append("fromDate", filters.fromDate);
    }
    if (filters.toDate) {
      params.append("toDate", filters.toDate);
    }
    if (filters.role) {
      params.append("role", filters.role);
    }
    if (filters.sortBy) {
      params.append("sortBy", filters.sortBy);
      params.append("sortOrder", filters.sortOrder);
    }

    return params.toString();
  }, [pagination.current, pagination.pageSize, filters, quickSearch]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = buildQueryParams();
      const response = await fetch(
        `https://enviguide.nextechltd.in/api/user/getAll?${queryParams}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.status && data.data && data.data.userList) {
          setUsers(data.data.userList);
          setPagination((prev) => ({
            ...prev,
            total: parseInt(data.data.totalCount, 10) || 0,
          }));
        } else if (Array.isArray(data)) {
          setUsers(data);
          setPagination((prev) => ({ ...prev, total: data.length }));
        } else if (data.data && Array.isArray(data.data)) {
          setUsers(data.data);
          setPagination((prev) => ({ ...prev, total: data.data.length }));
        } else {
          console.warn("Unexpected users response format:", data);
          setUsers([]);
          setPagination((prev) => ({ ...prev, total: 0 }));
        }
      } else {
        console.error("Failed to fetch users:", response.status);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    // Listen for refresh events from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "refreshUsers" && e.newValue === "true") {
        localStorage.removeItem("refreshUsers");
        loadUsers();
      }
    };

    if (localStorage.getItem("refreshUsers") === "true") {
      localStorage.removeItem("refreshUsers");
      loadUsers();
    }

    const handleCustomRefresh = () => {
      loadUsers();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("refreshUsers", handleCustomRefresh);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("refreshUsers", handleCustomRefresh);
    };
  }, [loadUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current: page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({ ...prev, current: 1, pageSize: size }));
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev) => ({
        ...prev,
        fromDate: dates[0]!.format("YYYY-MM-DD"),
        toDate: dates[1]!.format("YYYY-MM-DD"),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        fromDate: "",
        toDate: "",
      }));
    }
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadUsers();
  };

  const handleResetFilters = () => {
    setFilters({
      searchColumn: "user_name",
      searchValue: "",
      fromDate: "",
      toDate: "",
      role: "",
      sortBy: "",
      sortOrder: "asc",
    });
    setQuickSearch("");
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleQuickSearch = (value: string) => {
    setQuickSearch(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const activeFiltersCount = [
    filters.searchValue,
    filters.fromDate,
    filters.role,
    filters.sortBy,
  ].filter(Boolean).length;

  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(
          `https://enviguide.nextechltd.in/api/user/delete/${userId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status) {
            // Remove user from local state
            setUsers((prev) => prev.filter((user) => user.user_id !== userId));
            alert("User deleted successfully!");
          } else {
            alert("Failed to delete user: " + data.message);
          }
        } else {
          alert("Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user");
      }
    }
  };

  const openUserDetails = (user: BackendUser) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setShowUserDetails(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Users</h2>
            <p className="text-gray-600">
              Manage system users and their permissions
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-500">
                  Manage system users and their permissions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
              <Link
                to="/settings/users/create"
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-600/20 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </Link>
            </div>
          </div>
        </div>

      {!showUserDetails ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center gap-2">
                <Select
                  value={filters.searchColumn}
                  onChange={(value) => handleFilterChange("searchColumn", value)}
                  className="w-[120px]"
                  size="large"
                >
                  {SEARCH_COLUMNS.map((col) => (
                    <Option key={col.value} value={col.value}>
                      {col.label}
                    </Option>
                  ))}
                </Select>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                    value={quickSearch}
                    onChange={(e) => handleQuickSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleApplyFilters();
                      }
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${
                  showFilters || activeFiltersCount > 0
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-600 text-white rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Role Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Role
                    </label>
                    <Select
                      value={filters.role}
                      onChange={(value) => handleFilterChange("role", value)}
                      className="w-full"
                      placeholder="Select role"
                      allowClear
                    >
                      {ROLES.map((role) => (
                        <Option key={role.value} value={role.value}>
                          {role.label}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      <Calendar className="inline w-3 h-3 mr-1" />
                      Date Range
                    </label>
                    <RangePicker
                      className="w-full"
                      value={
                        filters.fromDate && filters.toDate
                          ? [dayjs(filters.fromDate), dayjs(filters.toDate)]
                          : null
                      }
                      onChange={handleDateRangeChange}
                      format="YYYY-MM-DD"
                    />
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      <ArrowUpDown className="inline w-3 h-3 mr-1" />
                      Sort By
                    </label>
                    <Select
                      value={filters.sortBy}
                      onChange={(value) => handleFilterChange("sortBy", value)}
                      className="w-full"
                      placeholder="Select field"
                      allowClear
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <Option key={opt.value} value={opt.value}>
                          {opt.label}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Sort Order
                    </label>
                    <Select
                      value={filters.sortOrder}
                      onChange={(value) => handleFilterChange("sortOrder", value)}
                      className="w-full"
                      disabled={!filters.sortBy}
                    >
                      <Option value="asc">Ascending</Option>
                      <Option value="desc">Descending</Option>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4">
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            {users.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.user_id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openUserDetails(user)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.user_name?.charAt(0)?.toUpperCase() ||
                                  "U"}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.user_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.user_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {user.user_role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.user_department || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.user_phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div
                          className="flex items-center justify-end space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            to={`/settings/users/edit/${user.user_id}`}
                            className="text-gray-500 hover:text-green-600 p-2 rounded-lg hover:bg-green-50 transition-colors"
                            title="Edit User"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            onClick={() => handleDeleteUser(user.user_id)}
                            title="Delete User"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6">
                <div className="text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>
                    {quickSearch || activeFiltersCount > 0
                      ? "No users found matching your search."
                      : "No users found."}
                  </p>
                  {(quickSearch || activeFiltersCount > 0) && (
                    <button
                      onClick={handleResetFilters}
                      className="mt-2 text-blue-600 hover:text-blue-500"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-medium">
                    {Math.min(
                      (pagination.current - 1) * pagination.pageSize + 1,
                      pagination.total
                    )}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.current * pagination.pageSize,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span> users
                </span>
                <Select
                  value={pagination.pageSize}
                  onChange={handlePageSizeChange}
                  className="w-[100px]"
                  size="small"
                >
                  <Option value={10}>10 / page</Option>
                  <Option value={20}>20 / page</Option>
                  <Option value={50}>50 / page</Option>
                  <Option value={100}>100 / page</Option>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from(
                  {
                    length: Math.min(
                      Math.ceil(pagination.total / pagination.pageSize),
                      5
                    ),
                  },
                  (_, i) => {
                    const totalPages = Math.ceil(
                      pagination.total / pagination.pageSize
                    );
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.current <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.current >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = pagination.current - 2 + i;
                    }
                    return pageNum;
                  }
                ).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 rounded-lg font-medium transition-all ${
                      pagination.current === pageNum
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={
                    pagination.current >=
                    Math.ceil(pagination.total / pagination.pageSize)
                  }
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <button
                onClick={closeUserDetails}
                className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Users</span>
              </button>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  User Details
                </h2>
                <p className="text-gray-500">
                  View user information and permissions
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                  value={selectedUser?.user_name || ""}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                  value={selectedUser?.user_email || ""}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                  value={selectedUser?.user_role || ""}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                  value={selectedUser?.user_department || "N/A"}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                  value={selectedUser?.user_phone_number || ""}
                  disabled
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={closeUserDetails}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <Link
                to={`/settings/users/edit/${selectedUser?.user_id}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit User</span>
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default UsersPage;
