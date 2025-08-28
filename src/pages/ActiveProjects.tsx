import { PlayCircle } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

const ActiveProjects: React.FC = () => {
  return (
    <ComingSoon
      title="Active Projects"
      description="View and manage currently active projects"
      icon={PlayCircle}
    />
  );
};

export default ActiveProjects;
