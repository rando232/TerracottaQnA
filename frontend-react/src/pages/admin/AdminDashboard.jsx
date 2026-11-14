import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon,
  DocumentTextIcon,
  FlagIcon,
  ChartBarIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  CogIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const allowedRoles = ['super_admin', 'content_manager', 'moderator', 'data_seo_specialist'];
    if (user && !allowedRoles.includes(user.role)) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const adminModules = [
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: UserGroupIcon,
      link: '/admin/users',
      color: 'red',
      roles: ['super_admin']
    },
    {
      title: 'Content Management',
      description: 'Manage content, categories, tags, and publication status',
      icon: DocumentTextIcon,
      link: '/admin/content',
      color: 'blue',
      roles: ['super_admin', 'content_manager']
    },
    {
      title: 'Moderation',
      description: 'Review comments, handle flags, and manage spam',
      icon: FlagIcon,
      link: '/admin/moderation',
      color: 'yellow',
      roles: ['super_admin', 'moderator']
    },
    {
      title: 'SEO & Analytics',
      description: 'Configure SEO metadata and monitor analytics',
      icon: ChartBarIcon,
      link: '/admin/seo',
      color: 'green',
      roles: ['super_admin', 'data_seo_specialist']
    },
    {
      title: 'Database Viewer',
      description: 'View all database tables and export data',
      icon: CircleStackIcon,
      link: '/database',
      color: 'purple',
      roles: ['super_admin']
    }
  ];

  const availableModules = adminModules.filter(module => 
    user && module.roles.includes(user.role)
  );

  const colorClasses = {
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="w-10 h-10 text-primary-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name || user?.username}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Your Role:</span>{' '}
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                user?.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                user?.role === 'content_manager' ? 'bg-blue-100 text-blue-800' :
                user?.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                user?.role === 'data_seo_specialist' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user?.role}
              </span>
            </p>
          </div>
        </div>

        {/* Admin Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.link}
                to={module.link}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-lg ${colorClasses[module.color]} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-sm text-gray-600">{module.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Role Descriptions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Role Responsibilities</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium mr-3 mt-0.5">Super Admin</span>
              <span className="text-gray-600">Manage user accounts/roles, assign permissions, view system logs, configure global settings</span>
            </div>
            <div className="flex items-start">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mr-3 mt-0.5">Content Manager</span>
              <span className="text-gray-600">Full CRUD on content, publication status, taxonomy management (categories, tags)</span>
            </div>
            <div className="flex items-start">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium mr-3 mt-0.5">Moderator</span>
              <span className="text-gray-600">Review user-generated comments/posts, handle flags/reports, spam control</span>
            </div>
            <div className="flex items-start">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium mr-3 mt-0.5">Data & SEO Specialist</span>
              <span className="text-gray-600">Configure SEO metadata (titles, descriptions, alt text, keywords), monitor analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
