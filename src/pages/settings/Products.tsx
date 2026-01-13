import DataSetupTabs from "./DataSetupTabs";

const Products = () => {
  return (
    <DataSetupTabs
      title="Product Setup Data"
      description="Define main categories for your products."
      tabs={[
        {
          key: "type",
          label: "Product Type",
          entity: "product-type",
        },
        {
          key: "category",
          label: "Product Category",
          entity: "product-category",
        },
        {
          key: "subcategory",
          label: "Product Sub-Category",
          entity: "product-sub-category",
        },
      ]}
      defaultTab="type"
    />
  );
};

export default Products;
