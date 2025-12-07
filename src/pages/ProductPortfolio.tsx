import React from "react";
import { useNavigate } from "react-router-dom";
import { Package, Grid, Layers, Settings } from "lucide-react";

const ProductPortfolio: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "All Products",
      description: "View and manage your complete product catalog",
      icon: Package,
      path: "/product-portfolio/all-products",
      color: "bg-blue-50 text-blue-600",
    },
    // Future modules can be added here
    // {
    //   title: "Categories",
    //   description: "Manage product categories and sub-categories",
    //   icon: Layers,
    //   path: "/settings/products", // Assuming this exists or will exist
    //   color: "bg-purple-50 text-purple-600",
    // },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Product Portfolio</h1>
        <p className="text-gray-500 mt-1">Manage your products and catalog definitions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div
            key={item.title}
            onClick={() => navigate(item.path)}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {item.title}
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPortfolio;
