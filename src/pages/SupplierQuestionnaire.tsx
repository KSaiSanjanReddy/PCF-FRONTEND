import React, { useState } from "react";
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
} from "lucide-react";

const SupplierQuestionnaire: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string | string[]>>(
    {}
  );

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

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const TextInput = ({
    label,
    field,
    required,
    type = "text",
    placeholder,
  }: {
    label: string;
    field: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-base font-semibold text-gray-900 mb-2.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={formData[field] || ""}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9AFB00] focus:border-[#9AFB00] focus:bg-white transition-all text-gray-700"
      />
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
            className="flex items-center space-x-3 p-3.5 bg-gray-50 border-2 border-gray-200 rounded-lg hover:bg-white hover:border-[#9AFB00] hover:shadow-sm cursor-pointer transition-all"
          >
            <input
              type="radio"
              name={field}
              value={option}
              checked={formData[field] === option}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="text-[#9AFB00] focus:ring-[#9AFB00] w-4 h-4"
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
          className={`flex items-center space-x-3 px-6 py-3 border-2 rounded-xl cursor-pointer transition-all ${
            formData[field] === "yes"
              ? "bg-[#9AFB00]/5 border-[#9AFB00] shadow-sm"
              : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              name={field}
              value="yes"
              checked={formData[field] === "yes"}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                formData[field] === "yes"
                  ? "border-[#9AFB00]"
                  : "border-gray-300"
              }`}
            >
              {formData[field] === "yes" && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#9AFB00]"></div>
              )}
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">Yes</span>
        </label>
        <label
          className={`flex items-center space-x-3 px-6 py-3 border-2 rounded-xl cursor-pointer transition-all ${
            formData[field] === "no"
              ? "bg-[#9AFB00]/5 border-[#9AFB00] shadow-sm"
              : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              name={field}
              value="no"
              checked={formData[field] === "no"}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                formData[field] === "no"
                  ? "border-[#9AFB00]"
                  : "border-gray-300"
              }`}
            >
              {formData[field] === "no" && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#9AFB00]"></div>
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
            className="flex items-center space-x-3 p-3.5 bg-gray-50 border-2 border-gray-200 rounded-lg hover:bg-white hover:border-[#9AFB00] hover:shadow-sm cursor-pointer transition-all"
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
              className="text-[#9AFB00] focus:ring-[#9AFB00] rounded w-4 h-4"
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
              className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9AFB00] focus:border-[#9AFB00] focus:bg-white transition-all"
            />
            <button
              onClick={() => removeListItem(field, index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )
      )}
      <button
        onClick={() => addListItem(field)}
        className="flex items-center space-x-2 px-4 py-2.5 text-[#7DD600] hover:bg-[#9AFB00]/10 rounded-lg text-sm font-medium transition-colors border border-[#9AFB00]/30"
      >
        <Plus size={16} />
        <span>Add Item</span>
      </button>
    </div>
  );

  const FileUpload = ({ label, field }: { label: string; field: string }) => (
    <div>
      <label className="block text-base font-semibold text-gray-900 mb-2.5">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={formData[field] || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder="Paste link or file path"
          className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9AFB00] focus:border-[#9AFB00] focus:bg-white transition-all"
        />
        <button className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-[#9AFB00] to-[#7DD600] text-[#1a202c] font-medium rounded-lg hover:shadow-lg transition-all shadow-lg shadow-[#9AFB00]/30">
          <Upload size={16} />
          <span>Upload</span>
        </button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // General Information
        return (
          <div className="space-y-6">
            <TextInput label="Organization Name" field="orgName" required />
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
            <TextInput
              label="Company Site Address"
              field="siteAddress"
              required
            />
            <TextInput
              label="Designation/Role/Title"
              field="designation"
              required
            />
            <TextInput
              label="Email Address"
              field="email"
              type="email"
              required
            />
            <TextInput
              label="Annual Production Volume"
              field="productionVolume"
            />
            <TextInput
              label="Production Site Where Product is Manufactured"
              field="productionSite"
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
            <TextInput
              label="Organizational Annual Reporting Period (Year)"
              field="reportingPeriod"
              type="number"
              placeholder="2024"
            />
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
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9AFB00] focus:border-[#9AFB00] focus:bg-white transition-all text-gray-700"
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
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9AFB00] focus:border-[#9AFB00] focus:bg-white transition-all text-gray-700"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1]">
      <div className="py-8 px-4 pb-32">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-[#7DD600]">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>

          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-[#9AFB00] to-[#7DD600] rounded-full transition-all duration-500 shadow-lg"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>

            <div className="relative flex justify-between px-2">
              {steps.map((step, index) => {
                const IconComponent = step.Icon;
                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => goToStep(index)}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        index <= currentStep
                          ? "bg-gradient-to-br from-[#9AFB00] to-[#7DD600] text-white shadow-lg shadow-[#9AFB00]/30"
                          : "bg-white border-2 border-gray-300 text-gray-400"
                      }`}
                    >
                      {index < currentStep ? (
                        <Check size={20} />
                      ) : (
                        <IconComponent size={20} />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium text-center w-[100px] leading-tight ${
                        index === currentStep
                          ? "text-[#7DD600]"
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
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 max-w-4xl mx-auto ">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {steps[currentStep].title}
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-[#9AFB00] to-[#7DD600] rounded-full"></div>
          </div>

          {renderStepContent()}
        </div>
      </div>

      {/* Fixed Navigation Buttons */}
      <div className="sticky bottom-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl -mx-4 px-4">
        <div className="max-w-4xl mx-auto py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl"
              }`}
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            <div className="flex space-x-3">
              <button className="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium shadow-lg hover:shadow-xl transition-all">
                Save Draft
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#9AFB00] to-[#7DD600] text-[#1a202c] rounded-xl hover:shadow-2xl shadow-lg shadow-[#9AFB00]/30 font-medium transition-all"
                >
                  <span>Next</span>
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#7DD600] to-[#9AFB00] text-[#1a202c] rounded-xl hover:shadow-2xl shadow-lg shadow-[#9AFB00]/30 font-medium transition-all">
                  <Check size={20} />
                  <span>Submit Questionnaire</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierQuestionnaire;
