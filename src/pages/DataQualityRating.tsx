import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Download,
  Save,
  X,
  Settings,
  Clock,
  Globe,
  Database,
  Target,
  Loader,
  ArrowLeft,
} from "lucide-react";
import supplierQuestionnaireService from "../lib/supplierQuestionnaireService";
import authService from "../lib/authService";
import { DQR_CONFIG } from "../config/questionnaireConfig";

interface DataPoint {
  id: number;
  name: string;
  unit: string;
  category: string;
  value: string;
  dqiRequired: string[];
  mcm_id?: string; // Store mcm_id for matching with saved ratings
  mcmt_id?: string; // Store mcmt_id for matching with saved ratings
}

const DataQualityRating = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sgiq_id = searchParams.get("sgiq_id");
  const bom_pcf_id_from_url = searchParams.get("bom_pcf_id");

  const [selectedDataPoint, setSelectedDataPoint] = useState<DataPoint | null>(
    null
  );
  const [dqiData, setDqiData] = useState<
    Record<number, Record<string, Record<string, string>>>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [supplierData, setSupplierData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load supplier questionnaire data on mount
  useEffect(() => {
    const fetchSupplierData = async () => {
      if (!sgiq_id) {
        setError("No supplier questionnaire ID provided");
        setIsLoading(false);
        return;
      }

      // Check authentication using the service method
      if (!authService.isAuthenticated()) {
        setError("User not authenticated");
        setIsLoading(false);
        return;
      }

      const user = authService.getCurrentUser();
      if (!user) {
        setError("User not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        const result = await supplierQuestionnaireService.getDQRDetailsById(
          sgiq_id
        );

        if (result.success && result.data) {
          setSupplierData(result.data);

          // Generate data points first
          const points = generateDataPointsFromData(result.data);

          // If DQR ratings already exist, populate the dqiData state
          if (result.data.dqr_ratings) {
            // Populate existing DQR data
            // dqr_ratings is an object with keys like dqr_raw_material_product_rating
            populateExistingDQRData(result.data.dqr_ratings, points);
          }
        } else {
          setError(result.message || "Failed to load supplier data");
        }
      } catch (err) {
        console.error("Error fetching supplier data:", err);
        setError("An error occurred while loading supplier data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplierData();
  }, [sgiq_id]);

  const populateExistingDQRData = (dqrRatings: any, points: DataPoint[]) => {
    // Populate existing DQR ratings into the dqiData state
    // dqrRatings is an object with keys like dqr_raw_material_product_rating
    if (!dqrRatings || typeof dqrRatings !== "object") {
      return;
    }

    const populatedData: Record<
      number,
      Record<string, Record<string, string>>
    > = {};

    // Iterate through all rating types (dqr_raw_material_product_rating, etc.)
    Object.values(dqrRatings).forEach((ratingArray: any) => {
      if (!Array.isArray(ratingArray)) return;

      ratingArray.forEach((rating: any) => {
        // Map rating data to data point structure
        // The rating.data field contains mcm_id for raw materials
        const dataValue = rating.data;

        // Try to match by mcm_id first (for raw materials), then by value/name
        const matchingPoint = points.find((point) => {
          // Match by mcm_id if available
          if (point.mcm_id && point.mcm_id === dataValue) {
            return true;
          }
          // Match by value or name as fallback
          if (point.value === dataValue || point.name.includes(dataValue)) {
            return true;
          }
          return false;
        });

        if (matchingPoint) {
          if (!populatedData[matchingPoint.id]) {
            populatedData[matchingPoint.id] = {};
          }

          // Map TeR
          if (rating.ter_tag_type && rating.ter_tag_value) {
            populatedData[matchingPoint.id]["TeR"] = {
              level1: rating.ter_tag_type,
              level2: rating.ter_tag_value,
            };
          }

          // Map TiR
          if (rating.tir_tag_type && rating.tir_tag_value) {
            populatedData[matchingPoint.id]["TiR"] = {
              level1: rating.tir_tag_type,
              level2: rating.tir_tag_value,
            };
          }

          // Map GR
          if (rating.gr_tag_type && rating.gr_tag_value) {
            populatedData[matchingPoint.id]["GR"] = {
              level1: rating.gr_tag_type,
              level2: rating.gr_tag_value,
            };
          }

          // Map C
          if (rating.c_tag_type) {
            populatedData[matchingPoint.id]["C"] = {
              classification: rating.c_tag_type,
            };
          }

          // Map PDS
          if (rating.pds_tag_type) {
            populatedData[matchingPoint.id]["PDS"] = {
              type: rating.pds_tag_type,
            };
          }
        }
      });
    });

    setDqiData(populatedData);
  };

  // Generate data points dynamically from supplier data (helper function)
  const generateDataPointsFromData = (data: any): DataPoint[] => {
    if (!data || !data.supplier_questions) {
      return [];
    }

    const points: DataPoint[] = [];
    const questions = data.supplier_questions;

    // Extract material composition data points
    if (
      questions.material_composition_questions &&
      questions.material_composition_questions.length > 0
    ) {
      const materialData = questions.material_composition_questions[0];

      // Raw materials
      if (
        materialData.main_raw_materials_used &&
        materialData.main_raw_materials_used.length > 0
      ) {
        materialData.main_raw_materials_used.forEach(
          (material: any, idx: number) => {
            // Handle both string and object formats
            let materialName: string;
            let materialValue: string;

            if (typeof material === "string") {
              materialName = material;
              materialValue = material;
            } else {
              // If it's an object, extract the name or ID
              materialName =
                material.mcm_details?.name ||
                material.mcmt_details?.name ||
                material.name ||
                material.mcm_id ||
                material.mcmt_id ||
                "Unknown Material";
              materialValue = materialName;
            }

            points.push({
              id: 1000 + idx,
              name: `Raw Material: ${materialName}`,
              unit: "kg",
              category: "Material",
              value: materialValue,
              dqiRequired: ["TeR", "TiR", "GR", "C", "PDS"],
              mcm_id:
                typeof material === "object" ? material.mcm_id : undefined,
              mcmt_id:
                typeof material === "object" ? material.mcmt_id : undefined,
            });
          }
        );
      }

      // Recycled material percentage
      if (materialData.percentage_recycled_material) {
        points.push({
          id: 2000,
          name: "Recycled Material Content",
          unit: "%",
          category: "Material",
          value: materialData.percentage_recycled_material,
          dqiRequired: ["TeR", "TiR", "GR", "C", "PDS"],
        });
      }
    }

    // Extract energy data points
    if (
      questions.energy_manufacturing_questions &&
      questions.energy_manufacturing_questions.length > 0
    ) {
      const energyData = questions.energy_manufacturing_questions[0];

      if (energyData.electricity_consumption_per_year) {
        points.push({
          id: 3000,
          name: "Electricity Consumption",
          unit: "kWh/year",
          category: "Energy",
          value: energyData.electricity_consumption_per_year,
          dqiRequired: ["TeR", "TiR", "GR", "C", "PDS"],
        });
      }

      if (energyData.renewable_electricity_percentage) {
        points.push({
          id: 3001,
          name: "Renewable Electricity Percentage",
          unit: "%",
          category: "Energy",
          value: energyData.renewable_electricity_percentage,
          dqiRequired: ["TeR", "TiR", "GR", "C", "PDS"],
        });
      }
    }

    // Add more data points from other sections as needed

    return points;
  };

  // Generate data points dynamically from supplier data
  const generateDataPoints = (): DataPoint[] => {
    if (!supplierData) {
      return getDefaultDataPoints();
    }
    const points = generateDataPointsFromData(supplierData);
    return points.length > 0 ? points : getDefaultDataPoints();
  };

  // Default data points fallback
  const getDefaultDataPoints = (): DataPoint[] => {
    return [
      {
        id: 6,
        name: "Material composition Weight",
        unit: "kg",
        category: "Material",
        value: "2000",
        dqiRequired: ["TeR", "TiR", "GR", "C", "PDS"],
      },
      {
        id: 7,
        name: "Material Emission Factor",
        unit: "kg CO₂e/kg",
        category: "Material",
        value: "0.85",
        dqiRequired: ["TeR", "TiR", "GR", "C", "PDS"],
      },
      {
        id: 16,
        name: "Electricity Energy consumed at Factory level",
        unit: "kWh",
        category: "Energy",
        value: "70000",
        dqiRequired: ["TeR", "TiR", "GR", "C", "PDS"],
      },
      {
        id: 21,
        name: "Production electricity energy use per unit",
        unit: "kWh/unit",
        category: "Energy",
        value: "0.5",
        dqiRequired: ["TeR", "TiR", "GR", "C", "PDS"],
      },
      {
        id: 22,
        name: "Emission Factor of electricity",
        unit: "kg CO₂e/kWh",
        category: "Energy",
        value: "0.4",
        dqiRequired: ["TeR", "TiR", "GR", "C", "PDS"],
      },
      {
        id: 26,
        name: "Material Box Weight",
        unit: "kg",
        category: "Packaging",
        value: "5",
        dqiRequired: ["TeR", "TiR", "C", "PDS"],
      },
      {
        id: 27,
        name: "Emission Factor Box",
        unit: "kg CO₂e/kg",
        category: "Packaging",
        value: "1.2",
        dqiRequired: ["TeR", "TiR", "GR", "C", "PDS"],
      },
      {
        id: 35,
        name: "Distance",
        unit: "km",
        category: "Transport",
        value: "500",
        dqiRequired: ["TeR", "TiR", "GR", "C", "PDS"],
      },
      {
        id: 36,
        name: "Transport Mode Emission Factor",
        unit: "kg CO₂e/t-km",
        category: "Transport",
        value: "0.062",
        dqiRequired: ["TeR", "TiR", "GR", "C", "PDS"],
      },
      {
        id: 39,
        name: "Waste generated per Box",
        unit: "kg",
        category: "Waste",
        value: "0.5",
        dqiRequired: ["TeR", "TiR", "C", "PDS"],
      },
    ];
  };

  // Data points that require DQI assessment
  const dataPoints = generateDataPoints();

  const handleDQIChange = (
    dataPointId: number,
    dqiType: string,
    level: string,
    value: string
  ) => {
    setDqiData((prev) => ({
      ...prev,
      [dataPointId]: {
        ...prev[dataPointId],
        [dqiType]: {
          ...prev[dataPointId]?.[dqiType],
          [level]: value,
        },
      },
    }));
  };

  // Transform UI data structure to API format
  const transformToAPIFormat = () => {
    // Use bom_pcf_id from URL if available, otherwise from supplierData
    const bom_pcf_id = bom_pcf_id_from_url || supplierData?.bom_pcf_id;

    if (!bom_pcf_id) {
      throw new Error("BOM PCF ID not found");
    }
    const ratings: any[] = [];
    const points = generateDataPoints();

    // Group data points by type
    points.forEach((point) => {
      const pointData = dqiData[point.id];
      if (!pointData) return;

      // Determine the type based on data point category and name
      let type = "dqr_raw_material_product_rating";
      if (point.name.includes("Recycled Material Content")) {
        type = "dqr_recycled_material_content_rating";
      } else if (point.name.includes("Electricity")) {
        type = "dqr_electricity_consumption_rating";
      } else if (point.name.includes("Renewable")) {
        type = "dqr_renewable_electricity_rating";
      }

      const rating: any = {
        sgiq_id: sgiq_id || "",
        // For raw materials, use mcm_id as data field (as per API response structure)
        // For other data points, use the value
        data: point.mcm_id || point.value,
      };

      // Map TeR
      if (pointData.TeR) {
        rating.ter_tag_type = pointData.TeR.level1 || "";
        rating.ter_tag_value = pointData.TeR.level2 || "";
        rating.ter_data_point = pointData.TeR.level2
          ? String(getDQRValue("TeR", pointData.TeR.level2) as number)
          : "";
      }

      // Map TiR
      if (pointData.TiR) {
        rating.tir_tag_type = pointData.TiR.level1 || "";
        rating.tir_tag_value = pointData.TiR.level2 || "";
        rating.tir_data_point = pointData.TiR.level2
          ? String(getDQRValue("TiR", pointData.TiR.level2) as number)
          : "";
      }

      // Map GR
      if (pointData.GR) {
        rating.gr_tag_type = pointData.GR.level1 || "";
        rating.gr_tag_value = pointData.GR.level2 || "";
        rating.gr_data_point = pointData.GR.level2
          ? String(getDQRValue("GR", pointData.GR.level2) as number)
          : "";
      }

      // Map C
      if (pointData.C) {
        rating.c_tag_type = pointData.C.classification || "";
        rating.c_tag_value = "";
        rating.c_data_point = "";
      }

      // Map PDS
      if (pointData.PDS) {
        rating.pds_tag_type = pointData.PDS.type || "";
        rating.pds_tag_value = "";
        rating.pds_data_point = "";
      }

      ratings.push(rating);
    });

    // Group ratings by type
    const groupedRatings: Record<string, any[]> = {};
    ratings.forEach((rating) => {
      // Determine type from data point
      // Match by mcm_id first (for raw materials), then by value
      const point = points.find(
        (p) => p.mcm_id === rating.data || p.value === rating.data
      );
      let type = "dqr_raw_material_product_rating";
      if (point) {
        if (point.name.includes("Recycled Material Content")) {
          type = "dqr_recycled_material_content_rating";
        } else if (point.name.includes("Electricity")) {
          type = "dqr_electricity_consumption_rating";
        } else if (point.name.includes("Renewable")) {
          type = "dqr_renewable_electricity_rating";
        }
      }

      if (!groupedRatings[type]) {
        groupedRatings[type] = [];
      }
      groupedRatings[type].push(rating);
    });

    return { bom_pcf_id, groupedRatings };
  };

  // Save DQR ratings
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const { bom_pcf_id, groupedRatings } = transformToAPIFormat();

      // Check if there are any ratings to save
      const hasRatings = Object.values(groupedRatings).some(
        (ratings) => ratings.length > 0
      );

      if (!hasRatings) {
        alert(
          "No DQR ratings to save. Please complete at least one data point assessment."
        );
        return;
      }

      // Save each type of rating
      const savePromises = Object.entries(groupedRatings)
        .filter(([_, ratings]) => ratings.length > 0)
        .map(([type, ratings]) =>
          supplierQuestionnaireService.saveDQRRating(bom_pcf_id, type, ratings)
        );

      const results = await Promise.all(savePromises);

      const allSuccess = results.every((result) => result.success);
      if (allSuccess) {
        alert("DQR ratings saved successfully!");
      } else {
        const errorMessages = results
          .filter((r) => !r.success)
          .map((r) => r.message)
          .join(", ");
        alert(`Some ratings failed to save: ${errorMessages}`);
      }
    } catch (error: any) {
      console.error("Error saving DQR ratings:", error);
      alert(error.message || "Failed to save DQR ratings");
    } finally {
      setIsSaving(false);
    }
  };

  const getDQRValue = (
    dqiType: string,
    level2Value: string
  ): number | string => {
    const dqrMappings: Record<string, Record<string, number | string>> = {
      TeR: {
        "Site specific technology": 1,
        "Similar process technology": 2,
        "Industry average technology": 3,
        "Proxy process": 4,
        Mismatch: 5,
      },
      TiR: {
        "Data Period < 1 Year": 1,
        "1Y < Data Period < 3Y": 2,
        "3Y < Data Period < 5Y": 3,
        "5Y < Data Period < 10Y": 4,
        "Data Period > 10 Year": 5,
      },
      GR: {
        "Site Specific": 1,
        "Country Specific": 2,
        Regional: 3,
        Global: 4,
        Mismatch: 5,
      },
      PDS: {
        Primary: "Primary",
        Secondary: "Secondary",
        Proxy: "Proxy",
      },
    };

    const mapping = dqrMappings[dqiType];
    if (!mapping) return "-";

    const value = mapping[level2Value];
    return value !== undefined ? value : "-";
  };

  const getDQRColor = (dqr: number | string) => {
    const numericValue = typeof dqr === "number" ? dqr : parseInt(String(dqr));
    if (numericValue === 1)
      return "text-green-600 bg-green-50 border-green-200";
    if (numericValue === 2)
      return "text-green-600 bg-green-50 border-green-200";
    if (numericValue === 3)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (numericValue === 4)
      return "text-orange-600 bg-orange-50 border-orange-200";
    if (numericValue === 5) return "text-red-600 bg-red-50 border-red-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const calculateCompleteness = () => {
    const totalRequired = dataPoints.length * 3; // Assuming average 3 DQI per data point
    const completed = Object.values(dqiData).reduce((acc, point) => {
      return acc + Object.keys(point).length;
    }, 0);
    return Math.round((completed / totalRequired) * 100);
  };

  const DataPointCard = ({ dataPoint }: { dataPoint: DataPoint }) => {
    const isSelected = selectedDataPoint?.id === dataPoint.id;
    const pointData = dqiData[dataPoint.id] || {};
    const completedDQIs = Object.keys(pointData).length;
    const totalDQIs = dataPoint.dqiRequired.length;
    const isCompleted = completedDQIs === totalDQIs;

    return (
      <div
        onClick={() => setSelectedDataPoint(dataPoint)}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isSelected
            ? "border-green-500 bg-green-50 shadow-lg"
            : isCompleted
            ? "border-green-300 bg-green-50 hover:bg-green-100 hover:shadow-md"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4
              className={`font-semibold ${
                isCompleted ? "text-green-900" : "text-gray-900"
              }`}
            >
              {dataPoint.name}
            </h4>
            <p
              className={`text-sm ${
                isCompleted ? "text-green-700" : "text-gray-600"
              }`}
            >
              ID: {dataPoint.id} • {dataPoint.category}
            </p>
          </div>
          {isCompleted ? (
            <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-xs font-semibold text-green-700">
                Complete
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full">
              <AlertCircle className="text-orange-600" size={20} />
              <span className="text-xs font-semibold text-orange-700">
                Pending
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className={isCompleted ? "text-green-800" : "text-gray-700"}>
            <strong>Value:</strong> {dataPoint.value} {dataPoint.unit}
          </span>
          <span
            className={
              isCompleted ? "text-green-700 font-semibold" : "text-gray-600"
            }
          >
            {completedDQIs}/{totalDQIs} DQIs
          </span>
        </div>
      </div>
    );
  };

  const DQIAssessmentPanel = ({
    dataPoint,
  }: {
    dataPoint: DataPoint | null;
  }) => {
    if (!dataPoint) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Info size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Select a data point to begin assessment</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 text-white p-6 rounded-b-xl -mx-6 -mt-6 mb-6 shadow-lg sticky top-0 z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">{dataPoint.name}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                  ID: {dataPoint.id}
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                  {dataPoint.category}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-sm opacity-90 mb-1">Current Value</div>
            <div className="text-2xl font-bold">
              {dataPoint.value}{" "}
              <span className="text-lg font-normal">{dataPoint.unit}</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedDataPoint(null)}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-all hover:scale-110 absolute top-4 right-4"
          >
            <X size={24} />
          </button>
        </div>

        {/* Technological Representativeness (TeR) */}
        {dataPoint.dqiRequired.includes("TeR") && (
          <div className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow mt-12">
            <h4 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg flex items-center justify-center mr-2 shadow-lg">
                <Settings size={18} />
              </span>
              <div>
                <div className="font-bold">
                  Technological Representativeness
                </div>
                <div className="text-xs text-gray-500 font-normal">TeR</div>
              </div>
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Level-1 Classification <span className="text-red-500">*</span>
                </label>
                <select
                  value={dqiData[dataPoint.id]?.TeR?.level1 || ""}
                  onChange={(e) =>
                    handleDQIChange(
                      dataPoint.id,
                      "TeR",
                      "level1",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700 font-medium"
                >
                  <option value="">Select classification</option>
                  <option value="Applicable">Applicable</option>
                  <option value="Derived">Derived</option>
                  <option value="Not Applicable">Not Applicable</option>
                </select>
              </div>

              {dqiData[dataPoint.id]?.TeR?.level1 === "Applicable" && (
                <div className="animate-in slide-in-from-top-3 duration-300">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Level-2 Classification{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dqiData[dataPoint.id]?.TeR?.level2 || ""}
                    onChange={(e) =>
                      handleDQIChange(
                        dataPoint.id,
                        "TeR",
                        "level2",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700 font-medium"
                  >
                    <option value="">Select technology type</option>
                    {DQR_CONFIG.TER_LEVEL2_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  {dqiData[dataPoint.id]?.TeR?.level2 && (
                    <div
                      className={`mt-4 p-4 rounded-xl border-2 font-bold text-center shadow-sm ${getDQRColor(
                        getDQRValue(
                          "TeR",
                          dqiData[dataPoint.id]?.TeR?.level2 || ""
                        )
                      )}`}
                    >
                      <div className="text-sm text-gray-600 mb-1">
                        DQR Rating
                      </div>
                      <div className="text-2xl">
                        {getDQRValue(
                          "TeR",
                          dqiData[dataPoint.id]?.TeR?.level2 || ""
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Temporal Representativeness (TiR) */}
        {dataPoint.dqiRequired.includes("TiR") && (
          <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex items-center justify-center mr-2 shadow-lg">
                <Clock size={18} />
              </span>
              <div>
                <div className="font-bold">Temporal Representativeness</div>
                <div className="text-xs text-gray-500 font-normal">TiR</div>
              </div>
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Level-1 Classification <span className="text-red-500">*</span>
                </label>
                <select
                  value={dqiData[dataPoint.id]?.TiR?.level1 || ""}
                  onChange={(e) =>
                    handleDQIChange(
                      dataPoint.id,
                      "TiR",
                      "level1",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-700 font-medium"
                >
                  <option value="">Select classification</option>
                  {DQR_CONFIG.TIR_LEVEL1_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {dqiData[dataPoint.id]?.TiR?.level1 === "Applicable" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Level-2 Classification{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dqiData[dataPoint.id]?.TiR?.level2 || ""}
                    onChange={(e) =>
                      handleDQIChange(
                        dataPoint.id,
                        "TiR",
                        "level2",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-700 font-medium"
                  >
                    <option value="">Select data period</option>
                    {DQR_CONFIG.TIR_LEVEL2_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  {dqiData[dataPoint.id]?.TiR?.level2 && (
                    <div
                      className={`mt-4 p-4 rounded-xl border-2 font-bold text-center shadow-sm ${getDQRColor(
                        getDQRValue(
                          "TiR",
                          dqiData[dataPoint.id]?.TiR?.level2 || ""
                        )
                      )}`}
                    >
                      <div className="text-sm text-gray-600 mb-1">
                        DQR Rating
                      </div>
                      <div className="text-2xl">
                        {getDQRValue(
                          "TiR",
                          dqiData[dataPoint.id]?.TiR?.level2 || ""
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Geographical Representativeness (GR) */}
        {dataPoint.dqiRequired.includes("GR") && (
          <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex items-center justify-center mr-2 shadow-lg">
                <Globe size={18} />
              </span>
              <div>
                <div className="font-bold">Geographical Representativeness</div>
                <div className="text-xs text-gray-500 font-normal">GR</div>
              </div>
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Level-1 Classification <span className="text-red-500">*</span>
                </label>
                <select
                  value={dqiData[dataPoint.id]?.GR?.level1 || ""}
                  onChange={(e) =>
                    handleDQIChange(
                      dataPoint.id,
                      "GR",
                      "level1",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-700 font-medium"
                >
                  <option value="">Select classification</option>
                  <option value="Applicable">Applicable</option>
                  <option value="Derived">Derived</option>
                  <option value="Not Applicable">Not Applicable</option>
                </select>
              </div>

              {dqiData[dataPoint.id]?.GR?.level1 === "Applicable" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Level-2 Classification{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dqiData[dataPoint.id]?.GR?.level2 || ""}
                    onChange={(e) =>
                      handleDQIChange(
                        dataPoint.id,
                        "GR",
                        "level2",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-700 font-medium"
                  >
                    <option value="">Select geographical scope</option>
                    {DQR_CONFIG.GR_LEVEL2_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  {dqiData[dataPoint.id]?.GR?.level2 && (
                    <div
                      className={`mt-4 p-4 rounded-xl border-2 font-bold text-center shadow-sm ${getDQRColor(
                        getDQRValue(
                          "GR",
                          dqiData[dataPoint.id]?.GR?.level2 || ""
                        )
                      )}`}
                    >
                      <div className="text-sm text-gray-600 mb-1">
                        DQR Rating
                      </div>
                      <div className="text-2xl">
                        {getDQRValue(
                          "GR",
                          dqiData[dataPoint.id]?.GR?.level2 || ""
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Primary Data Share (PDS) */}
        {dataPoint.dqiRequired.includes("PDS") && (
          <div className="bg-gradient-to-br from-white to-orange-50 border-2 border-orange-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg flex items-center justify-center mr-2 shadow-lg">
                <Database size={18} />
              </span>
              <div>
                <div className="font-bold">Primary Data Share</div>
                <div className="text-xs text-gray-500 font-normal">PDS</div>
              </div>
            </h4>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Data Source Type <span className="text-red-500">*</span>
              </label>
              <select
                value={dqiData[dataPoint.id]?.PDS?.type || ""}
                onChange={(e) =>
                  handleDQIChange(dataPoint.id, "PDS", "type", e.target.value)
                }
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-700 font-medium"
              >
                <option value="">Select data source</option>
                {DQR_CONFIG.PDS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                    {option === "Primary" &&
                      " (Direct measurement/supplier data)"}
                    {option === "Secondary" && " (Database/literature)"}
                    {option === "Proxy" && " (Estimated/representative data)"}
                  </option>
                ))}
              </select>

              {dqiData[dataPoint.id]?.PDS?.type && (
                <div
                  className={`mt-4 p-4 rounded-xl border-2 font-semibold text-center shadow-sm ${
                    dqiData[dataPoint.id]?.PDS?.type === "Primary"
                      ? "bg-green-50 border-green-300 text-green-700"
                      : dqiData[dataPoint.id]?.PDS?.type === "Secondary"
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-gray-50 border-gray-300 text-gray-700"
                  }`}
                >
                  <div className="text-sm opacity-80 mb-1">Data Source</div>
                  <div className="text-lg">
                    {dqiData[dataPoint.id]?.PDS?.type}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completeness (C) */}
        {dataPoint.dqiRequired.includes("C") && (
          <div className="bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg flex items-center justify-center mr-2 shadow-lg">
                <Target size={18} />
              </span>
              <div>
                <div className="font-bold">Completeness</div>
                <div className="text-xs text-gray-500 font-normal">C</div>
              </div>
            </h4>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Data Point Classification{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={dqiData[dataPoint.id]?.C?.classification || ""}
                onChange={(e) =>
                  handleDQIChange(
                    dataPoint.id,
                    "C",
                    "classification",
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-700 font-medium"
              >
                <option value="">Select classification</option>
                {DQR_CONFIG.C_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              {dqiData[dataPoint.id]?.C?.classification === "Required" && (
                <div className="mt-4 p-4 rounded-xl border-2 bg-green-50 border-green-300 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Target size={20} className="text-green-600" />
                    <span className="font-semibold text-green-800">
                      This data point is Required for PCF calculation
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // const completeness = calculateCompleteness();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={48}
            className="animate-spin text-green-500 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading supplier data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/supplier-questionnaire")}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg font-medium transition-all"
          >
            Go Back to Questionnaire
          </button>
        </div>
      </div>
    );
  }

  const completeness = calculateCompleteness();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6">
      <div className="">
        {/* Header with back button */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Questionnaire ID: {sgiq_id}
              </span>
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Data Quality Assessment
              </h1>
              <p className="text-gray-600">
                Evaluate data quality indicators for Product Carbon Footprint
                calculation
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Progress</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Data Quality Assessment
              </h1>
              <p className="text-gray-600">
                Evaluate data quality indicators for Product Carbon Footprint
                calculation
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Save size={18} />
                <span>Save Progress</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download size={18} />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div> */}

        {/* Main Content - Data Points List (Full Width) */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Data Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataPoints.map((point) => (
              <DataPointCard key={point.id} dataPoint={point} />
            ))}
          </div>
        </div>

        {/* Right Side Panel - DQI Assessment */}
        <div
          className={`fixed top-0 right-0 h-full w-full md:w-[35%]  bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
            selectedDataPoint ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Panel Header */}

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-0">
              <DQIAssessmentPanel dataPoint={selectedDataPoint} />
            </div>
          </div>
        </div>

        {/* Overlay */}
        {selectedDataPoint && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setSelectedDataPoint(null)}
          />
        )}

        {/* DQI Legend */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Data Quality Rating (DQR) Scale
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">1</div>
              <div className="text-sm text-gray-700">Excellent</div>
              <div className="text-xs text-gray-600 mt-1">
                Site-specific / &lt;1 Year / Primary &gt;95%
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">2</div>
              <div className="text-sm text-gray-700">Good</div>
              <div className="text-xs text-gray-600 mt-1">
                Similar process / 1-3 Years / PDS 70-89%
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">3</div>
              <div className="text-sm text-gray-700">Fair</div>
              <div className="text-xs text-gray-600 mt-1">
                Industry average / 3-5 Years / PDS 50-69%
              </div>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">4</div>
              <div className="text-sm text-gray-700">Poor</div>
              <div className="text-xs text-gray-600 mt-1">
                Proxy / 5-10 Years / PDS 30-49%
              </div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-1">5</div>
              <div className="text-sm text-gray-700">Very Poor</div>
              <div className="text-xs text-gray-600 mt-1">
                Mismatch / &gt;10 Years / PDS &lt;29%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataQualityRating;
