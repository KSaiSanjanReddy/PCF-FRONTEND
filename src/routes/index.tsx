import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import VisitorManagement from "../pages/VisitorManagement";
import SuiteManagement from "../pages/SuiteManagement";
import Bookings from "../pages/Bookings";
import HardwareManagement from "../pages/HardwareManagement";
import DocumentsManagement from "../pages/DocumentsManagement";
import Settings from "../pages/Settings";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import MFAVerification from "../pages/auth/MFAVerification";
import Users from "../pages/settings/Users";
import UsersCreate from "../pages/settings/UsersCreate";
import UsersEdit from "../pages/settings/UsersEdit";
import Authorizations from "../pages/settings/Authorizations";
import ManufacturerOnboardingForm from "../pages/settings/ManufacturerOnboardingForm";
import SupplierOnboardingForm from "../pages/settings/SupplierOnboardingForm";
import PublicManufacturerOnboarding from "../pages/PublicManufacturerOnboarding";
import PublicSupplierOnboarding from "../pages/PublicSupplierOnboarding";
import Products from "../pages/settings/Products";
import Components from "../pages/settings/Components";
import Industry from "../pages/settings/Industry";
import DataSetup from "../pages/settings/DataSetup";
import DataSetupTabs from "../pages/settings/DataSetupTabs";
import { dataSetupGroups } from "../config/dataSetupGroups";
import ProtectedRoute from "../components/ProtectedRoute";

// New pages
import PCFRequest from "../pages/PCFRequest";
import ProductPortfolio from "../pages/ProductPortfolio";
import AllProducts from "../pages/AllProducts";
import ProductCreate from "../pages/ProductCreate";
import ProductView from "../pages/ProductView";
import ProductEdit from "../pages/ProductEdit";
import ComponentsMaster from "../pages/ComponentsMaster";
import ComponentsMasterView from "../pages/ComponentsMasterView";
import DocumentMaster from "../pages/DocumentMaster";
import TaskManagement from "../pages/TaskManagement";
import TaskCreate from "../pages/TaskCreate";
import ReportsMain from "../pages/Reports";
import SupplierQuestionnaire from "../pages/SupplierQuestionnaire";
import SupplierQuestionnaireList from "../pages/SupplierQuestionnaireList";
import DataQualityRating from "../pages/DataQualityRating";
import DataQualityRatingList from "../pages/DataQualityRatingList";
import PCFRequestCreate from "../pages/PCFRequestCreate";
import PCFRequestView from "../pages/PCFRequestView";
import TaskView from "../pages/TaskView";
import ReportView from "../pages/ReportView";

