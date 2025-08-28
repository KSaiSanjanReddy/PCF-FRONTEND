import { Users, Building2, Calendar, Server, FileText, FolderOpen } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Visitors',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Suites',
      value: '45',
      change: '+5%',
      changeType: 'positive',
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      title: 'Today\'s Bookings',
      value: '23',
      change: '+8%',
      changeType: 'positive',
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      title: 'Hardware Items',
      value: '156',
      change: '-2%',
      changeType: 'negative',
      icon: Server,
      color: 'bg-orange-500',
    },
    {
      title: 'Documents',
      value: '89',
      change: '+15%',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-indigo-500',
    },
    {
      title: 'Active Projects',
      value: '12',
      change: '+3%',
      changeType: 'positive',
      icon: FolderOpen,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your ViPLave Edit Works dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New visitor registered - John Smith</span>
              <span className="text-xs text-gray-400">2 minutes ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Suite 101 booked for tomorrow</span>
              <span className="text-xs text-gray-400">15 minutes ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Hardware maintenance completed</span>
              <span className="text-xs text-gray-400">1 hour ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New project created - Website Redesign</span>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Add Visitor</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Building2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Book Suite</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Server className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Hardware</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Upload Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
