import { CreditCard } from 'lucide-react';

const AccountsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Accounts</h2>
        <p className="text-gray-600">Manage system accounts</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accounts Management</h3>
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
};

export default AccountsPage;
