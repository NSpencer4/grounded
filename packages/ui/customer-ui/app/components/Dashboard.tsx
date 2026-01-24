import { useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CreditCard,
  FileText,
  HelpCircle,
  MessageCircle,
  PlusCircle,
  Search,
  Timer,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'
import Sidebar, { type NavItem } from './Sidebar'

interface DashboardProps {
  onLogout: () => void
  userName?: string
  userRole?: string
}

// Stats card data
const statsCards = [
  {
    label: 'Active Chats',
    value: '142',
    icon: MessageCircle,
    iconColor: 'text-blue-600',
    trend: '+12% vs last hour',
    trendUp: true,
  },
  {
    label: 'Avg. Response Time',
    value: '1.4m',
    icon: Timer,
    iconColor: 'text-orange-500',
    trend: '-5% from avg',
    trendUp: false,
  },
  {
    label: 'Escalation Rate',
    value: '8.2%',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    trend: '-2% from yesterday',
    trendUp: false,
  },
  {
    label: 'AI Resolution Rate',
    value: '64%',
    icon: Zap,
    iconColor: 'text-purple-500',
    trend: '+8% improvement',
    trendUp: true,
  },
]

// Escalations data
const escalations = [
  {
    id: 1,
    initials: 'AR',
    name: 'Alex Rivera',
    plan: 'Pro Plan User',
    issue: 'Billing mismatch on domain mapping renewal',
    status: 'Urgent',
    statusColor: 'bg-red-100 text-red-600',
    waitTime: '12m',
  },
  {
    id: 2,
    initials: 'SC',
    name: 'Sarah Chen',
    plan: 'Free Tier',
    issue: 'AI generation stalling at 90% for landing page',
    status: 'High',
    statusColor: 'bg-orange-100 text-orange-600',
    waitTime: '24m',
  },
  {
    id: 3,
    initials: 'JD',
    name: 'John Doe',
    plan: 'Enterprise',
    issue: 'SSO integration failure with Okta',
    status: 'Normal',
    statusColor: 'bg-blue-100 text-blue-600',
    waitTime: '45m',
  },
]

export default function Dashboard({
  onLogout,
  userName = 'User',
  userRole = 'Support',
}: DashboardProps) {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

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

        {/* Dashboard Body */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1">
          {/* Summary Header */}
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Support Overview</h2>
              <p className="text-slate-500 text-sm">
                Real-time performance metrics for the last 24 hours.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-100 text-slate-700">
                Export Report
              </button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                View Live Queue
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white border border-slate-200 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
                  <p
                    className={`text-sm font-medium mt-1 flex items-center gap-1 ${
                      stat.trendUp ? 'text-emerald-500' : 'text-orange-500'
                    }`}
                  >
                    {stat.trendUp ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {stat.trend}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Charts & Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">Chat Volume Trends</p>
                  <h3 className="text-xl font-bold text-slate-900">5,240 Total Sessions</h3>
                </div>
                <select className="bg-slate-100 border-none text-xs font-semibold rounded-lg px-3 py-1.5 focus:ring-blue-600 text-slate-700">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="h-64 w-full relative">
                {/* Chart SVG */}
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 Q15,75 25,40 T50,55 T75,30 T100,20 V100 H0 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M0,80 Q15,75 25,40 T50,55 T75,30 T100,20"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                  />
                </svg>
                <div className="flex justify-between mt-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <p key={day} className="text-xs font-bold text-slate-500">
                      {day}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Tracker Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Refund Budget</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                        Used this month
                      </p>
                      <p className="text-2xl font-bold text-slate-900">$4,200.00</p>
                    </div>
                    <p className="text-slate-500 text-sm">of $10,000</p>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed italic">
                    42% of monthly budget consumed. At current rate, you will finish at $9,450.
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="text-sm font-semibold mb-3 text-slate-900">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="text-[10px] font-bold uppercase text-slate-600">Policy</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                    <PlusCircle className="w-4 h-4 text-slate-600" />
                    <span className="text-[10px] font-bold uppercase text-slate-600">Increase</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Escalations Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Recent Escalations</h3>
              <button className="text-blue-600 text-sm font-semibold hover:underline">
                View All Tickets
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Issue Description</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Wait Time</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {escalations.map((escalation) => (
                    <tr key={escalation.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                            {escalation.initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {escalation.name}
                            </p>
                            <p className="text-xs text-slate-500">{escalation.plan}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm max-w-xs truncate text-slate-700">
                        {escalation.issue}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${escalation.statusColor}`}
                        >
                          {escalation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{escalation.waitTime}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 font-semibold text-sm hover:underline">
                          Jump to Chat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
