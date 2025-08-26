import { Building2 } from 'lucide-react';

const SuiteManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suite Management</h1>
        <p className="text-gray-600">Manage office suites, availability, and configurations</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Suite Management</h3>
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
};

export default SuiteManagement;
