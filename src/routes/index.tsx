import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import VisitorManagement from '../pages/VisitorManagement';
import SuiteManagement from '../pages/SuiteManagement';
import Bookings from '../pages/Bookings';
import HardwareManagement from '../pages/HardwareManagement';
import DocumentsManagement from '../pages/DocumentsManagement';
import Projects from '../pages/Projects';
import Settings from '../pages/Settings';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import MFAVerification from '../pages/auth/MFAVerification';
import Users from '../pages/settings/Users';
import UsersCreate from '../pages/settings/UsersCreate';
import UsersEdit from '../pages/settings/UsersEdit';
import Roles from '../pages/settings/Roles';
import Department from '../pages/settings/Department';
import RolesDepartments from '../pages/settings/RolesDepartments';
import EmployeeId from '../pages/settings/EmployeeId';
import Authorization from '../pages/settings/Authorization';
import Accounts from '../pages/settings/Accounts';
import HardwareType from '../pages/settings/HardwareType';
import WhatsApp from '../pages/settings/WhatsApp';
import SMS from '../pages/settings/SMS';
import MessageTemplates from '../pages/settings/MessageTemplates';
import AlertManagement from '../pages/settings/AlertManagement';
import VdocipherSettings from '../pages/settings/VdocipherSettings';
import WifiSettings from '../pages/settings/WifiSettings';
import Reports from '../pages/settings/Reports';
import ProtectedRoute from '../components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/mfa-verification',
    element: <MFAVerification />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'visitor-management',
        element: <VisitorManagement />,
      },
      {
        path: 'suite-management',
        element: <SuiteManagement />,
      },
      {
        path: 'bookings',
        element: <Bookings />,
      },
      {
        path: 'hardware-management',
        element: <HardwareManagement />,
      },
      {
        path: 'documents-management',
        element: <DocumentsManagement />,
      },
      {
        path: 'projects',
        element: <Projects />,
      },
      {
        path: 'settings',
        element: <Settings />,
        children: [
          {
            path: 'users',
            element: <Users />,
          },
          {
            path: 'users/create',
            element: <UsersCreate />,
          },
          {
            path: 'users/edit/:userId',
            element: <UsersEdit />,
          },
          {
            path: 'roles',
            element: <Roles />,
          },
          {
            path: 'department',
            element: <Department />,
          },
          {
            path: 'roles-departments',
            element: <RolesDepartments />,
          },
          {
            path: 'employee-id',
            element: <EmployeeId />,
          },
          {
            path: 'authorization',
            element: <Authorization />,
          },
          {
            path: 'accounts',
            element: <Accounts />,
          },
          {
            path: 'hardware-type',
            element: <HardwareType />,
          },
          {
            path: 'whatsapp',
            element: <WhatsApp />,
          },
          {
            path: 'sms',
            element: <SMS />,
          },
          {
            path: 'message-templates',
            element: <MessageTemplates />,
          },
          {
            path: 'alert-management',
            element: <AlertManagement />,
          },
          {
            path: 'vdocipher-settings',
            element: <VdocipherSettings />,
          },
          {
            path: 'wifi-settings',
            element: <WifiSettings />,
          },
          {
            path: 'reports',
            element: <Reports />,
          },
        ],
      },
    ],
  },
]);
