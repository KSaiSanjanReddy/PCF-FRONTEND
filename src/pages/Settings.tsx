import { Outlet, NavLink } from 'react-router-dom';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  const settingsNav = [
    {
      title: 'User Info',
      items: [
        { name: 'Users', path: '/settings/users' },
        { name: 'Roles & Departments', path: '/settings/roles-departments' },
        { name: 'Employee ID', path: '/settings/employee-id' },
      ],
    },
    {
      title: 'System',
      items: [
        { name: 'Authorization', path: '/settings/authorization' },
        { name: 'Data Set Up', path: '/settings/accounts' },
        { name: 'Notification & Communication', path: '/settings/whatsapp' },
        { name: 'Alert Management', path: '/settings/alert-management' },
        { name: 'Vdocipher Settings', path: '/settings/vdocipher-settings' },
        { name: 'Wifi Settings', path: '/settings/wifi-settings' },
        { name: 'Reports', path: '/settings/reports' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure system settings and user management</p>
      </div>

      <div className="flex space-x-6">
        {/* Settings Navigation */}
        <div className="w-64 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />
              Settings
            </h3>
          </div>
          <nav className="p-4 space-y-6">
            {settingsNav.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `block px-3 py-2 text-sm rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Settings;
