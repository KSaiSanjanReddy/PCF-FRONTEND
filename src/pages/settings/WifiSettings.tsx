import { Wifi } from 'lucide-react';

const WifiSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Wifi Settings and Master</h2>
        <p className="text-gray-600">Configure wifi networks and access</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Wifi className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Wifi Settings</h3>
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
};

export default WifiSettingsPage;
