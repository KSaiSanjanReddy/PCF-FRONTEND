import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  Eye,
  Loader,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  Building2,
} from "lucide-react";
import supplierQuestionnaireService from "../lib/supplierQuestionnaireService";
import authService from "../lib/authService";

interface DQRItem {
  _id: string;
  sgiq_id: string;
  bom_pcf_id?: string;
  organization_name?: string;
  average_rating?: number;
  assessment_count?: number;
  created_at: string;
  status: string;
}

const DataQualityRatingList: React.FC = () => {
  const navigate = useNavigate();
  const [dqrList, setDqrList] = useState<DQRItem[]>([]);
  const [filteredDQR, setFilteredDQR] = useState<DQRItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");

  useEffect(() => {
    fetchDQRList();
  }, []);

  useEffect(() => {
    filterDQRList();
  }, [searchTerm, filterRating, dqrList]);

  const fetchDQRList = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = authService.getCurrentUser();
      if (!user || !user.id) {
        setError("User not authenticated");
        return;
      }

      const result = await supplierQuestionnaireService.getDQRList(user.id);

      if (result.success && result.data) {
        // Transform data to include organization names
        // For now, we'll use the sgiq_id - in a real scenario, we'd fetch the organization names
        const dqrItems = result.data.dqr_ratings || result.data || [];
        setDqrList(dqrItems);
      } else {
        setError(result.message || "Failed to load DQR list");
      }
    } catch (error) {
      console.error("Error fetching DQR list:", error);
      setError("An error occurred while fetching DQR list");
    } finally {
      setIsLoading(false);
    }
  };

  const filterDQRList = () => {
    let filtered = [...dqrList];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.organization_name?.toLowerCase().includes(searchLower) ||
          item.sgiq_id?.toLowerCase().includes(searchLower)
      );
    }

    // Apply rating filter
    if (filterRating !== "all") {
      if (filterRating === "high") {
        filtered = filtered.filter((item) => (item.average_rating || 0) >= 4);
      } else if (filterRating === "medium") {
        filtered = filtered.filter(
          (item) =>
            (item.average_rating || 0) >= 2 && (item.average_rating || 0) < 4
        );
      } else if (filterRating === "low") {
        filtered = filtered.filter((item) => (item.average_rating || 0) < 2);
      }
    }

    setFilteredDQR(filtered);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 2) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingBadge = (rating: number) => {
    let colorClass = "bg-gray-100 text-gray-700 border-gray-200";
    if (rating >= 4)
      colorClass = "bg-green-100 text-green-700 border-green-200";
    else if (rating >= 2)
      colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
    else if (rating > 0) colorClass = "bg-red-100 text-red-700 border-red-200";

    return (
      <span
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}
      >
        <Star size={12} />
        {rating.toFixed(1)}
      </span>
    );
  };

  const calculateStats = () => {
    const total = dqrList.length;
    const completed = dqrList.filter(
      (item) => item.status === "completed"
    ).length;
    const pending = dqrList.filter((item) => item.status === "pending").length;
    const avgRating =
      dqrList.reduce((sum, item) => sum + (item.average_rating || 0), 0) /
        total || 0;

    return { total, completed, pending, avgRating };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader
            size={48}
            className="animate-spin text-green-500 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading data quality ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
            <Star size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Data Quality Ratings
            </h1>
            <p className="text-gray-600 mt-1">
              Review and assess data quality from supplier submissions
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Assessments
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <BarChart3 size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.completed}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Average Rating
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${getRatingColor(
                  stats.avgRating
                )}`}
              >
                {stats.avgRating.toFixed(1)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by organization or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
            >
              <option value="all">All Ratings</option>
              <option value="high">High (4-5)</option>
              <option value="medium">Medium (2-4)</option>
              <option value="low">Low (&lt;2)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 flex items-center gap-3">
          <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDQR.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-12 border border-gray-200">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Star size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">No assessments found</p>
              <p className="text-sm">
                {searchTerm || filterRating !== "all"
                  ? "Try adjusting your filters"
                  : "Complete supplier questionnaires to see data quality ratings"}
              </p>
            </div>
          </div>
        ) : (
          filteredDQR.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building2 size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.organization_name ||
                          `ID: ${item.sgiq_id?.slice(0, 8)}...`}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.assessment_count || 0} assessments
                      </p>
                    </div>
                  </div>
                  {getRatingBadge(item.average_rating || 0)}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`font-medium ${
                        item.status === "completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {item.status
                        ? item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date</span>
                    <span className="text-gray-900 font-medium flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      sgiq_id: item.sgiq_id,
                    });
                    if (item.bom_pcf_id) {
                      params.append("bom_pcf_id", item.bom_pcf_id);
                    }
                    navigate(`/data-quality-rating/view?${params.toString()}`);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  <Eye size={18} />
                  <span>View Assessment</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredDQR.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {filteredDQR.length} of {dqrList.length} assessments
        </div>
      )}
    </div>
  );
};

export default DataQualityRatingList;
