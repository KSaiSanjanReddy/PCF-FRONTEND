import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Steps, Button, message, Spin, Modal, Form } from "antd";
import { SaveOutlined, ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined } from '@ant-design/icons';
import supplierQuestionnaireService from "../../lib/supplierQuestionnaireService";
import authService from "../../lib/authService";
import { QUESTIONNAIRE_SCHEMA } from "../../config/questionnaireSchema";
import DynamicQuestionnaireForm from "./DynamicQuestionnaireForm";


const { Step } = Steps;

const SupplierQuestionnaire: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  // Get sgiq_id from search params
  let sgiq_id = searchParams.get("sgiq_id");
  if (!sgiq_id && location.search) {
    const urlParams = new URLSearchParams(location.search);
    sgiq_id = urlParams.get("sgiq_id");
  }

  // Get user_id from search params
  let user_id = searchParams.get("user_id");
  if (!user_id && location.search) {
    const urlParams = new URLSearchParams(location.search);
    user_id = urlParams.get("user_id");
  }

  const isViewMode = location.pathname.includes("/view");
  const isEditMode = location.pathname.includes("/edit");
  const isCreateMode = location.pathname.includes("/new");

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(sgiq_id);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if ((isViewMode || isEditMode) && sgiq_id) {
        setIsLoading(true);
        try {
          let userIdToUse = user_id;
          if (!userIdToUse) {
            const user = authService.getCurrentUser();
            if (user?.id) userIdToUse = user.id;
          }

          if (sgiq_id) {
            const result = await supplierQuestionnaireService.getQuestionnaireById(sgiq_id as string, userIdToUse?? "");
            if (result.success && result.data) {
              setFormData(result.data);
              // We need to set form values if we are on the current step
              // But form values are set via initialValues prop on the DynamicForm
              // However, when switching steps, we need to ensure data is preserved
            } else {
              message.error(result.message || "Failed to load questionnaire");
            }
          }
        } catch (error) {
          console.error("Error loading questionnaire:", error);
          message.error("An error occurred while loading the questionnaire");
        } finally {
          setIsLoading(false);
        }
      } else if (isCreateMode) {
        const draft = supplierQuestionnaireService.loadDraft();
        if (draft) {
          setFormData(draft.formData);
          setCurrentStep(draft.currentStep || 0);
        }
      }
    };

    loadData();
  }, [sgiq_id, user_id, isViewMode, isEditMode, isCreateMode]);

  // Update form values when step changes or data loads
  useEffect(() => {
    form.setFieldsValue(formData);
  }, [currentStep, formData, form]);

  const handleNext = async () => {
    try {
      // Validate current step fields
      const values = await form.validateFields();
      
      // Merge current step values into global form data
      const updatedData = { ...formData, ...values };
      setFormData(updatedData);

      if (isCreateMode) {
        supplierQuestionnaireService.saveDraft(updatedData, currentStep + 1);
      }

      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Validation failed:", error);
      message.error("Please fill in all required fields");
    }
  };

  const handlePrev = () => {
    // Save current values before moving back
    const values = form.getFieldsValue();
    setFormData({ ...formData, ...values });
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const values = form.getFieldsValue();
      const updatedData = { ...formData, ...values };
      setFormData(updatedData);
      
      supplierQuestionnaireService.saveDraft(updatedData, currentStep);
      message.success("Draft saved successfully!");
    } catch (error) {
      message.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const finalData = { ...formData, ...values };
      
      setIsSaving(true);
      
      let result;
      if (questionnaireId) {
        result = await supplierQuestionnaireService.updateQuestionnaire(questionnaireId, finalData);
      } else {
        result = await supplierQuestionnaireService.createQuestionnaire(finalData);
      }

      if (result.success) {
        supplierQuestionnaireService.clearDraft();
        message.success("Questionnaire submitted successfully!");
        
        // Navigate to DQR or list
        const newId = result.data?.general_info?.sgiq_id || result.data?.sgiq_id || questionnaireId;
        if (newId) {
            // Optional: Redirect to view or DQR
             navigate('/supplier-questionnaire');
        }
      } else {
        message.error(`Failed to submit: ${result.message}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      message.error("Please fix validation errors before submitting");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading questionnaire..." />
      </div>
    );
  }

  const currentSection = QUESTIONNAIRE_SCHEMA[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              type="text" 
              onClick={() => navigate('/supplier-questionnaire')}
              className="mr-4"
            />
            <h1 className="text-xl font-bold text-gray-900">Supplier Questionnaire</h1>
          </div>
          <div className="flex items-center gap-3">
            {isCreateMode && (
              <Button 
                icon={<SaveOutlined />} 
                onClick={handleSaveDraft}
                loading={isSaving}
              >
                Save Draft
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Steps */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <Steps 
                direction="vertical" 
                current={currentStep} 
                onChange={(step) => {
                    // Allow navigation to any previous step, or next step if current is valid?
                    // For now, strict linear navigation is safer for validation
                    if (step < currentStep) {
                        handlePrev(); // This only goes back one step, need logic for jump
                        // Simple jump logic:
                        const values = form.getFieldsValue();
                        setFormData({ ...formData, ...values });
                        setCurrentStep(step);
                    }
                }}
              >
                {QUESTIONNAIRE_SCHEMA.map(section => (
                  <Step key={section.id} title={section.title} />
                ))}
              </Steps>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <DynamicQuestionnaireForm
                section={currentSection}
                initialValues={formData}
                form={form}
                onFinish={() => {}} // We handle submit manually via footer buttons
              />

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                <Button 
                  onClick={handlePrev} 
                  disabled={currentStep === 0}
                  icon={<ArrowLeftOutlined />}
                  size="large"
                >
                  Previous
                </Button>
                
                {currentStep < QUESTIONNAIRE_SCHEMA.length - 1 ? (
                  <Button 
                    type="primary" 
                    onClick={handleNext}
                    icon={<ArrowRightOutlined />}
                    size="large"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    onClick={handleSubmit}
                    loading={isSaving}
                    icon={<CheckOutlined />}
                    size="large"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Questionnaire
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierQuestionnaire;
