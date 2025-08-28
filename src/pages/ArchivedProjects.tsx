import { Archive } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

const ArchivedProjects: React.FC = () => {
  return (
    <ComingSoon
      title="Archived Projects"
      description="View and manage archived and completed projects"
      icon={Archive}
    />
  );
};

export default ArchivedProjects;
