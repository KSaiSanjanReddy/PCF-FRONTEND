import { FolderOpen } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

const Projects: React.FC = () => {
  return (
    <ComingSoon
      title="Projects"
      description="Manage company projects and tasks"
      icon={FolderOpen}
    />
  );
};

export default Projects;