// Detailed Dashboard Pages
import DetailedLifeCycle from "../pages/DetailedLifeCycle";
import DetailedSupplierEmission from "../pages/DetailedSupplierEmission";
import DetailedRawMaterialEmission from "../pages/DetailedRawMaterialEmission";
import DetailedPackagingEmission from "../pages/DetailedPackagingEmission";
import DetailedTransportationEmission from "../pages/DetailedTransportationEmission";
import DetailedEnergyEmission from "../pages/DetailedEnergyEmission";
import DetailedRecyclability from "../pages/DetailedRecyclability";
import DetailedWasteEmission from "../pages/DetailedWasteEmission";
import DetailedImpactCategories from "../pages/DetailedImpactCategories";
import DetailedPCFTrend from "../pages/DetailedPCFTrend";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/mfa-verification",
    element: <MFAVerification />,
  },
  // Public supplier questionnaire route (no login required when accessed via link with sup_id and bom_pcf_id)
  {
    path: "/supplier-questionnaire",
    element: <SupplierQuestionnaire />,
  },
  // Public manufacturer onboarding form (no login required)
  {
    path: "/manufacturer-onboarding",
    element: <PublicManufacturerOnboarding />,
  },
  // Public supplier onboarding form (no login required)
  {
    path: "/supplier-onboarding",
    element: <PublicSupplierOnboarding />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "dashboard/detailed-lifecycle",
        element: <DetailedLifeCycle />,
      },
      {
        path: "dashboard/detailed-supplier",
        element: <DetailedSupplierEmission />,
      },
      {
        path: "dashboard/detailed-raw-material",
        element: <DetailedRawMaterialEmission />,
      },
      {
        path: "dashboard/detailed-packaging",
        element: <DetailedPackagingEmission />,
      },
      {
        path: "dashboard/detailed-transportation",
        element: <DetailedTransportationEmission />,
      },
      {
        path: "dashboard/detailed-energy",
        element: <DetailedEnergyEmission />,
      },
      {
        path: "dashboard/detailed-recyclability",
        element: <DetailedRecyclability />,
      },
      {
        path: "dashboard/detailed-waste",
        element: <DetailedWasteEmission />,
      },
      {
        path: "dashboard/detailed-impact",
        element: <DetailedImpactCategories />,
      },
      {
        path: "dashboard/detailed-pcf-trend",
        element: <DetailedPCFTrend />,
      },
      {
        path: "pcf-request",
        element: <PCFRequest />,
      },
      {
        path: "pcf-request/new",
        element: <PCFRequestCreate />,
      },
      {
        path: "pcf-request/:id",
        element: <PCFRequestView />,
      },
      {
        path: "product-portfolio",
        element: <AllProducts />,
      },
      {
        path: "product-portfolio/all-products",
        element: <AllProducts />,
      },
      {
        path: "product-portfolio/new",
        element: <ProductCreate />,
      },
      {
        path: "product-portfolio/view/:id",
        element: <ProductView />,
      },
      {
        path: "product-portfolio/edit/:id",
        element: <ProductEdit />,
      },
      {
        path: "components-master",
        element: <ComponentsMaster />,
      },
      {
        path: "components-master/view/:id",
        element: <ComponentsMasterView />,
      },
      {
        path: "document-master",
        element: <DocumentMaster />,
      },
      {
        path: "task-management",
        element: <TaskManagement />,
      },
      {
        path: "task-management/new",
        element: <TaskCreate />,
      },
      {
        path: "task-management/view/:id",
        element: <TaskView />,
      },
      {
        path: "reports",
        element: <ReportsMain />,
      },
      {
        path: "reports/:id",
        element: <ReportView />,
      },
      {
        path: "visitor-management",
        element: <VisitorManagement />,
      },
      {
        path: "suite-management",
        element: <SuiteManagement />,
      },
      {
        path: "bookings",
        element: <Bookings />,
      },
      {
        path: "hardware-management",
        element: <HardwareManagement />,
      },
      {
        path: "documents-management",
        element: <DocumentsManagement />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "settings/users",
        element: <Users />,
      },
      {
        path: "settings/users/create",
        element: <UsersCreate />,
      },
      {
        path: "settings/users/edit/:userId",
        element: <UsersEdit />,
      },
      {
        path: "settings/manufacturer-onboarding",
        element: <ManufacturerOnboardingForm />,
      },
      {
        path: "settings/manufacturer-onboarding/:id",
        element: <ManufacturerOnboardingForm />,
      },
      {
        path: "settings/supplier-onboarding",
        element: <SupplierOnboardingForm />,
      },
      {
        path: "settings/supplier-onboarding/:id",
        element: <SupplierOnboardingForm />,
      },
      {
        path: "settings/authorizations",
        element: <Authorizations />,
      },
      {
        path: "settings/products/:tab?",
        element: <Products />,
      },
      {
        path: "settings/components/:tab?",
        element: <Components />,
      },
      {
        path: "settings/industry/:tab?",
        element: <Industry />,
      },
      // All data setup pages (single entity or grouped with tabs)
      {
        path: "settings/data-setup/:entity",
        element: <DataSetup />,
      },
      // Tabbed data setup pages
      ...dataSetupGroups.map((group) => ({
        path: `settings/data-setup/${group.key}/:tab?`,
        element: (
          <DataSetupTabs
            title={group.title}
            description={group.description}
            tabs={group.tabs}
            defaultTab={group.tabs[0]?.key || ""}
          />
        ),
      })),
      {
        path: "data-quality-rating",
        element: <DataQualityRatingList />,
      },
      {
        path: "data-quality-rating/view",
        element: <DataQualityRating />,
      },
    ],
  },
]);
