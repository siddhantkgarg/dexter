import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  UsersIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  BookOpenIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon,
  TagIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Parents & Children', href: '/parents', icon: UsersIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Content Management', href: '/content', icon: DocumentTextIcon, disabled: true },
  { name: 'Lessons', href: '/lessons', icon: BookOpenIcon, disabled: true },
  { name: 'Prompts', href: '/prompts', icon: CodeBracketIcon },
  { name: 'System Status', href: '/status', icon: ExclamationTriangleIcon, disabled: true },
  { name: 'Release Notes', href: '/releases', icon: TagIcon, disabled: true },
]

export default function Layout({ setIsAuthenticated }) {
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="flex flex-col h-screen">
            <div className="flex items-center h-16 px-4 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900">Omli Dashboard</h1>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                
                if (item.disabled) {
                  return (
                    <div
                      key={item.name}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                      <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Coming Soon</span>
                    </div>
                  )
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}