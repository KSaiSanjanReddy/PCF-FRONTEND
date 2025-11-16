import type { MenuItem } from "../types";

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    id: "pcf-request",
    title: "PCF Request",
    path: "/pcf-request",
    icon: "FileText",
  },
  {
    id: "product-portfolio",
    title: "Product Portfolio",
    path: "/product-portfolio",
    icon: "Package",
    children: [
      {
        id: "all-products",
        title: "All Products",
        path: "/product-portfolio/all-products",
        icon: "Grid",
      },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    path: "/projects",
    icon: "FolderOpen",
    children: [
      {
        id: "active-projects",
        title: "Active Projects",
        path: "/projects/active",
        icon: "PlayCircle",
      },
      {
        id: "archived-projects",
        title: "Archived",
        path: "/projects/archived",
        icon: "Archive",
      },
    ],
  },
  {
    id: "components-master",
    title: "Components Master",
    path: "/components-master",
    icon: "Puzzle",
  },
  {
    id: "document-master",
    title: "Document Master",
    path: "/document-master",
    icon: "FileText",
  },
  {
    id: "task-management",
    title: "Task Management",
    path: "/task-management",
    icon: "CheckSquare",
  },
  {
    id: "reports",
    title: "Reports",
    path: "/reports",
    icon: "BarChart3",
  },
  {
    id: "supplier-questionnaire",
    title: "Supplier Questionnaire",
    path: "/supplier-questionnaire",
    icon: "ClipboardList",
  },
  {
    id: "data-quality-rating",
    title: "Data Quality Rating",
    path: "/data-quality-rating",
    icon: "Star",
  },
  {
    id: "settings",
    title: "Settings",
    path: "/settings",
    icon: "Settings",
  },
];
