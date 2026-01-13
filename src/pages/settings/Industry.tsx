import DataSetupTabs from "./DataSetupTabs";

const Industry = () => {
  return (
    <DataSetupTabs
      title="Industry Setup Data"
      description="Define sub-categories within main product groups."
      tabs={[
        {
          key: "type",
          label: "Industry Type",
          entity: "industry",
        },
        {
          key: "category",
          label: "Industry Category",
          entity: "industry",
        },
      ]}
      defaultTab="type"
    />
  );
};

export default Industry;
