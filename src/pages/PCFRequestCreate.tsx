import React, { useState } from "react";
import { Steps, message } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
import BasicInformationStep from "../features/pcf-create/BasicInformationStep";
import ProductDetailsStep from "../features/pcf-create/ProductDetailsStep";
import DocumentationStep from "../features/pcf-create/DocumentationStep";
import ReviewSubmitStep from "../features/pcf-create/ReviewSubmitStep";
import pcfService from "../lib/pcfService";

const PCFRequestCreate: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      title: "Basic Information",
      description:
        currentStep === 0
          ? "Active"
          : completedSteps.includes(0)
          ? "Completed"
          : "Pending",
    },
    {
      title: "Product Details",
      description:
        currentStep === 1
          ? "Active"
          : completedSteps.includes(1)
          ? "Completed"
          : "Pending",
    },
    {
      title: "Documentation",
      description:
        currentStep === 2
          ? "Active"
          : completedSteps.includes(2)
          ? "Completed"
          : "Pending",
    },
    {
      title: "Review & Submit",
      description:
        currentStep === 3
          ? "Active"
          : completedSteps.includes(3)
          ? "Completed"
          : "Pending",
    },
  ];

  const handleStepSave = (values: any) => {
    const updatedData = { ...formData, ...values };
    setFormData(updatedData);

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow clicking on completed steps or the current step
    if (completedSteps.includes(stepIndex) || stepIndex === currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        bom_pcf_request: {
          request_title: formData.title,
          priority: formData.priority,
          request_organization: formData.organization,
          due_date: formData.dueDate, // Ensure this is in the correct format (e.g., ISO string)
          request_description: formData.description,
          product_category_id: formData.productCategory,
          component_category_id: formData.componentCategory,
          component_type_id: formData.componentType, // Note: API expects ID, but UI is Input
          product_code: formData.productCode,
          manufacturer_id: formData.manufacture, // Note: API expects ID, but UI is Input
          model_version: formData.modelVersion,
        },
        bom_pcf_request_product_specification: (
          formData.specifications || []
        ).map((spec: any) => ({
          specification_name: spec.name,
          specification_value: spec.value,
          specification_unit: spec.unit,
        })),
        bom: (formData.bomData || []).map((item: any) => ({
          material_number: item.materialNumber,
          component_name: item.componentName,
          quantity: parseInt(item.quantity || "0"),
          production_location: item.productionLocation,
          manufacturer: item.manufacturer,
          detail_description: item.detailedDescription,
          weight_gms: parseFloat(item.totalWeight || item.weight || "0"),
          component_category: item.category,
          price: parseFloat(item.totalPrice || item.price || "0"),
          supplier_email: item.supplierEmail,
          supplier_name: item.supplierName,
          supplier_phone_number: item.supplierNumber,
        })),
      };

      console.log("Submitting PCF Request Payload:", payload);
      const response = await pcfService.createPCFRequest(payload);

      if (response.success) {
        message.success("PCF Request created successfully!");
        navigate("/pcf-request");
      } else {
        message.error(response.message || "Failed to create PCF Request");
      }
    } catch (error) {
      console.error("Error creating PCF Request:", error);
      message.error("An error occurred while creating the request");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInformationStep
            initialValues={formData}
            onSave={handleStepSave}
          />
        );
      case 1:
        return (
          <ProductDetailsStep
            initialValues={formData}
            onSave={handleStepSave}
            onBack={() => setCurrentStep(0)}
          />
        );
      case 2:
        return (
          <DocumentationStep initialValues={formData} onSave={handleStepSave} />
        );
      case 3:
        return (
          <ReviewSubmitStep
            formData={formData}
            onEditStep={setCurrentStep}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/pcf-request")}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create PCF Request</h1>
                <p className="text-gray-500">PCF Request → New Request</p>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <Steps
            current={currentStep}
            onChange={handleStepClick}
            items={steps.map((step, index) => ({
              title: step.title,
              description: (
                <span
                  className={index === currentStep ? "text-green-600 font-semibold" : ""}
                >
                  {step.description}
                </span>
              ),
              status:
                index === currentStep
                  ? "process"
                  : completedSteps.includes(index)
                  ? "finish"
                  : "wait",
              disabled:
                !completedSteps.includes(index) && index !== currentStep,
            }))}
          />
        </div>

        {renderStepContent()}
      </div>
    </div>
  );
};

export default PCFRequestCreate;
