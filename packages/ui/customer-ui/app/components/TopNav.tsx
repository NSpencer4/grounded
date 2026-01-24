import { useState } from 'react'
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
} from 'lucide-react'

export type NavItem =
  | 'dashboard'
  | 'chat-history'
  | 'team-performance'
  | 'user-management'
  | 'settings'

interface TopNavProps {
  activeItem?: NavItem
  onNavigate?: (item: NavItem) => void
  onLogout: () => void
}

const navItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chat-history', label: 'Chat History', icon: MessageSquare },
  { id: 'team-performance', label: 'Team Performance', icon: BarChart3 },
  { id: 'user-management', label: 'User Management', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function TopNav({ activeItem = 'dashboard', onNavigate, onLogout }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = (item: NavItem) => {
    onNavigate?.(item)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">Grounded</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Desktop Logout */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
            <div className="border-t border-slate-200 pt-3 mt-3">
              <button
                onClick={onLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
