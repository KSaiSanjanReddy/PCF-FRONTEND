import { Grid } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

const AllProducts: React.FC = () => {
  return (
    <ComingSoon
      title="All Products"
      description="View and manage all products in the portfolio"
      icon={Grid}
    />
  );
};

export default AllProducts;
