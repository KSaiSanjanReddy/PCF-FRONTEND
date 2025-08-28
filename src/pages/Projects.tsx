import { FolderOpen } from 'lucide-react';

const Projects: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600">Manage company projects and tasks</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Projects</h3>
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
};

export default Projects;
