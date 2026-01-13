import React, { useState } from "react";
import { Button, Card, ConfigProvider, Space, Steps, Typography, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import BasicInformationStep from "../features/pcf-create/BasicInformationStep";
import ProductDetailsStep from "../features/pcf-create/ProductDetailsStep";
import DocumentationStep from "../features/pcf-create/DocumentationStep";
import ReviewSubmitStep from "../features/pcf-create/ReviewSubmitStep";
import pcfService from "../lib/pcfService";

const { Title, Text } = Typography;

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
        components: {
          Card: { paddingLG: 16, borderRadius: 12 },
          Button: { borderRadius: 8 },
          Select: { borderRadius: 8 },
          Input: { borderRadius: 8 },
          DatePicker: { borderRadius: 8 },
        },
      }}
    >
      <div className="bg-gray-100 p-6 min-h-screen">
        <Space direction="vertical" size={16} className="w-full">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/pcf-request")}
            className="p-0 text-gray-700"
          >
            PCF Request
          </Button>
          <Card>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="bg-green-500 p-2 rounded-lg w-14 h-14 flex items-center justify-center">
                  <svg
                    width="24"
                    height="32"
                    viewBox="0 0 24 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 0C9.3875 0 7.1625 1.66875 6.34375 4H4C1.79375 4 0 5.79375 0 8V28C0 30.2063 1.79375 32 4 32H20C22.2063 32 24 30.2063 24 28V8C24 5.79375 22.2063 4 20 4H17.6563C16.8375 1.66875 14.6125 0 12 0ZM12 4C12.5304 4 13.0391 4.21071 13.4142 4.58579C13.7893 4.96086 14 5.46957 14 6C14 6.53043 13.7893 7.03914 13.4142 7.41421C13.0391 7.78929 12.5304 8 12 8C11.4696 8 10.9609 7.78929 10.5858 7.41421C10.2107 7.03914 10 6.53043 10 6C10 5.46957 10.2107 4.96086 10.5858 4.58579C10.9609 4.21071 11.4696 4 12 4ZM4.5 17C4.5 16.6022 4.65803 16.2206 4.93934 15.9393C5.22064 15.658 5.60218 15.5 6 15.5C6.39782 15.5 6.77936 15.658 7.06066 15.9393C7.34197 16.2206 7.5 16.6022 7.5 17C7.5 17.3978 7.34197 17.7794 7.06066 18.0607C6.77936 18.342 6.39782 18.5 6 18.5C5.60218 18.5 5.22064 18.342 4.93934 18.0607C4.65803 17.7794 4.5 17.3978 4.5 17ZM11 16H19C19.55 16 20 16.45 20 17C20 17.55 19.55 18 19 18H11C10.45 18 10 17.55 10 17C10 16.45 10.45 16 11 16ZM4.5 23C4.5 22.6022 4.65803 22.2206 4.93934 21.9393C5.22064 21.658 5.60218 21.5 6 21.5C6.39782 21.5 6.77936 21.658 7.06066 21.9393C7.34197 22.2206 7.5 22.6022 7.5 23C7.5 23.3978 7.34197 23.7794 7.06066 24.0607C6.77936 24.342 6.39782 24.5 6 24.5C5.60218 24.5 5.22064 24.342 4.93934 24.0607C4.65803 23.7794 4.5 23.3978 4.5 23ZM10 23C10 22.45 10.45 22 11 22H19C19.55 22 20 22.45 20 23C20 23.55 19.55 24 19 24H11C10.45 24 10 23.55 10 23Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div>
                  <Title level={3} style={{ marginBottom: 4 }}>
                    Create PCF Request
                  </Title>
                  <Text type="secondary">PCF Request → New Request</Text>
                </div>
              </div>
              {/* Global Save button removed as per requirements, save is per step */}
            </div>
          </Card>

          <Card>
            <Steps
              current={currentStep}
              onChange={handleStepClick}
              items={steps.map((step, index) => ({
                title: step.title,
                description: (
                  <span
                    style={{
                      color: index === currentStep ? "#52c41a" : undefined,
                      fontWeight: index === currentStep ? "bold" : undefined,
                    }}
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
          </Card>

          {renderStepContent()}
        </Space>
      </div>
    </ConfigProvider>
  );
};

export default PCFRequestCreate;
