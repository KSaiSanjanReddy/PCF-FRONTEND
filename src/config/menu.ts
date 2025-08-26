import type { MenuItem } from "../types";


export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    id: 'visitor-management',
    title: 'Visitor Management',
    path: '/visitor-management',
    icon: 'Users',
  },
  {
    id: 'suite-management',
    title: 'Suite Management',
    path: '/suite-management',
    icon: 'Building2',
  },
  {
    id: 'bookings',
    title: 'Bookings',
    path: '/bookings',
    icon: 'Calendar',
  },
  {
    id: 'hardware-management',
    title: 'Hardware Management',
    path: '/hardware-management',
    icon: 'Server',
  },
  {
    id: 'documents-management',
    title: 'Documents Management',
    path: '/documents-management',
    icon: 'FileText',
  },
  {
    id: 'projects',
    title: 'Projects',
    path: '/projects',
    icon: 'FolderOpen',
  },
  {
    id: 'settings',
    title: 'Settings',
    path: '/settings',
    icon: 'Settings',
    children: [
      {
        id: 'user-info',
        title: 'User Info',
        path: '/settings',
        icon: 'User',
        children: [
          {
            id: 'users',
            title: 'Users',
            path: '/settings/users',
            icon: 'Users',
          },
          {
            id: 'roles-departments',
            title: 'Roles & Departments',
            path: '/settings/roles-departments',
            icon: 'Shield',
          },
          {
            id: 'employee-id',
            title: 'Employee ID',
            path: '/settings/employee-id',
            icon: 'IdCard',
          },
        ],
      },
      {
        id: 'authorization',
        title: 'Authorization',
        path: '/settings/authorization',
        icon: 'Lock',
      },
      {
        id: 'data-setup',
        title: 'Data Set Up',
        path: '/settings',
        icon: 'Database',
        children: [
          {
            id: 'accounts',
            title: 'Accounts',
            path: '/settings/accounts',
            icon: 'CreditCard',
          },
          {
            id: 'projects',
            title: 'Projects',
            path: '/settings/projects',
            icon: 'FolderOpen',
          },
          {
            id: 'hardware-type',
            title: 'Hardware Type',
            path: '/settings/hardware-type',
            icon: 'Server',
          },
        ],
      },
      {
        id: 'notification-communication',
        title: 'Notification and Communication',
        path: '/settings',
        icon: 'Bell',
        children: [
          {
            id: 'whatsapp',
            title: 'WhatsApp',
            path: '/settings/whatsapp',
            icon: 'MessageCircle',
          },
          {
            id: 'sms',
            title: 'SMS',
            path: '/settings/sms',
            icon: 'Smartphone',
          },
          {
            id: 'message-templates',
            title: 'Message Templates',
            path: '/settings/message-templates',
            icon: 'FileText',
          },
        ],
      },
      {
        id: 'alert-management',
        title: 'Alert Management',
        path: '/settings/alert-management',
        icon: 'AlertTriangle',
      },
      {
        id: 'vdocipher-settings',
        title: 'Vdocipher Settings',
        path: '/settings/vdocipher-settings',
        icon: 'Video',
      },
      {
        id: 'wifi-settings',
        title: 'Wifi Settings and Master',
        path: '/settings/wifi-settings',
        icon: 'Wifi',
      },
      {
        id: 'reports',
        title: 'Reports',
        path: '/settings/reports',
        icon: 'BarChart3',
      },
    ],
  },
];
