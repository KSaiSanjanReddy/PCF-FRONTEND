import React, { useState } from "react";
import { Row, Col, Space } from "antd";
import {
  DownOutlined,
  RightOutlined,
  ShopOutlined,
  UserOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

interface BomTableProps {
  bomData: any[];
  readOnly?: boolean;
}

const BomTable: React.FC<BomTableProps> = ({ bomData, readOnly = false }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (key: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(key)) {
      newExpandedRows.delete(key);
    } else {
      newExpandedRows.add(key);
    }
    setExpandedRows(newExpandedRows);
  };

  const calculateTotals = () => {
    return bomData.reduce(
      (acc, item) => {
        const weight = parseFloat(item.totalWeight || item.weight || "0");
        const cost = parseFloat(item.totalPrice || item.price || "0");
        const emission = parseFloat(item.emission || "0");

        return {
          totalWeight: acc.totalWeight + (isNaN(weight) ? 0 : weight),
          totalCost: acc.totalCost + (isNaN(cost) ? 0 : cost),
          totalEmission: acc.totalEmission + (isNaN(emission) ? 0 : emission),
        };
      },
      { totalWeight: 0, totalCost: 0, totalEmission: 0 }
    );
  };

  const totals = calculateTotals();

  if (bomData.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg border-dashed">
        <p className="text-gray-500 mb-4">No BOM data available</p>
      </div>
    );
  }

  return (
    <div
      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col"
      style={{ height: "500px" }}
    >
      {/* Sticky Table Header */}
      <div className="bg-green-500 border-b border-green-100 px-6 py-4 sticky top-0 z-10 flex-shrink-0">
        <Row className="font-semibold text-xs text-white uppercase tracking-wider">
          <Col span={6} className="pl-8">
            Component Name
          </Col>
          <Col span={4}>Material Number</Col>
          <Col span={2} className="text-center">
            Qty
          </Col>
          <Col span={3} className="text-right">
            Total Weight (g)
          </Col>
          <Col span={3} className="text-right">
            Total Price
          </Col>
          <Col span={3} className="text-right">
            Emission
          </Col>
          <Col span={3} className="text-center">
            Status
          </Col>
        </Row>
      </div>

      {/* Scrollable Table Body */}
      <div className="bg-white divide-y divide-gray-100 flex-1 overflow-y-auto">
        {bomData.map((item) => {
          const isExpanded = expandedRows.has(item.key || item.id);
          return (
            <div key={item.key || item.id} className="transition-colors duration-200">
              {/* Main Row */}
              <div
                className={`px-6 py-4 cursor-pointer hover:bg-green-50/50 ${
                  isExpanded
                    ? "bg-green-50 border-l-4 border-green-500 pl-5"
                    : "border-l-4 border-transparent pl-5"
                }`}
                onClick={() => toggleRowExpansion(item.key || item.id)}
              >
                <Row align="middle" className="text-sm">
                  <Col span={6} className="!flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                        isExpanded
                          ? "bg-green-200 text-green-700"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {isExpanded ? (
                        <DownOutlined style={{ fontSize: "10px" }} />
                      ) : (
                        <RightOutlined style={{ fontSize: "10px" }} />
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        isExpanded ? "text-green-900" : "text-gray-900"
                      }`}
                    >
                      {item.componentName || "-"}
                    </span>
                  </Col>
                  <Col span={4}>
                    <span className="text-gray-600">
                      {item.materialNumber || "-"}
                    </span>
                  </Col>
                  <Col span={2} className="text-center">
                    <span className="text-gray-900">
                      {item.quantity || "-"}
                    </span>
                  </Col>
                  <Col span={3} className="text-right">
                    <span className="text-gray-900">
                      {parseFloat(
                        item.totalWeight || item.weight || "0"
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </Col>
                  <Col span={3} className="text-right">
                    <span className="text-gray-900">
                      ₹{" "}
                      {parseFloat(
                        item.totalPrice || item.price || "0"
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </Col>
                  <Col span={3} className="text-right">
                    <span className="text-gray-900">
                      {item.emission
                        ? parseFloat(item.emission).toLocaleString("en-US", {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                          })
                        : "-"}
                    </span>
                  </Col>
                  <Col span={3} className="text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.questionerStatus === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.questionerStatus || "Pending"}
                    </span>
                  </Col>
                </Row>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 bg-green-50/30 border-t border-green-100">
                  <Row gutter={[24, 24]}>
                    {/* Component Details Card */}
                    <Col span={8}>
                      <div className="bg-white p-5 rounded-lg border border-gray-200 h-full border-l-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center">
                            <ShopOutlined className="text-green-600 text-lg" />
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 m-0">
                            Component Details
                          </h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Category:</span>
                            <span className="text-gray-900 font-medium">
                              {item.category || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Description:</span>
                            <span
                              className="text-gray-900 font-medium text-right max-w-[200px] truncate"
                              title={item.detailedDescription}
                            >
                              {item.detailedDescription || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Location:</span>
                            <span className="text-gray-900 font-medium">
                              {item.productionLocation || "Ningbo, China"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Manufacturer:</span>
                            <span className="text-gray-900 font-medium">
                              {item.manufacturer || "TechComponents Ltd"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>

                    {/* Supplier Card */}
                    <Col span={8}>
                      <div className="bg-white p-5 rounded-lg border border-gray-200 h-full border-l-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center">
                            <UserOutlined className="text-green-600 text-lg" />
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 m-0">
                            Supplier
                          </h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Supplier Name</span>
                            <span className="text-gray-900 font-medium">
                              {item.supplierName || "ABCDEF"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">
                              Supplier Questioner
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.questionerStatus === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {item.questionerStatus || "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>

                    {/* Emissions Breakdown Card */}
                    <Col span={8}>
                      <div className="bg-white p-5 rounded-lg border border-gray-200 h-full border-l-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center">
                            <EnvironmentOutlined className="text-green-600 text-lg" />
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 m-0">
                            Emissions Breakdown
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Materials:</span>
                            <span className="text-gray-900 font-medium">
                              {(
                                parseFloat(item.emission || "0") * 0.5
                              ).toFixed(3)}{" "}
                              kg
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Packaging:</span>
                            <span className="text-gray-900 font-medium">
                              {(
                                parseFloat(item.emission || "0") * 0.2
                              ).toFixed(3)}{" "}
                              kg
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Production:</span>
                            <span className="text-gray-900 font-medium">
                              {(
                                parseFloat(item.emission || "0") * 0.2
                              ).toFixed(3)}{" "}
                              kg
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Waste:</span>
                            <span className="text-gray-900 font-medium">
                              {(
                                parseFloat(item.emission || "0") * 0.2
                              ).toFixed(3)}{" "}
                              kg
                            </span>
                          </div>
                          <div className="flex justify-between col-span-2">
                            <span className="text-gray-500">Logistics:</span>
                            <span className="text-gray-900 font-medium">
                              {(
                                parseFloat(item.emission || "0") * 0.29
                              ).toFixed(3)}{" "}
                              kg
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Footer Totals */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 sticky bottom-0 z-10 flex-shrink-0">
        <Row justify="space-between" align="middle">
          <Col>
            <span className="text-gray-600 font-medium">
              Total:{" "}
              <span className="text-gray-900">
                {bomData.length} Components
              </span>
            </span>
          </Col>
          <Col>
            <Space size="large">
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  Total Weight
                </div>
                <div className="font-semibold text-gray-900">
                  {totals.totalWeight.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  g
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  Total Cost
                </div>
                <div className="font-semibold text-gray-900">
                  ₹{" "}
                  {totals.totalCost.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  Total Emission
                </div>
                <div className="font-semibold text-gray-900">
                  {totals.totalEmission.toLocaleString("en-US", {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })}{" "}
                  kgCO₂e
                </div>
              </div>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BomTable;
