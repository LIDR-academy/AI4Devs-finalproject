import {
    BarChart3,
    FileText,
    GitCompare,
    Home,
    Plus,
    Upload
} from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar: React.FC = () => {
  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: Home,
    },
    {
      label: 'Templates',
      path: '/templates',
      icon: FileText,
      children: [
        {
          label: 'All Templates',
          path: '/templates',
          icon: FileText,
        },
        {
          label: 'Upload Template',
          path: '/analyze',
          icon: Upload,
        },
      ],
    },
    {
      label: 'Comparisons',
      path: '/comparisons',
      icon: GitCompare,
      children: [
        {
          label: 'All Comparisons',
          path: '/comparisons',
          icon: GitCompare,
        },
        {
          label: 'New Comparison',
          path: '/comparisons/create',
          icon: Plus,
        },
      ],
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
    },
  ]

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <div key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>

            {/* Sub-navigation */}
            {item.children && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200'
                      }`
                    }
                  >
                    <child.icon className="w-4 h-4" />
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
