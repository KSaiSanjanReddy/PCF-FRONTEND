import { Home } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

const Dashboard: React.FC = () => {
  return (
    <ComingSoon
      title="Dashboard"
      description="View and manage the dashboard"
      icon={Home}
    />
  );
};

export default Dashboard;
