import { CheckSquare } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

const TaskManagement: React.FC = () => {
  return (
    <ComingSoon
      title="Task Management"
      description="Organize and track tasks and project activities"
      icon={CheckSquare}
    />
  );
};

export default TaskManagement;
