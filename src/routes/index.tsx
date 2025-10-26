import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import VisitorManagement from "../pages/VisitorManagement";
import SuiteManagement from "../pages/SuiteManagement";
import Bookings from "../pages/Bookings";
import HardwareManagement from "../pages/HardwareManagement";
import DocumentsManagement from "../pages/DocumentsManagement";
import Projects from "../pages/Projects";
import Settings from "../pages/Settings";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import MFAVerification from "../pages/auth/MFAVerification";
import Users from "../pages/settings/Users";
import UsersCreate from "../pages/settings/UsersCreate";
import UsersEdit from "../pages/settings/UsersEdit";
import Products from "../pages/settings/Products";
import Components from "../pages/settings/Components";
import Industry from "../pages/settings/Industry";
import ProtectedRoute from "../components/ProtectedRoute";

// New pages
import PCFRequest from "../pages/PCFRequest";
import ProductPortfolio from "../pages/ProductPortfolio";
import AllProducts from "../pages/AllProducts";
import ActiveProjects from "../pages/ActiveProjects";
import ArchivedProjects from "../pages/ArchivedProjects";
import ComponentsMaster from "../pages/ComponentsMaster";
import DocumentMaster from "../pages/DocumentMaster";
import TaskManagement from "../pages/TaskManagement";
import ReportsMain from "../pages/Reports";
import SupplierQuestionnaire from "../pages/SupplierQuestionnaire";

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
        path: "pcf-request",
        element: <PCFRequest />,
      },
      {
        path: "product-portfolio",
        element: <ProductPortfolio />,
      },
      {
        path: "product-portfolio/all-products",
        element: <AllProducts />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "projects/active",
        element: <ActiveProjects />,
      },
      {
        path: "projects/archived",
        element: <ArchivedProjects />,
      },
      {
        path: "components-master",
        element: <ComponentsMaster />,
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
        path: "reports",
        element: <ReportsMain />,
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
        path: "settings/products",
        element: <Products />,
      },
      {
        path: "settings/components",
        element: <Components />,
      },
      {
        path: "settings/industry",
        element: <Industry />,
      },
      {
        path: "supplier-questionnaire",
        element: <SupplierQuestionnaire />,
      },
    ],
  },
]);
