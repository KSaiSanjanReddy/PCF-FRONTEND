import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  Building2,
  Wrench,
  Zap,
  Package,
  Truck,
  Recycle,
  RotateCw,
  BarChart3,
  Award,
  FileText,
  HelpCircle,
  Loader,
  CheckCircle,
  ArrowLeft,
  Eye,
  Edit,
} from "lucide-react";
import supplierQuestionnaireService from "../lib/supplierQuestionnaireService";
import authService from "../lib/authService";
// import { QUESTIONNAIRE_SECTIONS, GDPR_MESSAGE } from "../config/questionnaireConfig";

const SupplierQuestionnaire: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get sgiq_id from search params, with fallback to parsing URL directly
  let sgiq_id = searchParams.get("sgiq_id");
  if (!sgiq_id && location.search) {
    // Fallback: parse URL search string directly
    const urlParams = new URLSearchParams(location.search);
    sgiq_id = urlParams.get("sgiq_id");
  }

  // Get user_id from search params, with fallback to parsing URL directly
  let user_id = searchParams.get("user_id");
  if (!user_id && location.search) {
    // Fallback: parse URL search string directly
    const urlParams = new URLSearchParams(location.search);
    user_id = urlParams.get("user_id");
  }

  // Debug logging
  useEffect(() => {
    console.log("SupplierQuestionnaire - URL params:", {
      pathname: location.pathname,
      search: location.search,
      sgiq_id: sgiq_id,
      user_id: user_id,
      allParams: Object.fromEntries(searchParams.entries()),
      searchParamsGet: searchParams.get("sgiq_id"),
    });
  }, [location.pathname, location.search, sgiq_id, user_id, searchParams]);

  // Determine mode based on route
  const isViewMode = location.pathname.includes("/view");
  const isEditMode = location.pathname.includes("/edit");
  const isCreateMode = location.pathname.includes("/new");

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(
    sgiq_id
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const steps = [
    { id: "general", title: "General Information", Icon: Building2 },
    { id: "material", title: "Material Composition", Icon: Wrench },
    { id: "energy", title: "Energy & Manufacturing", Icon: Zap },
    { id: "packaging", title: "Packaging", Icon: Package },
    { id: "transport", title: "Transportation & Logistics", Icon: Truck },
    { id: "waste", title: "Waste & By-products", Icon: Recycle },
    { id: "endOfLife", title: "End-of-Life & Circularity", Icon: RotateCw },
    { id: "emissions", title: "Emission Factors / LCA Data", Icon: BarChart3 },
    { id: "certifications", title: "Certifications & Standards", Icon: Award },
    { id: "additional", title: "Additional Notes", Icon: FileText },
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addListItem = (field: string) => {
    const current = (formData[field] as string[]) || [];
    setFormData((prev) => ({
      ...prev,
      [field]: [...current, ""],
    }));
  };

  const updateListItem = (field: string, index: number, value: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = [...(current as string[])];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      [field]: updated,
    }));
  };

  const removeListItem = (field: string, index: number) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.filter((_: string, i: number) => i !== index);
    setFormData((prev) => ({
      ...prev,
      [field]: updated,
    }));
  };

  // Load data on mount - either from API or draft
  useEffect(() => {
    const loadData = async () => {
      // If viewing or editing existing questionnaire, load from API
      if ((isViewMode || isEditMode) && sgiq_id) {
        setIsLoading(true);
        setLoadError(null);

        try {
          // Use user_id from URL params if available, otherwise get from authenticated user
          let userIdToUse = user_id;
          if (!userIdToUse) {
            const user = authService.getCurrentUser();
            if (!user || !user.id) {
              setLoadError("User not authenticated");
              return;
            }
            userIdToUse = user.id;
          }

          // Validate sgiq_id before making API call
          if (!sgiq_id || sgiq_id.trim() === "") {
            setLoadError("Questionnaire ID is missing");
            setIsLoading(false);
            return;
          }

          console.log(
            "Fetching questionnaire with sgiq_id:",
            sgiq_id,
            "user_id:",
            userIdToUse
          );

          const result =
            await supplierQuestionnaireService.getQuestionnaireById(
              sgiq_id,
              userIdToUse
            );

          if (result.success && result.data) {
            // Map API data to form data - pass the entire data object
            populateFormFromAPI(result.data);
          } else {
            setLoadError(result.message || "Failed to load questionnaire");
          }
        } catch (error) {
          console.error("Error loading questionnaire:", error);
          setLoadError("An error occurred while loading the questionnaire");
        } finally {
          setIsLoading(false);
        }
      } else if (isCreateMode) {
        // Load draft for new questionnaire
        const draft = supplierQuestionnaireService.loadDraft();
        if (draft) {
          setFormData(draft.formData);
          setCurrentStep(draft.currentStep);
        }
      }
    };

    loadData();
  }, [sgiq_id, user_id, isViewMode, isEditMode, isCreateMode]);

  // Map API response to form data
  const populateFormFromAPI = (apiData: any) => {
    const mappedData: Record<string, any> = {};

    // General Information - access directly from supplier_general_info_questions
    const generalInfo = apiData.supplier_general_info_questions || {};
    if (generalInfo.name_of_organization)
      mappedData.orgName = generalInfo.name_of_organization;
    if (generalInfo.core_business_activities) {
      // Handle array - take first item or use array
      mappedData.businessActivity = Array.isArray(
        generalInfo.core_business_activities
      )
        ? generalInfo.core_business_activities[0] ||
          generalInfo.core_business_activities
        : generalInfo.core_business_activities;
    }
    if (generalInfo.company_site_address)
      mappedData.siteAddress = generalInfo.company_site_address;
    if (generalInfo.designation)
      mappedData.designation = generalInfo.designation;
    if (generalInfo.email_address) mappedData.email = generalInfo.email_address;
    if (generalInfo.type_of_product_manufacture)
      mappedData.productTypes = generalInfo.type_of_product_manufacture;
    if (generalInfo.annul_or_monthly_product_volume_of_product?.length > 0) {
      mappedData.productionVolume =
        generalInfo.annul_or_monthly_product_volume_of_product[0];
    }
    if (generalInfo.weight_of_product)
      mappedData.productWeight = generalInfo.weight_of_product;
    if (generalInfo.where_production_site_product_manufactured) {
      mappedData.productionSite =
        generalInfo.where_production_site_product_manufactured;
    }
    if (generalInfo.price_of_product)
      mappedData.productPrice = generalInfo.price_of_product;
    if (generalInfo.organization_annual_revenue)
      mappedData.annualRevenue = generalInfo.organization_annual_revenue;
    if (generalInfo.organization_annual_reporting_period) {
      mappedData.reportingPeriod =
        generalInfo.organization_annual_reporting_period;
    }
    if (generalInfo.sgiq_id) {
      setQuestionnaireId(generalInfo.sgiq_id);
    }

    // Material Composition - access directly (object, not array)
    const materialData = apiData.material_composition_questions;
    if (materialData) {
      // Handle main_raw_materials_used - it's an array of objects with mcm_id, mcmt_id
      if (materialData.main_raw_materials_used) {
        // Extract IDs or names from the objects
        const rawMaterials = materialData.main_raw_materials_used.map(
          (item: any) => {
            if (typeof item === "string") return item;
            // If it's an object, try to get the name or id
            return (
              item.mcm_details?.name ||
              item.mcmt_details?.name ||
              item.mcm_id ||
              item.mcmt_id ||
              item
            );
          }
        );
        mappedData.rawMaterials = rawMaterials;
      }
      mappedData.hasRecycledMaterial = materialData.has_recycled_material_usage
        ? "yes"
        : "no";
      if (materialData.percentage_recycled_material) {
        mappedData.recycledMaterialPercent = String(
          materialData.percentage_recycled_material
        );
      }
      mappedData.canEstimateRecycledTypes =
        materialData.knows_material_breakdown ? "yes" : "no";
      if (materialData.percentage_pre_consumer)
        mappedData.preConsumerPercent = String(
          materialData.percentage_pre_consumer
        );
      if (materialData.percentage_post_consumer)
        mappedData.postConsumerPercent = String(
          materialData.percentage_post_consumer
        );
      if (materialData.percentage_reutilization)
        mappedData.reutilizationPercent = String(
          materialData.percentage_reutilization
        );
      mappedData.hasRecycledCopper = materialData.has_recycled_copper
        ? "yes"
        : "no";
      if (materialData.percentage_recycled_copper)
        mappedData.recycledCopperPercent = String(
          materialData.percentage_recycled_copper
        );
      mappedData.hasRecycledAluminum = materialData.has_recycled_aluminum
        ? "yes"
        : "no";
      if (materialData.percentage_recycled_aluminum) {
        mappedData.recycledAluminumPercent = String(
          materialData.percentage_recycled_aluminum
        );
      }
      mappedData.hasRecycledSteel = materialData.has_recycled_steel
        ? "yes"
        : "no";
      if (materialData.percentage_recycled_steel)
        mappedData.recycledSteelPercent = String(
          materialData.percentage_recycled_steel
        );
      mappedData.hasRecycledPlastics = materialData.has_recycled_plastics
        ? "yes"
        : "no";
      if (materialData.percentage_total_recycled_plastics)
        mappedData.recycledPlasticsPercent = String(
          materialData.percentage_total_recycled_plastics
        );
      if (materialData.percentage_recycled_thermoplastics)
        mappedData.recycledThermoplasticsPercent = String(
          materialData.percentage_recycled_thermoplastics
        );
      if (materialData.percentage_recycled_plastic_fillers)
        mappedData.recycledFillerPercent = String(
          materialData.percentage_recycled_plastic_fillers
        );
      if (materialData.percentage_recycled_fibers)
        mappedData.recycledFiberPercent = String(
          materialData.percentage_recycled_fibers
        );
      mappedData.hasRecyclingProgram = materialData.has_recycling_process
        ? "yes"
        : "no";
      mappedData.hasFutureRecyclingStrategy =
        materialData.has_future_recycling_strategy ? "yes" : "no";
      if (materialData.planned_recycling_year)
        mappedData.recyclingImplementationYear = String(
          materialData.planned_recycling_year
        );
      mappedData.trackTransportEmissions =
        materialData.track_transport_emissions ? "yes" : "no";
      if (materialData.estimated_transport_emissions)
        mappedData.transportEmissions =
          materialData.estimated_transport_emissions;
      mappedData.needsEmissionsHelp =
        materialData.need_support_for_emissions_calc ? "yes" : "no";
      if (materialData.emission_calc_requirement)
        mappedData.emissionsHelpDetails =
          materialData.emission_calc_requirement;
      if (materialData.percentage_pcr)
        mappedData.pcrPercent = String(materialData.percentage_pcr);
      if (materialData.percentage_pir)
        mappedData.pirPercent = String(materialData.percentage_pir);
      mappedData.hasBioBasedMaterials = materialData.use_bio_based_materials
        ? "yes"
        : "no";
      if (materialData.bio_based_material_details) {
        // Split comma-separated string into array
        mappedData.bioBasedMaterials = materialData.bio_based_material_details
          .split(",")
          .map((s: string) => s.trim());
      }
      if (materialData.msds_or_composition_link)
        mappedData.msdsLink = materialData.msds_or_composition_link;
      if (materialData.main_alloy_metals)
        mappedData.alloyMetals = materialData.main_alloy_metals;
      if (materialData.metal_grade)
        mappedData.metalGrade = materialData.metal_grade;
    }

    // Energy & Manufacturing - access first item from array
    const energyData = Array.isArray(apiData.energy_manufacturing_questions)
      ? apiData.energy_manufacturing_questions[0]
      : apiData.energy_manufacturing_questions;
    if (energyData) {
      if (energyData.energy_sources_used)
        mappedData.energySources = energyData.energy_sources_used;
      if (energyData.electricity_consumption_per_year) {
        mappedData.electricityConsumption =
          energyData.electricity_consumption_per_year;
      }
      mappedData.purchasesRenewable = energyData.purchases_renewable_electricity
        ? "yes"
        : "no";
      if (energyData.renewable_electricity_percentage) {
        mappedData.renewablePercent = [
          String(energyData.renewable_electricity_percentage),
        ];
      }
      mappedData.hasEnergyMethodology = energyData.has_energy_calculation_method
        ? "yes"
        : "no";
      if (energyData.energy_calculation_method_details)
        mappedData.energyMethodologyDoc =
          energyData.energy_calculation_method_details;
      if (energyData.energy_intensity_per_unit)
        mappedData.energyIntensity = energyData.energy_intensity_per_unit;
      if (energyData.process_specific_energy_usage) {
        mappedData.processEnergyUsage =
          energyData.process_specific_energy_usage;
      }
      mappedData.hasAbatementSystems = energyData.uses_abatement_systems
        ? "yes"
        : "no";
      if (energyData.abatement_system_energy_consumption) {
        // Split comma-separated string into array
        mappedData.abatementEnergy =
          energyData.abatement_system_energy_consumption
            .split(",")
            .map((s: string) => s.trim());
      }
      if (energyData.water_consumption_and_treatment_details) {
        mappedData.waterConsumption =
          energyData.water_consumption_and_treatment_details;
      }
    }

    // Packaging - access first item from array
    const packagingData = Array.isArray(apiData.packaging_questions)
      ? apiData.packaging_questions[0]
      : apiData.packaging_questions;
    if (packagingData) {
      if (packagingData.packaging_materials_used)
        mappedData.packagingMaterials = packagingData.packaging_materials_used;
      if (packagingData.packaging_weight_per_unit)
        mappedData.packagingWeight = packagingData.packaging_weight_per_unit;
      if (packagingData.packaging_size)
        mappedData.packagingSize = packagingData.packaging_size;
      mappedData.hasRecycledPackaging = packagingData.uses_recycled_packaging
        ? "yes"
        : "no";
      if (packagingData.recycled_packaging_percentage)
        mappedData.recycledPackagingPercent =
          packagingData.recycled_packaging_percentage;
    }

    // Transportation - access directly (object, not array)
    const transportData = apiData.transportation_logistics_questions;
    if (transportData) {
      // Handle transport_modes_used - it's an array of IDs
      // If there are details, we can map IDs to names, otherwise use IDs directly
      if (transportData.transport_modes_used) {
        // Use IDs directly - the form will match them with options
        mappedData.transportModes = transportData.transport_modes_used;
      }
      mappedData.hasCertifiedLogistics =
        transportData.uses_certified_logistics_provider ? "yes" : "no";
      if (transportData.logistics_provider_details)
        mappedData.logisticsDetails = transportData.logistics_provider_details;
    }

    // Waste & By-products - access first item from array
    const wasteData = Array.isArray(apiData.waste_by_products_questions)
      ? apiData.waste_by_products_questions[0]
      : apiData.waste_by_products_questions;
    if (wasteData) {
      if (wasteData.waste_types_generated)
        mappedData.wasteTypes = wasteData.waste_types_generated;
      if (wasteData.waste_treatment_methods)
        mappedData.wasteTreatment = wasteData.waste_treatment_methods;
      if (wasteData.recycling_percentage)
        mappedData.wasteRecycledPercent = String(
          wasteData.recycling_percentage
        );
      mappedData.hasByProducts = wasteData.has_byproducts ? "yes" : "no";
      if (wasteData.byproduct_types)
        mappedData.byProductTypes = wasteData.byproduct_types;
      if (wasteData.byproduct_quantity)
        mappedData.byProductQuantity = wasteData.byproduct_quantity;
      if (wasteData.byproduct_price)
        mappedData.byProductPrice = wasteData.byproduct_price;
    }

    // End-of-Life & Circularity - access first item from array
    const eolData = Array.isArray(apiData.end_of_life_circularity_questions)
      ? apiData.end_of_life_circularity_questions[0]
      : apiData.end_of_life_circularity_questions;
    if (eolData) {
      mappedData.designedForCircularity = eolData.product_designed_for_recycling
        ? "yes"
        : "no";
      if (eolData.product_recycling_details)
        mappedData.circularityDetails = eolData.product_recycling_details;
      mappedData.hasTakeBackProgram = eolData.has_takeback_program
        ? "yes"
        : "no";
      if (eolData.takeback_program_details)
        mappedData.takeBackDetails = eolData.takeback_program_details;
    }

    // Emissions - access first item from array
    const emissionsData = Array.isArray(
      apiData.emission_factors_or_lca_data_questions
    )
      ? apiData.emission_factors_or_lca_data_questions[0]
      : apiData.emission_factors_or_lca_data_questions;
    if (emissionsData) {
      mappedData.reportsPCF = emissionsData.reports_product_carbon_footprint
        ? "yes"
        : "no";
      if (emissionsData.pcf_methodologies_used)
        mappedData.pcfMethodology = emissionsData.pcf_methodologies_used;
      mappedData.hasScopeEmissions = emissionsData.has_scope_emission_data
        ? "yes"
        : "no";
      if (emissionsData.emission_data_details)
        mappedData.scopeEmissionsData = emissionsData.emission_data_details;
      if (emissionsData.required_environmental_impact_methods)
        mappedData.impactMethods =
          emissionsData.required_environmental_impact_methods;
    }

    // Certifications - access first item from array
    const certData = Array.isArray(
      apiData.certification_and_standards_questions
    )
      ? apiData.certification_and_standards_questions[0]
      : apiData.certification_and_standards_questions;
    if (certData) {
      mappedData.hasISOCertification =
        certData.certified_iso_environmental_or_energy ? "yes" : "no";
      mappedData.followsStandards = certData.follows_recognized_standards
        ? "yes"
        : "no";
      mappedData.reportsESG = certData.reports_to_esg_frameworks ? "yes" : "no";
      if (certData.previous_reports)
        mappedData.certificationReports = certData.previous_reports;
    }

    // Additional Notes - access first item from array
    const notesData = Array.isArray(apiData.additional_notes_questions)
      ? apiData.additional_notes_questions[0]
      : apiData.additional_notes_questions;
    if (notesData) {
      if (notesData.carbon_reduction_measures)
        mappedData.carbonReductionMeasures =
          notesData.carbon_reduction_measures;
      if (notesData.renewable_energy_or_recycling_programs) {
        mappedData.renewableInitiatives =
          notesData.renewable_energy_or_recycling_programs;
      }
      mappedData.willingToShareData = notesData.willing_to_provide_primary_data
        ? "yes"
        : "no";
      if (notesData.primary_data_details)
        mappedData.primaryData = notesData.primary_data_details;
    }

    setFormData(mappedData);
  };

  // Auto-save draft on form data change (only for create mode)
  useEffect(() => {
    if (isCreateMode && Object.keys(formData).length > 0) {
      const timeoutId = setTimeout(() => {
        supplierQuestionnaireService.saveDraft(formData, currentStep);
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, currentStep, isCreateMode]);

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      supplierQuestionnaireService.saveDraft(formData, currentStep);
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("Draft saved successfully!");
    } catch (error) {
      alert("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    // Validation for Step 0: General Information
    if (currentStep === 0) {
      if (!formData.orgName)
        newErrors.orgName = "Organization name is required";
      if (!formData.siteAddress)
        newErrors.siteAddress = "Company site address is required";
      if (!formData.email) newErrors.email = "Email address is required";
      if (!formData.designation)
        newErrors.designation = "Designation is required";
      if (!formData.businessActivity)
        newErrors.businessActivity = "Business activity is required";
      if (!formData.annualRevenue)
        newErrors.annualRevenue = "Annual revenue is required";
    }

    // Validation for Step 1: Material Composition
    if (currentStep === 1) {
      if (!formData.rawMaterials || formData.rawMaterials.length === 0) {
        newErrors.rawMaterials = "At least one raw material is required";
      }
    }

    // Add more validation rules as needed for other steps

    return newErrors;
  };

  const buildAPIPayload = () => {
    const user = authService.getCurrentUser();

    return {
      bom_pcf_id: formData.bom_pcf_id || "",
      general_info: {
        name_of_organization: formData.orgName || "",
        core_business_activities: Array.isArray(formData.businessActivity)
          ? formData.businessActivity
          : [formData.businessActivity || ""],
        company_site_address: formData.siteAddress || "",
        designation: formData.designation || "",
        email_address: formData.email || "",
        type_of_product_manufacture: formData.productTypes || [],
        annul_or_monthly_product_volume_of_product: formData.productionVolume
          ? [formData.productionVolume]
          : [],
        weight_of_product: formData.productWeight || "",
        where_production_site_product_manufactured:
          formData.productionSite || "",
        price_of_product: formData.productPrice || "",
        organization_annual_revenue: formData.annualRevenue || "",
        organization_annual_reporting_period: formData.reportingPeriod || "",
      },
      material_composition: {
        main_raw_materials_used: formData.rawMaterials || [],
        contact_enviguide_support: formData.contactEnviguideSupport === "yes",
        has_recycled_material_usage: formData.hasRecycledMaterial === "yes",
        percentage_recycled_material:
          parseFloat(formData.recycledMaterialPercent) || 0,
        knows_material_breakdown: formData.canEstimateRecycledTypes === "yes",
        percentage_pre_consumer: parseFloat(formData.preConsumerPercent) || 0,
        percentage_post_consumer: parseFloat(formData.postConsumerPercent) || 0,
        percentage_reutilization:
          parseFloat(formData.reutilizationPercent) || 0,
        has_recycled_copper: formData.hasRecycledCopper === "yes",
        percentage_recycled_copper:
          parseFloat(formData.recycledCopperPercent) || 0,
        has_recycled_aluminum: formData.hasRecycledAluminum === "yes",
        percentage_recycled_aluminum:
          parseFloat(formData.recycledAluminumPercent) || 0,
        has_recycled_steel: formData.hasRecycledSteel === "yes",
        percentage_recycled_steel:
          parseFloat(formData.recycledSteelPercent) || 0,
        has_recycled_plastics: formData.hasRecycledPlastics === "yes",
        percentage_total_recycled_plastics:
          parseFloat(formData.recycledPlasticsPercent) || 0,
        percentage_recycled_thermoplastics:
          parseFloat(formData.recycledThermoplasticsPercent) || 0,
        percentage_recycled_plastic_fillers:
          parseFloat(formData.recycledFillerPercent) || 0,
        percentage_recycled_fibers:
          parseFloat(formData.recycledFiberPercent) || 0,
        has_recycling_process: formData.hasRecyclingProgram === "yes",
        has_future_recycling_strategy:
          formData.hasFutureRecyclingStrategy === "yes",
        planned_recycling_year:
          parseInt(formData.recyclingImplementationYear) || 0,
        track_transport_emissions: formData.trackTransportEmissions === "yes",
        estimated_transport_emissions: formData.transportEmissions || "",
        need_support_for_emissions_calc: formData.needsEmissionsHelp === "yes",
        emission_calc_requirement: formData.emissionsHelpDetails || "",
        percentage_pcr: parseFloat(formData.pcrPercent) || 0,
        percentage_pir: parseFloat(formData.pirPercent) || 0,
        use_bio_based_materials: formData.hasBioBasedMaterials === "yes",
        bio_based_material_details: Array.isArray(formData.bioBasedMaterials)
          ? formData.bioBasedMaterials.join(",")
          : "",
        msds_or_composition_link: formData.msdsLink || "",
        main_alloy_metals: formData.alloyMetals || "",
        metal_grade: formData.metalGrade || "",
      },
      energy_manufacturing: {
        energy_sources_used: formData.energySources || [],
        electricity_consumption_per_year: formData.electricityConsumption || "",
        purchases_renewable_electricity: formData.purchasesRenewable === "yes",
        renewable_electricity_percentage: parseFloat(
          Array.isArray(formData.renewablePercent) &&
            formData.renewablePercent.length > 0
            ? formData.renewablePercent[0]
            : formData.renewablePercent || "0"
        ),
        has_energy_calculation_method: formData.hasEnergyMethodology === "yes",
        energy_calculation_method_details: formData.energyMethodologyDoc || "",
        energy_intensity_per_unit: formData.energyIntensity || "",
        process_specific_energy_usage: formData.processEnergyUsage || [],
        enviguide_support: false,
        uses_abatement_systems: formData.hasAbatementSystems === "yes",
        abatement_system_energy_consumption: Array.isArray(
          formData.abatementEnergy
        )
          ? formData.abatementEnergy.join(",")
          : "",
        water_consumption_and_treatment_details:
          formData.waterConsumption || "",
      },
      packaging: {
        packaging_materials_used: formData.packagingMaterials || [],
        enviguide_support: false,
        packaging_weight_per_unit: formData.packagingWeight || "",
        packaging_size: formData.packagingSize || [],
        uses_recycled_packaging: formData.hasRecycledPackaging === "yes",
        recycled_packaging_percentage: formData.recycledPackagingPercent || [],
      },
      transportation_logistics: {
        transport_modes_used: formData.transportModes || [],
        enviguide_support: false,
        uses_certified_logistics_provider:
          formData.hasCertifiedLogistics === "yes",
        logistics_provider_details: formData.logisticsDetails || [],
      },
      waste_by_products: {
        waste_types_generated: formData.wasteTypes || [],
        waste_treatment_methods: formData.wasteTreatment || [],
        recycling_percentage: parseFloat(formData.wasteRecycledPercent) || 0,
        has_byproducts: formData.hasByProducts === "yes",
        byproduct_types: formData.byProductTypes || [],
        byproduct_quantity: formData.byProductQuantity || "",
        byproduct_price: formData.byProductPrice || [],
      },
      end_of_life_circularity: {
        product_designed_for_recycling:
          formData.designedForCircularity === "yes",
        product_recycling_details: formData.circularityDetails || [],
        has_takeback_program: formData.hasTakeBackProgram === "yes",
        takeback_program_details: formData.takeBackDetails || [],
      },
      emission_factors: {
        reports_product_carbon_footprint: formData.reportsPCF === "yes",
        pcf_methodologies_used: formData.pcfMethodology || [],
        has_scope_emission_data: formData.hasScopeEmissions === "yes",
        emission_data_details: formData.scopeEmissionsData || [],
        required_environmental_impact_methods: formData.impactMethods || [],
      },
      certification_standards: {
        certified_iso_environmental_or_energy:
          formData.hasISOCertification === "yes",
        follows_recognized_standards: formData.followsStandards === "yes",
        reports_to_esg_frameworks: formData.reportsESG === "yes",
        previous_reports: formData.certificationReports || [],
      },
      additional_notes: {
        carbon_reduction_measures: formData.carbonReductionMeasures || "",
        renewable_energy_or_recycling_programs:
          formData.renewableInitiatives || "",
        willing_to_provide_primary_data: formData.willingToShareData === "yes",
        primary_data_details: formData.primaryData || [],
      },
    };
  };

  const handleSubmit = async () => {
    // Validate all required fields
    const stepErrors = validateCurrentStep();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildAPIPayload();

      let result;
      if (questionnaireId) {
        // Update existing questionnaire
        result = await supplierQuestionnaireService.updateQuestionnaire(
          questionnaireId,
          payload
        );
      } else {
        // Create new questionnaire
        result = await supplierQuestionnaireService.createQuestionnaire(
          payload
        );
      }

      if (result.success) {
        // Clear draft
        supplierQuestionnaireService.clearDraft();

        // Save questionnaire ID for navigation to DQR
        const sgiq_id =
          result.data?.general_info?.sgiq_id || result.data?.sgiq_id;
        setQuestionnaireId(sgiq_id);

        // Show success modal
        setShowSuccessModal(true);
      } else {
        alert(`Failed to submit questionnaire: ${result.message}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("An error occurred while submitting the questionnaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    const stepErrors = validateCurrentStep();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setErrors({});
    }
  };

  const goToStep = (index: number) => {
    if (index <= currentStep || index === currentStep + 1) {
      setCurrentStep(index);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const Section = ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title?: string;
  }) => (
    <div className="mb-8 last:mb-0">
      {title && (
        <div className="mb-4 pb-2 border-b-2 border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </div>
  );

  const TextInput = ({
    label,
    field,
    required,
    type = "text",
    placeholder,
    helperText,
  }: {
    label: string;
    field: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
    helperText?: string;
  }) => (
    <div className="group">
      <div className="flex items-center gap-2 mb-2.5">
        <label className="block text-base font-semibold text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {helperText && (
          <div className="relative group/tooltip">
            <HelpCircle
              size={16}
              className="text-gray-400 hover:text-green-500 transition-colors cursor-help"
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
              {helperText}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>
      <input
        type={type}
        value={String(formData[field] || "")}
        onChange={(e) => {
          handleInputChange(field, e.target.value);
          if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
          }
        }}
        placeholder={placeholder}
        disabled={isViewMode}
        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-lg transition-all text-gray-700 placeholder-gray-400 ${
          errors[field]
            ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white"
        } ${isViewMode ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
      />
      {errors[field] && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          {errors[field]}
        </p>
      )}
    </div>
  );

  const RadioGroup = ({
    label,
    field,
    options,
    required,
  }: {
    label: string;
    field: string;
    options: string[];
    required?: boolean;
  }) => (
    <div>
      <label className="block text-base font-semibold text-gray-900 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2.5">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center space-x-3 p-3.5 bg-gray-50 border-2 border-gray-200 rounded-lg transition-all ${
              isViewMode
                ? "cursor-not-allowed opacity-70"
                : "hover:bg-white hover:border-[#6366f1] hover:shadow-sm cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name={field}
              value={option}
              checked={formData[field] === option}
              onChange={(e) => handleInputChange(field, e.target.value)}
              disabled={isViewMode}
              className="text-green-500 focus:ring-green-500 w-4 h-4"
            />
            <span className="text-sm text-gray-700 font-medium">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const YesNoRadio = ({
    label,
    field,
    required,
  }: {
    label: string;
    field: string;
    required?: boolean;
  }) => (
    <div>
      <label className="block text-base font-semibold text-gray-900 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex space-x-3">
        <label
          className={`flex items-center space-x-3 px-6 py-3 border-2 rounded-xl transition-all ${
            formData[field] === "yes"
              ? "bg-green-500/5 border-green-500 shadow-sm"
              : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
          } ${isViewMode ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
        >
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              name={field}
              value="yes"
              checked={formData[field] === "yes"}
              onChange={(e) => handleInputChange(field, e.target.value)}
              disabled={isViewMode}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                formData[field] === "yes"
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            >
              {formData[field] === "yes" && (
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              )}
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">Yes</span>
        </label>
        <label
          className={`flex items-center space-x-3 px-6 py-3 border-2 rounded-xl transition-all ${
            formData[field] === "no"
              ? "bg-green-500/5 border-green-500 shadow-sm"
              : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
          } ${isViewMode ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
        >
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              name={field}
              value="no"
              checked={formData[field] === "no"}
              onChange={(e) => handleInputChange(field, e.target.value)}
              disabled={isViewMode}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                formData[field] === "no"
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            >
              {formData[field] === "no" && (
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              )}
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">No</span>
        </label>
      </div>
    </div>
  );

  const CheckboxGroup = ({
    label,
    field,
    options,
    required,
  }: {
    label: string;
    field: string;
    options: string[];
    required?: boolean;
  }) => (
    <div>
      <label className="block text-base font-semibold text-gray-900 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2.5">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center space-x-3 p-3.5 bg-gray-50 border-2 border-gray-200 rounded-lg transition-all ${
              isViewMode
                ? "cursor-not-allowed opacity-70"
                : "hover:bg-white hover:border-green-500 hover:shadow-sm cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              checked={(formData[field] || []).includes(option)}
              onChange={(e) => {
                const current = formData[field] || [];
                if (e.target.checked) {
                  handleInputChange(field, [...current, option]);
                } else {
                  handleInputChange(
                    field,
                    (current as string[]).filter((v: string) => v !== option)
                  );
                }
              }}
              disabled={isViewMode}
              className="text-green-500 focus:ring-green-500 rounded w-4 h-4"
            />
            <span className="text-sm text-gray-700 font-medium">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const DynamicList = ({
    label,
    field,
    placeholder,
  }: {
    label: string;
    field: string;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-base font-semibold text-gray-900 mb-2.5">
        {label}
      </label>
      {((formData[field] as string[]) || []).map(
        (item: string, index: number) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateListItem(field, index, e.target.value)}
              placeholder={placeholder}
              disabled={isViewMode}
              className={`flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all ${
                isViewMode ? "opacity-70 cursor-not-allowed" : ""
              }`}
            />
            {!isViewMode && (
              <button
                onClick={() => removeListItem(field, index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )
      )}
      {!isViewMode && (
        <button
          onClick={() => addListItem(field)}
          className="flex items-center space-x-2 px-4 py-2.5 text-green-500 hover:bg-green-500/10 rounded-lg text-sm font-medium transition-colors border border-green-500/30"
        >
          <Plus size={16} />
          <span>Add Item</span>
        </button>
      )}
    </div>
  );

  const FileUpload = ({
    label,
    field,
    description,
  }: {
    label: string;
    field: string;
    description?: string;
  }) => {
    const [isDragging, setIsDragging] = useState(false);

    return (
      <div>
        <label className="block text-base font-semibold text-gray-900 mb-2.5">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-600 mb-3">{description}</p>
        )}
        {!isViewMode ? (
          <div
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all ${
              isDragging
                ? "border-green-500 bg-green-500/5"
                : "border-gray-300 hover:border-green-500/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
          >
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
                <Upload className="text-green-500" size={24} />
              </div>
              <p className="text-sm text-gray-700 font-medium mb-1">
                Drag and drop files here, or
              </p>
              <button className="text-green-500 hover:text-green-600 text-sm font-medium underline transition-colors">
                browse to upload
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Supports PDF, DOC, XLS (Max 10MB)
              </p>
            </div>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  const fileNames = Array.from(files).map((f) => f.name);
                  handleInputChange(field, fileNames.join(", "));
                }
              }}
            />
          </div>
        ) : null}
        {formData[field] && (
          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-gray-700">{formData[field]}</p>
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // General Information
        return (
          <div className="space-y-8">
            <Section title="Company Information">
              <TextInput
                label="Organization Name"
                field="orgName"
                required
                placeholder="Enter your organization name"
              />
              <TextInput
                label="Company Site Address"
                field="siteAddress"
                required
                placeholder="Enter full address"
              />
              <TextInput
                label="Email Address"
                field="email"
                type="email"
                required
                placeholder="example@company.com"
              />
              <TextInput
                label="Designation/Role/Title"
                field="designation"
                required
                placeholder="Your role in the organization"
              />
            </Section>

            <Section title="Business Details">
              <RadioGroup
                label="Core Business Activities"
                field="businessActivity"
                required
                options={[
                  "Manufacturing",
                  "Food Processing",
                  "Power generation sector",
                  "Construction & Real Estate",
                  "Logistics & Transportation",
                  "Technology development & Services (IT)",
                  "Others",
                ]}
              />
              <RadioGroup
                label="Organization's Annual Revenue"
                field="annualRevenue"
                required
                options={[
                  "$1 Million or less",
                  "$1 Million to $2 Million",
                  "$2 Million to $3 Million",
                  "$3 Million to $4 Million",
                  "$4 Million to $5 Million",
                ]}
              />
            </Section>

            <Section title="Production Details">
              <TextInput
                label="Annual Production Volume"
                field="productionVolume"
                placeholder="e.g., 1000 units/year"
                helperText="Estimated annual production output"
              />
              <TextInput
                label="Production Site Where Product is Manufactured"
                field="productionSite"
                placeholder="Location of manufacturing facility"
              />
              <TextInput
                label="Organizational Annual Reporting Period (Year)"
                field="reportingPeriod"
                type="number"
                placeholder="2024"
              />
            </Section>
          </div>
        );

      case 1: // Material Composition
        return (
          <div className="space-y-6">
            <CheckboxGroup
              label="Main Raw Materials Used in Product"
              field="rawMaterials"
              required
              options={[
                "Aluminum",
                "Iron",
                "Copper",
                "Alloy",
                "Contact Enviguide for support",
              ]}
            />
            <YesNoRadio
              label="Does your company use recycled material content/secondary materials?"
              field="hasRecycledMaterial"
              required
            />

            {formData.hasRecycledMaterial === "yes" && (
              <>
                <TextInput
                  label="Percentage of Total Recycled Material Content (%)"
                  field="recycledMaterialPercent"
                  type="number"
                  required
                />
                <YesNoRadio
                  label="Can you estimate the percentage of pre-consumer, post-consumer and reutilization materials?"
                  field="canEstimateRecycledTypes"
                  required
                />

                {formData.canEstimateRecycledTypes === "yes" && (
                  <>
                    <TextInput
                      label="Percentage of Pre-consumer Material (%)"
                      field="preConsumerPercent"
                      type="number"
                      required
                    />
                    <TextInput
                      label="Percentage of Post-consumer Material (%)"
                      field="postConsumerPercent"
                      type="number"
                      required
                    />
                    <TextInput
                      label="Percentage of Reutilization Material (%)"
                      field="reutilizationPercent"
                      type="number"
                      required
                    />
                  </>
                )}
              </>
            )}

            {formData.hasRecycledMaterial === "no" && (
              <>
                <YesNoRadio
                  label="Does your company use recycled copper?"
                  field="hasRecycledCopper"
                  required
                />
                {formData.hasRecycledCopper === "yes" && (
                  <TextInput
                    label="Percentage of Recycled Copper (%)"
                    field="recycledCopperPercent"
                    type="number"
                  />
                )}

                <YesNoRadio
                  label="Does your company use recycled Aluminum?"
                  field="hasRecycledAluminum"
                  required
                />
                {formData.hasRecycledAluminum === "yes" && (
                  <TextInput
                    label="Percentage of Recycled Aluminum (%)"
                    field="recycledAluminumPercent"
                    type="number"
                  />
                )}

                <YesNoRadio
                  label="Does your company use recycled steel?"
                  field="hasRecycledSteel"
                  required
                />
                {formData.hasRecycledSteel === "yes" && (
                  <TextInput
                    label="Percentage of Recycled Steel (%)"
                    field="recycledSteelPercent"
                    type="number"
                    required
                  />
                )}

                <YesNoRadio
                  label="Does your company use recycled plastics?"
                  field="hasRecycledPlastics"
                  required
                />
                {formData.hasRecycledPlastics === "yes" && (
                  <>
                    <TextInput
                      label="Percentage of Total Recycled Plastics (%)"
                      field="recycledPlasticsPercent"
                      type="number"
                      required
                    />
                    <TextInput
                      label="Percentage of Recycled Thermoplastics (%)"
                      field="recycledThermoplasticsPercent"
                      type="number"
                      required
                    />
                    <TextInput
                      label="Percentage of Recycled Plastics Filler (%)"
                      field="recycledFillerPercent"
                      type="number"
                    />
                    <TextInput
                      label="Percentage of Recycled Fiber Content (%)"
                      field="recycledFiberPercent"
                      type="number"
                    />
                  </>
                )}
              </>
            )}

            <YesNoRadio
              label="Does your company have a recycling process or program?"
              field="hasRecyclingProgram"
              required
            />

            {formData.hasRecyclingProgram === "no" && (
              <>
                <YesNoRadio
                  label="Do you have any future strategy regarding recycling?"
                  field="hasFutureRecyclingStrategy"
                  required
                />
                {formData.hasFutureRecyclingStrategy === "yes" && (
                  <TextInput
                    label="Year of Implementation"
                    field="recyclingImplementationYear"
                    type="number"
                  />
                )}
              </>
            )}

            <TextInput
              label="CO₂ emissions from transporting raw materials (metric tons)"
              field="transportEmissions"
            />
            <YesNoRadio
              label="Do you need help calculating supply chain emissions?"
              field="needsEmissionsHelp"
              required
            />
            {formData.needsEmissionsHelp === "yes" && (
              <TextInput
                label="Specify your requirements"
                field="emissionsHelpDetails"
              />
            )}

            <TextInput
              label="% Post-consumer Recycling (PCR) and % Post-industrial Recycling (PIR)"
              field="pcrPirPercent"
              type="number"
            />
            <YesNoRadio
              label="Do you use bio-based or renewable materials?"
              field="hasBioBasedMaterials"
              required
            />
            {formData.hasBioBasedMaterials === "yes" && (
              <DynamicList
                label="Type and Percentage of Bio-based Materials"
                field="bioBasedMaterials"
                placeholder="e.g., Bamboo fiber 15%"
              />
            )}

            <FileUpload
              label="Material Safety Data Sheets (MSDS)"
              field="msdsLink"
            />
            <TextInput
              label="Specify metals in alloy used most"
              field="alloyMetals"
            />
            <TextInput
              label="Grade of metal used in manufacture"
              field="metalGrade"
            />
          </div>
        );

      case 2: // Energy & Manufacturing
        return (
          <div className="space-y-6">
            <CheckboxGroup
              label="Energy Sources Used at Production Site"
              field="energySources"
              required
              options={[
                "Solar Energy",
                "Wind Energy",
                "Hydro Electric Energy",
                "Geothermal Energy",
                "Bio Based Energy",
                "Tidal Energy",
                "Nuclear Energy",
                "Steam Energy",
                "Heat Energy",
                "Cooling Energy",
              ]}
            />
            <TextInput
              label="Site's Electricity Consumption Per Year (kWh/year)"
              field="electricityConsumption"
              required
            />
            <YesNoRadio
              label="Do you purchase renewable electricity?"
              field="purchasesRenewable"
              required
            />
            {formData.purchasesRenewable === "yes" && (
              <DynamicList
                label="% of Total Electricity from Renewable Sources"
                field="renewablePercent"
                placeholder="e.g., 45%"
              />
            )}

            <YesNoRadio
              label="Do you have a device or methodology to calculate product level energy?"
              field="hasEnergyMethodology"
              required
            />
            {formData.hasEnergyMethodology === "yes" && (
              <FileUpload
                label="Provide Detailed Methodology"
                field="energyMethodologyDoc"
              />
            )}

            <TextInput
              label="Energy Intensity (kWh or MJ per unit)"
              field="energyIntensity"
            />

            <CheckboxGroup
              label="Process-specific Energy Usage"
              field="processEnergyUsage"
              required
              options={[
                "Casting",
                "Moulding",
                "Machining",
                "Painting",
                "Surface treatment",
                "Curing",
                "Welding",
                "Support from Enviguide",
              ]}
            />

            <YesNoRadio
              label="Do you use any abatement systems?"
              field="hasAbatementSystems"
              required
            />
            {formData.hasAbatementSystems === "yes" && (
              <DynamicList
                label="Energy Consumption of Abatement Systems"
                field="abatementEnergy"
                placeholder="e.g., VOC treatment 500 kWh"
              />
            )}

            <TextInput
              label="Water Consumption and Treatment"
              field="waterConsumption"
            />
          </div>
        );

      case 3: // Packaging
        return (
          <div className="space-y-6">
            <CheckboxGroup
              label="Packaging Materials Used"
              field="packagingMaterials"
              required
              options={[
                "Cardboard",
                "Plastic film",
                "Wood pallets",
                "Another Component",
                "Support from Enviguide",
              ]}
            />
            <TextInput
              label="Approximate Weight of Packaging Per Unit (kg/unit)"
              field="packagingWeight"
            />
            <YesNoRadio
              label="Do you use recycled material for packaging?"
              field="hasRecycledPackaging"
              required
            />
            {formData.hasRecycledPackaging === "yes" && (
              <DynamicList
                label="% Recycled Content in Packaging"
                field="recycledPackagingPercent"
                placeholder="e.g., Cardboard 80%"
              />
            )}
          </div>
        );

      case 4: // Transportation & Logistics
        return (
          <div className="space-y-6">
            <CheckboxGroup
              label="Mode(s) of Transport Used"
              field="transportModes"
              required
              options={[
                "Truck",
                "Rail",
                "Ship",
                "Air",
                "Multimode",
                "Support from Enviguide",
              ]}
            />
            <YesNoRadio
              label="Do you use logistics service providers with certified emission reporting?"
              field="hasCertifiedLogistics"
              required
            />
            {formData.hasCertifiedLogistics === "yes" && (
              <DynamicList
                label="Provide Details"
                field="logisticsDetails"
                placeholder="e.g., Provider name and certification"
              />
            )}
          </div>
        );

      case 5: // Waste & By-products
        return (
          <div className="space-y-6">
            <CheckboxGroup
              label="Types of Production Waste Generated"
              field="wasteTypes"
              required
              options={["Scrap metal", "Plastic scrap", "Sludge", "Solvents"]}
            />
            <CheckboxGroup
              label="How is Waste Treated?"
              field="wasteTreatment"
              required
              options={["Landfill", "Incineration", "Recycling", "Recovery"]}
            />
            <TextInput
              label="% of Scrap/Waste Internally Recycled or Sent for Recycling"
              field="wasteRecycledPercent"
            />
            <YesNoRadio
              label="Any By-products Generated?"
              field="hasByProducts"
              required
            />
            {formData.hasByProducts === "yes" && (
              <>
                <DynamicList
                  label="Specify Type of By-product"
                  field="byProductTypes"
                  placeholder="e.g., Metal shavings"
                />
                <TextInput
                  label="Quantity of By-product"
                  field="byProductQuantity"
                  required
                />
              </>
            )}
          </div>
        );

      case 6: // End-of-Life & Circularity
        return (
          <div className="space-y-6">
            <YesNoRadio
              label="Is your product designed for disassembly, recycling, or reuse?"
              field="designedForCircularity"
              required
            />
            {formData.designedForCircularity === "yes" && (
              <DynamicList
                label="Specify Details"
                field="circularityDetails"
                placeholder="e.g., Modular design allows component replacement"
              />
            )}

            <YesNoRadio
              label="Do you provide take-back or recycling programs?"
              field="hasTakeBackProgram"
              required
            />
            {formData.hasTakeBackProgram === "yes" && (
              <DynamicList
                label="Details & % Recyclability of Product"
                field="takeBackDetails"
                placeholder="e.g., 85% recyclability"
              />
            )}
          </div>
        );

      case 7: // Emission Factors / LCA Data
        return (
          <div className="space-y-6">
            <YesNoRadio
              label="Do you already report Product Carbon Footprint (PCF) values?"
              field="reportsPCF"
              required
            />
            {formData.reportsPCF === "yes" && (
              <DynamicList
                label="Share Methodology"
                field="pcfMethodology"
                placeholder="e.g., ISO 14067"
              />
            )}

            <YesNoRadio
              label="Do you have Scope 1, 2, and 3 emissions data available?"
              field="hasScopeEmissions"
              required
            />
            {formData.hasScopeEmissions === "yes" && (
              <DynamicList
                label="Provide Emission Data"
                field="scopeEmissionsData"
                placeholder="e.g., Scope 1: 500 tCO2e"
              />
            )}
          </div>
        );

      case 8: // Certifications & Standards
        return (
          <div className="space-y-6">
            <YesNoRadio
              label="Are you certified to ISO 14001 or ISO 50001?"
              field="hasISOCertification"
              required
            />
            <YesNoRadio
              label="Do you follow ISO 14067, GHG Protocol, Catena-X PCF Guideline?"
              field="followsStandards"
              required
            />
            <YesNoRadio
              label="Do you report to CDP, SBTi, or other ESG frameworks?"
              field="reportsESG"
              required
            />
            {(formData.hasISOCertification === "yes" ||
              formData.followsStandards === "yes" ||
              formData.reportsESG === "yes") && (
              <DynamicList
                label="Provide Previous Reports"
                field="certificationReports"
                placeholder="Add report link or reference"
              />
            )}
          </div>
        );

      case 9: // Additional Notes
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2.5">
                What measures are you taking to reduce carbon emissions?
              </label>
              <textarea
                value={formData.carbonReductionMeasures || ""}
                onChange={(e) =>
                  handleInputChange("carbonReductionMeasures", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] focus:bg-white transition-all text-gray-700"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2.5">
                What renewable energy initiatives or recycling programs are in
                place?
              </label>
              <textarea
                value={formData.renewableInitiatives || ""}
                onChange={(e) =>
                  handleInputChange("renewableInitiatives", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] focus:bg-white transition-all text-gray-700"
              />
            </div>

            <YesNoRadio
              label="Are you willing to provide primary data to digital PCF platforms?"
              field="willingToShareData"
              required
            />
            {formData.willingToShareData === "yes" && (
              <DynamicList
                label="Provide Primary Data"
                field="primaryData"
                placeholder="Add data or link"
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={48}
            className="animate-spin text-green-500 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading questionnaire...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <button
            onClick={() => navigate("/supplier-questionnaire")}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg font-medium transition-all"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1]">
      <div className="py-6 sm:py-8 px-4 pb-32">
        {/* Header with back button and mode indicator */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 w-full max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/supplier-questionnaire")}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to List</span>
            </button>
            <div className="flex items-center gap-2">
              {isViewMode && (
                <span className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                  <Eye size={16} />
                  View Mode
                </span>
              )}
              {isEditMode && (
                <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  <Edit size={16} />
                  Edit Mode
                </span>
              )}
              {questionnaireId && (
                <span className="text-sm text-gray-600">
                  ID: {questionnaireId.slice(0, 8)}...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 w-full max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-semibold text-green-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute top-6 left-0 right-0 h-1.5 bg-gray-200 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 shadow-lg shadow-green-500/30"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>

            <div className="relative flex justify-between px-2">
              {steps.map((step, index) => {
                const IconComponent = step.Icon;
                const isActive = index <= currentStep;
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center cursor-pointer transition-transform ${
                      isActive ? "scale-105" : "scale-100"
                    }`}
                    onClick={() => goToStep(index)}
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                        index <= currentStep
                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-xl"
                          : "bg-white border-2 border-gray-300 text-gray-400 hover:border-gray-400"
                      }`}
                    >
                      {index < currentStep ? (
                        <Check size={22} />
                      ) : (
                        <IconComponent size={20} />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium text-center w-[90px] leading-tight transition-colors ${
                        index === currentStep
                          ? "text-green-500 font-bold"
                          : index < currentStep
                          ? "text-green-500/70"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Progress */}
          <div className="lg:hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <span className="text-xs text-gray-600">
                {steps[currentStep].title}
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-20 max-w-4xl mx-auto animate-fadeIn">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {React.createElement(steps[currentStep].Icon, {
                size: 28,
                className: "text-green-500",
              })}
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {steps[currentStep].title}
              </h2>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
            <p className="mt-3 text-sm text-gray-600">
              Please provide accurate information to ensure the best results
            </p>
          </div>

          <div className="animate-slideIn">{renderStepContent()}</div>
        </div>
      </div>

      {/* Fixed Navigation Buttons */}
      <div className="fixed bottom-0 left-0 lg:left-72 right-0 z-10 bg-white/95 backdrop-blur-sm border-t-2 border-gray-200 shadow-2xl transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all w-full sm:w-auto justify-center ${
                currentStep === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl border-2 border-gray-200"
              }`}
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
              {!isViewMode && (
                <button
                  onClick={saveDraft}
                  disabled={isSaving}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 w-full sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Draft</span>
                  )}
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  disabled={isViewMode}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-2xl shadow-lg shadow-green-500/30 font-medium transition-all w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight size={20} />
                </button>
              ) : isViewMode ? (
                <button
                  onClick={() =>
                    navigate(
                      `/supplier-questionnaire/edit?sgiq_id=${questionnaireId}`
                    )
                  }
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-2xl shadow-lg shadow-blue-500/30 font-medium transition-all w-full sm:w-auto"
                >
                  <Edit size={20} />
                  <span>Edit Questionnaire</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:shadow-2xl shadow-lg shadow-green-500/30 font-medium transition-all w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      <span>
                        {isEditMode ? "Updating..." : "Submitting..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      <span>{isEditMode ? "Update" : "Submit"}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-slideIn {
            animation: slideIn 0.4s ease-out;
          }
        `}
      </style>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-green-500" size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Questionnaire Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Your supplier questionnaire has been successfully submitted. You
                can now proceed to complete the Data Quality Rating.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate("/dashboard");
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate(`/data-quality-rating?sgiq_id=${questionnaireId}`);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg font-medium transition-all"
                >
                  Continue to DQR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierQuestionnaire;
