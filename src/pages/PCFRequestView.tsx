import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  User,
  CheckCircle,
  Loader,
  Microchip,
  MessageSquare,
  X,
} from "lucide-react";
import { ConfigProvider, message } from "antd";
import pcfService from "../lib/pcfService";
import authService from "../lib/authService";

const PCFRequestView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pcfData, setPcfData] = useState<any>(null);
  const [newComment, setNewComment] = useState("");

  // Format date helper
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${day} ${month} ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
    } catch (error) {
      return "N/A";
    }
  };

  // Calculate days remaining
  const calculateDaysRemaining = (dueDate: string): number => {
    try {
      const due = new Date(dueDate);
      const now = new Date();
      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      return 0;
    }
  };

  // Fetch PCF request data
  useEffect(() => {
    const fetchPCFData = async () => {
      if (!id) {
        setError("No PCF request ID provided");
        setIsLoading(false);
        return;
      }

      if (!authService.isAuthenticated()) {
        setError("User not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await pcfService.getPCFBOMById(id);

        if (result.success && result.data) {
          setPcfData(result.data);
        } else {
          setError(result.message || "Failed to load PCF request");
        }
      } catch (err) {
        console.error("Error fetching PCF data:", err);
        setError("An error occurred while loading PCF request");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPCFData();
  }, [id]);

  // Handle comment submission
  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    // TODO: Integrate with API
    setNewComment("");
    message.success("Comment added successfully");
  };

  // Handle approve/reject actions
  const handleApprove = () => {
    // TODO: Integrate with API
    message.success("Request approved");
  };

  const handleReject = () => {
    // TODO: Integrate with API
    message.warning("Request rejected");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader
            className="animate-spin mx-auto mb-4 text-green-600"
            size={48}
          />
          <p className="text-gray-600">Loading PCF Request...</p>
        </div>
      </div>
    );
  }

  if (error || !pcfData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-600" size={48} />
          <p className="text-gray-600 mb-4">
            {error || "PCF Request not found"}
          </p>
          <button
            onClick={() => navigate("/pcf-request")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  // Extract data from API response - access nested structure
  const pcfRequest = pcfData.pcf_request || {};
  const stagesStatus = pcfData.pcf_request_stages_status || {};
  const productSpecs = pcfData.product_specifications || [];
  const bomDetails = pcfData.bom_details || [];

  // Extract request data
  const productName =
    pcfRequest.component_type_name || pcfRequest.product_category_name;
  const requestNumber = pcfRequest.code;
  const referenceNumber =
    pcfRequest.component_type_name || pcfRequest.product_category_name;
  const submittedOn = pcfRequest.created_date
    ? formatDate(pcfRequest.created_date)
    : null;
  const dueDate = pcfRequest.due_date;
  const daysRemaining = dueDate ? calculateDaysRemaining(dueDate) : null;
  const formattedDueDate = dueDate ? formatDate(dueDate) : null;
  const submittedBy =
    pcfRequest.created_by_name || pcfRequest.manufacturer_name;
  const priority = pcfRequest.priority;
  const requestDescription = pcfRequest.request_description;
  const requestTitle = pcfRequest.request_title;
  const requestOrganization = pcfRequest.request_organization;

  // Build stages array from stages_status
  const buildStages = () => {
    const stageDefinitions = [
      {
        id: "1",
        name: "PCF Request Created",
        status: stagesStatus.is_pcf_request_created ? "completed" : "pending",
        completedDate: stagesStatus.pcf_request_created_date,
        completedBy: stagesStatus.pcf_request_created_by_name,
      },
      {
        id: "2",
        name: "PCF Request Submitted",
        status: stagesStatus.is_pcf_request_submitted ? "completed" : "pending",
        completedDate: stagesStatus.pcf_request_submitted_date,
        completedBy: stagesStatus.pcf_request_submitted_by_name,
      },
      {
        id: "3",
        name: "BOM Verified",
        status: stagesStatus.is_bom_verified ? "completed" : "pending",
        completedDate: stagesStatus.bom_verified_date,
        completedBy: stagesStatus.bom_verified_by_name,
      },
      {
        id: "4",
        name: "Data Collection",
        status: stagesStatus.is_data_collected
          ? "completed"
          : stagesStatus.is_bom_verified
          ? "in-progress"
          : "pending",
        completedDate: null,
        completedBy: null,
      },
      {
        id: "5",
        name: "Data Quality Rating",
        status: stagesStatus.is_dqr_completed
          ? "completed"
          : stagesStatus.is_data_collected
          ? "in-progress"
          : "pending",
        completedDate: stagesStatus.dqr_completed_date,
        completedBy: stagesStatus.dqr_completed_by_name,
      },
      {
        id: "6",
        name: "PCF Calculation",
        status: stagesStatus.is_pcf_calculated
          ? "completed"
          : stagesStatus.is_dqr_completed
          ? "in-progress"
          : "pending",
        completedDate: stagesStatus.pcf_calculated_date,
        completedBy: stagesStatus.pcf_calculated_by,
      },
      {
        id: "7",
        name: "Result Validation & Verification",
        status: stagesStatus.is_result_validation_verified
          ? "completed"
          : stagesStatus.is_pcf_calculated
          ? "in-progress"
          : "pending",
        completedDate: stagesStatus.result_validation_verified_date,
        completedBy: stagesStatus.result_validation_verified_by_name,
      },
      {
        id: "8",
        name: "Result Submitted",
        status: stagesStatus.is_result_submitted
          ? "completed"
          : stagesStatus.is_result_validation_verified
          ? "in-progress"
          : "pending",
        completedDate: stagesStatus.result_submitted_date,
        completedBy: stagesStatus.result_submitted_by_name,
      },
    ];
    return stageDefinitions;
  };

  const stages = buildStages();

  // Determine current stage status
  const getCurrentStageStatus = () => {
    if (stagesStatus.is_result_submitted) return "Completed";
    if (stagesStatus.is_result_validation_verified) return "In Progress";
    if (stagesStatus.is_pcf_calculated) return "In Progress";
    if (stagesStatus.is_dqr_completed) return "In Progress";
    if (stagesStatus.is_data_collected) return "In Progress";
    if (stagesStatus.is_bom_verified) return "In Progress";
    if (stagesStatus.is_pcf_request_submitted) return "In Progress";
    if (stagesStatus.is_pcf_request_created) return "In Progress";
    return "Pending";
  };

  const currentStageStatus = getCurrentStageStatus();

  // Get current active stage name
  const getCurrentStageName = () => {
    const activeStage = stages.find((s) => s.status === "in-progress");
    return activeStage
      ? activeStage.name
      : stages.find((s) => s.status === "completed")?.name || "Not Started";
  };

  const currentStage = getCurrentStageName();

  // Approvers and comments - these may not be in the API response yet
  const approvers = pcfData.approvers || [];
  const comments = pcfData.comments || [];

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 8,
          colorPrimary: "#52c41a",
          colorSuccess: "#52c41a",
          colorWarning: "#faad14",
          colorError: "#dc3545",
          colorInfo: "#1890ff",
        },
      }}
    >
      <div className="bg-gray-100 min-h-screen p-6">
        {/* Navigation */}
        <button
          onClick={() => navigate("/pcf-request")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">PCF Request</span>
        </button>

        {/* Request Summary Card */}
        {(productName || requestNumber) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-wrap gap-6 items-start">
              {/* Main Product Card */}
              {(productName || requestNumber) && (
                <div className="flex-1 min-w-[300px]">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-4 rounded-xl">
                      <Microchip className="text-green-600" size={32} />
                    </div>
                    <div>
                      {productName && (
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                          {productName}
                        </h1>
                      )}
                      {requestNumber && (
                        <p className="text-gray-600 font-medium">
                          {requestNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="flex flex-wrap gap-4">
                {/* Days Remaining */}
                {daysRemaining !== null && (
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 min-w-[180px]">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Calendar className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Days Remaining
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {daysRemaining}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Priority */}
                {priority && (
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 min-w-[180px]">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <AlertTriangle className="text-orange-600" size={20} />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Priority</div>
                        <div className="text-xl font-bold text-gray-900">
                          {priority}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submitted By */}
                {submittedBy && (
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 min-w-[180px]">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <User className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Submitted By
                        </div>
                        <div className="text-xl font-bold text-gray-900 truncate">
                          {submittedBy}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Request Information */}
        {(referenceNumber ||
          submittedOn ||
          formattedDueDate ||
          currentStage) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Request Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referenceNumber && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Reference Number
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {referenceNumber}
                  </div>
                </div>
              )}
              {submittedOn && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Submitted On</div>
                  <div className="text-base font-semibold text-gray-900">
                    {submittedOn}
                  </div>
                </div>
              )}
              {formattedDueDate && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Due Date</div>
                  <div className="text-base font-semibold text-gray-900">
                    {formattedDueDate}
                  </div>
                </div>
              )}
              {currentStage && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Current Stage
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {currentStage}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Details */}
        {(pcfRequest.product_category_name ||
          pcfRequest.component_category_name ||
          pcfRequest.component_type_name ||
          pcfRequest.product_code) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Product Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pcfRequest.product_category_name && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Product Category
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {pcfRequest.product_category_name}
                  </div>
                </div>
              )}
              {pcfRequest.component_category_name && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Component Category
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {pcfRequest.component_category_name}
                  </div>
                </div>
              )}
              {pcfRequest.component_type_name && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Component Type
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {pcfRequest.component_type_name}
                  </div>
                </div>
              )}
              {pcfRequest.product_code && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Product Code</div>
                  <div className="text-base font-semibold text-gray-900">
                    {pcfRequest.product_code}
                  </div>
                </div>
              )}
              {pcfRequest.model_version && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Model Version
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {pcfRequest.model_version}
                  </div>
                </div>
              )}
              {pcfRequest.manufacturer_name && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Manufacturer</div>
                  <div className="text-base font-semibold text-gray-900">
                    {pcfRequest.manufacturer_name}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Request Description */}
        {requestDescription && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Request Description
            </h2>
            <p className="text-gray-700">{requestDescription}</p>
          </div>
        )}

        {/* Product Specifications */}
        {productSpecs && productSpecs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Product Specifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {productSpecs.map((spec: any) => (
                <div key={spec.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">
                    {spec.specification_name}
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {spec.specification_value} {spec.specification_unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOM Details */}
        {bomDetails && bomDetails.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              BOM Details
            </h2>
            <div className="space-y-4">
              {bomDetails.map((bom: any) => (
                <div key={bom.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">
                        {bom.component_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {bom.code} | {bom.material_number}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Quantity</div>
                      <div className="font-semibold text-gray-900">
                        {bom.qunatity}
                      </div>
                    </div>
                  </div>
                  {bom.detail_description && (
                    <p className="text-gray-700 text-sm mb-2">
                      {bom.detail_description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    {bom.production_location && (
                      <div>
                        <div className="text-gray-600">Location</div>
                        <div className="font-semibold text-gray-900">
                          {bom.production_location}
                        </div>
                      </div>
                    )}
                    {bom.manufacturer_name && (
                      <div>
                        <div className="text-gray-600">Manufacturer</div>
                        <div className="font-semibold text-gray-900">
                          {bom.manufacturer_name}
                        </div>
                      </div>
                    )}
                    {bom.total_weight_gms && (
                      <div>
                        <div className="text-gray-600">Weight</div>
                        <div className="font-semibold text-gray-900">
                          {bom.total_weight_gms} gms
                        </div>
                      </div>
                    )}
                    {bom.total_price && (
                      <div>
                        <div className="text-gray-600">Price</div>
                        <div className="font-semibold text-gray-900">
                          ${bom.total_price}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage Progress Bar - Only show if stages exist in API */}
        {stages && stages.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                PCF Request Stage
              </h2>
              {currentStageStatus && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {currentStageStatus}
                </span>
              )}
            </div>

            {/* Stage Description */}
            {requestDescription && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{requestDescription}</p>
              </div>
            )}

            {/* Progress Bar */}
            <div className="flex items-center justify-between relative">
              {stages.map((stage: any, index: number) => (
                <React.Fragment key={stage.id || index}>
                  <div className="flex flex-col items-center flex-1 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        stage.status === "completed"
                          ? "bg-green-600 border-green-600 text-white"
                          : stage.status === "in-progress"
                          ? "bg-green-600 border-green-600 text-white animate-pulse"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {stage.status === "completed" ? (
                        <CheckCircle size={24} />
                      ) : stage.status === "in-progress" ? (
                        <Loader className="animate-spin" size={24} />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div className="mt-2 text-xs text-center text-gray-600 max-w-[100px]">
                      {stage.name}
                    </div>
                  </div>
                  {index < stages.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 -mt-6 relative z-0 ${
                        stage.status === "completed"
                          ? "bg-green-600"
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Completed Stages - Only show if there are completed stages */}
        {stages &&
          stages.filter((s: any) => s.status === "completed").length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Completed Stages
              </h2>
              <div className="space-y-4">
                {stages
                  .filter((s: any) => s.status === "completed")
                  .map((stage: any) => (
                    <div
                      key={stage.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-600" size={24} />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {stage.name}
                          </div>
                          {stage.completedDate && (
                            <div className="text-sm text-gray-600">
                              Completed on {formatDate(stage.completedDate)}
                            </div>
                          )}
                          {stage.completedBy && (
                            <div className="text-sm text-gray-600">
                              by {stage.completedBy}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Approved
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* Approvers - Only show if approvers exist in API */}
        {approvers && approvers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Approvers</h2>
            <div className="space-y-4">
              {approvers.map((approver: any) => (
                <div
                  key={approver.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {(approver.name || approver.user_name || "U").charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {approver.name || approver.user_name}
                      </div>
                      {(approver.role || approver.user_role) && (
                        <div className="text-sm text-gray-600">
                          {approver.role || approver.user_role}
                        </div>
                      )}
                    </div>
                  </div>
                  {approver.status && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        approver.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : approver.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {approver.status === "approved"
                        ? "Approved"
                        : approver.status === "rejected"
                        ? "Rejected"
                        : "Pending"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments - Only show if comments exist in API or for adding new comments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Comments</h2>

          {/* Comments List */}
          {comments && comments.length > 0 && (
            <div className="space-y-4 mb-6">
              {comments.map((comment: any) => (
                <div
                  key={comment.id || comment.comment_id}
                  className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-600"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {(
                        comment.author ||
                        comment.user_name ||
                        comment.created_by_name ||
                        "U"
                      ).charAt(0)}
                    </div>
                    <div className="font-semibold text-gray-900">
                      {comment.author ||
                        comment.user_name ||
                        comment.created_by_name}
                    </div>
                    {(comment.timestamp || comment.created_date) && (
                      <div className="text-sm text-gray-500">
                        commented on{" "}
                        {comment.timestamp || formatDate(comment.created_date)}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 ml-10">
                    {comment.content || comment.comment || comment.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="border-t pt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={handleCommentSubmit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium flex items-center gap-2"
              >
                <MessageSquare size={18} />
                Comment
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <X size={18} />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default PCFRequestView;
