import { FileText } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

const DocumentMaster: React.FC = () => {
  return (
    <ComingSoon
      title="Document Master"
      description="Centralized document management and organization"
      icon={FileText}
    />
  );
};

export default DocumentMaster;
