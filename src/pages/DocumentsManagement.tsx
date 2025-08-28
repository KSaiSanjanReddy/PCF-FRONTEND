import { FileText } from 'lucide-react';

const DocumentsManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents Management</h1>
        <p className="text-gray-600">Manage and organize documents</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Documents Management</h3>
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
};

export default DocumentsManagement;
