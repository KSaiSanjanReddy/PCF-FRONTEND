import { Package } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

const ProductPortfolio: React.FC = () => {
  return (
    <ComingSoon
      title="Product Portfolio"
      description="Manage and organize product portfolio and catalog"
      icon={Package}
    />
  );
};

export default ProductPortfolio;
