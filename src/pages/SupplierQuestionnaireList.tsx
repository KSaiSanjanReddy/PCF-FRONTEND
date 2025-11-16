import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Star,
  Loader,
  AlertCircle,
  ClipboardList,
  Calendar,
  Mail,
  Building2,
} from "lucide-react";
import supplierQuestionnaireService from "../lib/supplierQuestionnaireService";
import authService from "../lib/authService";

interface QuestionnaireItem {
  _id: string;
  sgiq_id: string;
  name_of_organization: string;
  email_address: string;
  created_at: string;
  updated_at: string;
  status: string;
  user_id: string;
}

const SupplierQuestionnaireList: React.FC = () => {
  const navigate = useNavigate();
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireItem[]>([]);
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<
    QuestionnaireItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  useEffect(() => {
    filterQuestionnaires();
  }, [searchTerm, filterStatus, questionnaires]);

  const fetchQuestionnaires = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = authService.getCurrentUser();
      if (!user || !user.id) {
        setError("User not authenticated");
        return;
      }

      const result = await supplierQuestionnaireService.getQuestionnairesList(
        user.id
      );

      if (result.success && result.data) {
        // Handle different response structures
        let questionnairesList: QuestionnaireItem[] = [];

        if (Array.isArray(result.data)) {
          // If data is directly an array
          questionnairesList = result.data;
        } else if (result.data.supplier_general_info_questions) {
          // If data is nested under supplier_general_info_questions
          if (Array.isArray(result.data.supplier_general_info_questions)) {
            questionnairesList = result.data.supplier_general_info_questions;
          } else {
            // If it's a single object, wrap it in an array
            questionnairesList = [result.data.supplier_general_info_questions];
          }
        }

        setQuestionnaires(questionnairesList);
      } else {
        setError(result.message || "Failed to load questionnaires");
      }
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
      setError("An error occurred while fetching questionnaires");
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuestionnaires = () => {
    let filtered = [...questionnaires];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.name_of_organization?.toLowerCase().includes(searchLower) ||
          q.email_address?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((q) => q.status === filterStatus);
    }

    setFilteredQuestionnaires(filtered);
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

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      completed: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      draft: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200"
        }`}
      >
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader
            size={48}
            className="animate-spin text-green-500 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading questionnaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <ClipboardList size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Supplier Questionnaires
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and review supplier data submissions
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/supplier-questionnaire/new")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            <Plus size={20} />
            <span>New Questionnaire</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {questionnaires.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <ClipboardList size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {questionnaires.filter((q) => q.status === "completed").length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Star size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {questionnaires.filter((q) => q.status === "pending").length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Calendar size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Draft</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {questionnaires.filter((q) => q.status === "draft").length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <Edit size={24} className="text-gray-600" />
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
              placeholder="Search by organization name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Organization
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Created Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestionnaires.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <ClipboardList size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium">
                        No questionnaires found
                      </p>
                      <p className="text-sm">
                        {searchTerm || filterStatus !== "all"
                          ? "Try adjusting your filters"
                          : "Create your first questionnaire to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQuestionnaires.map((questionnaire) => (
                  <tr
                    key={questionnaire._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Building2 size={18} className="text-green-600" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {questionnaire.name_of_organization || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-sm">
                          {questionnaire.email_address || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm">
                          {formatDate(questionnaire.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(questionnaire.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/supplier-questionnaire/view?sgiq_id=${questionnaire.sgiq_id}&user_id=${questionnaire.user_id}`
                            )
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/supplier-questionnaire/edit?sgiq_id=${questionnaire.sgiq_id}&user_id=${questionnaire.user_id}`
                            )
                          }
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/data-quality-rating/view?sgiq_id=${questionnaire.sgiq_id}&user_id=${questionnaire.user_id}`
                            )
                          }
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View DQR"
                        >
                          <Star size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {filteredQuestionnaires.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {filteredQuestionnaires.length} of {questionnaires.length}{" "}
          questionnaires
        </div>
      )}
    </div>
  );
};

export default SupplierQuestionnaireList;
