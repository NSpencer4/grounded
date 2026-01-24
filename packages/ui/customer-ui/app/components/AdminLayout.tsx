import { useState } from 'react'
import { Bell, HelpCircle, Search } from 'lucide-react'
import Sidebar, { type NavItem } from './Sidebar'
import DashboardContent from './DashboardContent'
import RefundManagementContent from './RefundManagementContent'
import UserManagementContent from './UserManagementContent'
import TeamPerformanceContent from './TeamPerformanceContent'
import RepChatView from './RepChatView'

interface AdminLayoutProps {
  onLogout: () => void
  userName?: string
  userRole?: string
}

export default function AdminLayout({
  onLogout,
  userName = 'User',
  userRole = 'Admin',
}: AdminLayoutProps) {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  // If chat-history is selected, render the full RepChatView
  if (activeNav === 'chat-history') {
    return (
      <RepChatView
        onLogout={onLogout}
        userName={userName}
        onBack={() => setActiveNav('dashboard')}
      />
    )
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardContent />
      case 'team-performance':
        return <TeamPerformanceContent />
      case 'user-management':
        return <UserManagementContent />
      case 'refund-management':
        return <RefundManagementContent />
      case 'settings':
        return (
          <PlaceholderContent
            title="Settings"
            description="Configure system preferences and account settings."
          />
        )
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeItem={activeNav}
        onNavigate={setActiveNav}
        userName={userName}
        userRole={userRole}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-slate-50 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 placeholder-slate-400"
                placeholder="Search conversations, users, or tickets..."
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-slate-50"></span>
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Status: Online</span>
              <div className="size-2.5 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <button
              onClick={onLogout}
              className="ml-4 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </main>
    </div>
  )
}

// Placeholder component for pages not yet implemented
function PlaceholderContent({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <div className="text-slate-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Coming Soon</h3>
        <p className="text-slate-500 text-sm">This page is under construction.</p>
      </div>
    </div>
  )
}
