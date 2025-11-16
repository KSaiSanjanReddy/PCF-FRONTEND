import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { BackendUser } from "../../types";

const UsersEdit: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<BackendUser | null>(null);
  const [roles, setRoles] = useState<
    Array<{ role_id: string; role_name: string }>
  >([]);
  const [departments, setDepartments] = useState<
    Array<{ department_id: string; department_name: string }>
  >([]);
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    user_role: "",
    user_department: "",
    user_phone_number: "",
    user_max_dis_per: 0,
    user_min_dis_per: 0,
  });

  useEffect(() => {
    if (userId) {
      loadUser();
      loadRoles();
      loadDepartments();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "https://enviguide.nextechltd.in"
        }/api/user/getById?user_id=${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status && data.data && data.data.length > 0) {
          const userData = data.data[0];
          setUser(userData);
          setFormData({
            user_name: userData.user_name || "",
            user_email: userData.user_email || "",
            user_role: userData.user_role || "",
            user_department: userData.user_department || "",
            user_phone_number: userData.user_phone_number || "",
            user_max_dis_per: userData.user_max_dis_per || 0,
            user_min_dis_per: userData.user_min_dis_per || 0,
          });
        }
      } else {
        alert("Failed to load user data");
        navigate("/settings/users");
      }
    } catch (error) {
      console.error("Error loading user:", error);
      alert("Error loading user data");
      navigate("/settings/users");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "https://enviguide.nextechltd.in"
        }/api/get-role-list`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.status && data.data && data.data.rows) {
          setRoles(data.data.rows);
        } else if (data.status && data.data) {
          // Fallback for legacy format
          setRoles(data.data);
        }
      }
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "https://enviguide.nextechltd.in"
        }/api/get-department-list`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.status && data.data && data.data.rows) {
          setDepartments(data.data.rows);
        } else if (data.status && data.data) {
          // Fallback for legacy format
          setDepartments(data.data);
        }
      }
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) return;

    try {
      setSaving(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "https://enviguide.nextechltd.in"
        }/api/user/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            ...formData,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          alert("User updated successfully!");
          navigate("/settings/users");
        } else {
          alert("Failed to update user: " + data.message);
        }
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/settings/users")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Users</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/settings/users")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Users</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
              <p className="text-gray-600">
                Update user information and permissions
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Name *
              </label>
              <input
                type="text"
                name="user_name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.user_name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="user_email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.user_email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="user_role"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.user_role}
                onChange={handleInputChange}
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_name}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                name="user_department"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.user_department}
                onChange={handleInputChange}
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_name}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="user_phone_number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.user_phone_number}
                onChange={handleInputChange}
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Discount Percentage
              </label>
              <input
                type="number"
                name="user_max_dis_per"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.user_max_dis_per}
                onChange={handleInputChange}
              />
            </div> */}

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Discount Percentage
              </label>
              <input
                type="number"
                name="user_min_dis_per"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.user_min_dis_per}
                onChange={handleInputChange}
              />
            </div> */}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/settings/users")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsersEdit;
