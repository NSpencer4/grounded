import {
  BarChart3,
  Bot,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'

export type NavItem =
  | 'dashboard'
  | 'chat-history'
  | 'team-performance'
  | 'user-management'
  | 'refund-management'
  | 'ai-agents'
  | 'settings'

interface SidebarProps {
  activeItem?: NavItem
  onNavigate?: (item: NavItem) => void
  userName?: string
  userRole?: string
  userAvatar?: string
}

const navItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chat-history', label: 'Chat History', icon: MessageSquare },
  { id: 'team-performance', label: 'Team Performance', icon: BarChart3 },
  { id: 'user-management', label: 'User Management', icon: Users },
  { id: 'refund-management', label: 'Refund Analytics', icon: Receipt },
  { id: 'ai-agents', label: 'AI Agents', icon: Bot },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({
  activeItem = 'dashboard',
  onNavigate,
  userName = 'User',
  userRole = 'Support',
  userAvatar,
}: SidebarProps) {
  const handleNavClick = (item: NavItem) => {
    onNavigate?.(item)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <aside className="w-64 border-r border-slate-200 flex flex-col h-screen sticky top-0 bg-slate-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 size-8 rounded flex items-center justify-center text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Grounded</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600/10 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 mt-auto border-t border-slate-200">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-100">
          {userAvatar ? (
            <div
              className="size-10 rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url("${userAvatar}")` }}
            />
          ) : (
            <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(userName)}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500 truncate">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
