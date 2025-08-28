import { FileText } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

const PCFRequest: React.FC = () => {
  return (
    <ComingSoon
      title="PCF Request"
      description="Manage Product Carbon Footprint requests and submissions"
      icon={FileText}
    />
  );
};

export default PCFRequest;
