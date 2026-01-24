import { useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  Coins,
  Download,
  Filter,
  Info,
  Landmark,
  Save,
  Search,
  Settings,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import Sidebar, { type NavItem } from './Sidebar'

interface RefundManagementProps {
  onLogout: () => void
  userName?: string
  userRole?: string
}

// KPI card data
const kpiCards = [
  {
    label: 'Total Tokens Refunded',
    value: '1,240,000',
    icon: Coins,
    iconColor: 'text-blue-600',
    trend: '+5.2% from last month',
    trendUp: true,
    trendColor: 'text-red-500',
  },
  {
    label: 'Remaining Budget',
    value: '450,000',
    icon: Wallet,
    iconColor: 'text-green-500',
    progress: 70,
    progressLabel: '70% of monthly allocation used',
  },
  {
    label: 'Projected Overages',
    value: '+12,500',
    valueColor: 'text-amber-500',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    subtitle: 'Estimated for end of month',
    subtitleIcon: Calendar,
  },
]

// Recent refund activity data
const refundActivity = [
  {
    id: 1,
    initials: 'JD',
    name: 'John Doe',
    oderId: '48292',
    amount: '50,000',
    reason: 'AI Bug',
    date: '2h ago',
  },
  {
    id: 2,
    initials: 'AS',
    name: 'Alice Smith',
    oderId: '11093',
    amount: '120,000',
    reason: 'Service Downtime',
    date: '5h ago',
  },
  {
    id: 3,
    initials: 'MK',
    name: 'Mike Kaiser',
    oderId: '29901',
    amount: '25,000',
    reason: 'UX Issue',
    date: 'Yesterday',
  },
  {
    id: 4,
    initials: 'RL',
    name: 'Robert Low',
    oderId: '88721',
    amount: '80,000',
    reason: 'Billing Error',
    date: 'Oct 24, 2023',
  },
]

export default function RefundManagement({
  onLogout,
  userName = 'User',
  userRole = 'Admin',
}: RefundManagementProps) {
  const [activeNav, setActiveNav] = useState<NavItem>('settings')
  const [searchQuery, setSearchQuery] = useState('')
  const [refundLimit, setRefundLimit] = useState('100000')
  const [monthlyBudget, setMonthlyBudget] = useState('1500000')
  const [autoAlertsEnabled, setAutoAlertsEnabled] = useState(true)

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
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 placeholder-slate-400"
                placeholder="Search analytics..."
              />
            </div>
          </div>
          <button
            onClick={onLogout}
            className="ml-4 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Page Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-900">
                Refund Analytics & Budgeting
              </h2>
              <p className="text-slate-500">
                Monitor token refunds and manage automated financial limits for customer support.
              </p>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {kpiCards.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.label}
                    className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        {card.label}
                      </p>
                      <Icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                    <p className={`text-3xl font-bold mb-2 ${card.valueColor || 'text-slate-900'}`}>
                      {card.value}
                    </p>
                    {card.trend && (
                      <div
                        className={`flex items-center gap-1.5 text-sm font-medium ${card.trendColor}`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>{card.trend}</span>
                      </div>
                    )}
                    {card.progress !== undefined && (
                      <>
                        <div className="w-full bg-slate-100 h-2 rounded-full mb-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${card.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500">{card.progressLabel}</p>
                      </>
                    )}
                    {card.subtitle && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                        {card.subtitleIcon && <card.subtitleIcon className="w-4 h-4" />}
                        <span>{card.subtitle}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Table Section (Left 2/3) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-900">Recent Refund Activity</h3>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700">
                        <Filter className="w-4 h-4" /> Filter
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700">
                        <Download className="w-4 h-4" /> Export
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            User
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Reason
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {refundActivity.map((refund) => (
                          <tr key={refund.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                  {refund.initials}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {refund.name}
                                  </p>
                                  <p className="text-xs text-slate-500">ID: {refund.oderId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 font-medium text-slate-900">
                                <Coins className="w-4 h-4 text-blue-600" /> {refund.amount}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                                {refund.reason}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">{refund.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-slate-200 flex justify-center">
                    <button className="text-sm font-semibold text-blue-600 hover:underline">
                      View all refund history
                    </button>
                  </div>
                </div>
              </div>

              {/* Settings Panel (Right 1/3) */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-24">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <Settings className="w-5 h-5 text-blue-600" /> Budget Controls
                  </h3>
                  <div className="space-y-6">
                    {/* Setting 1 */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900">
                        Automated Refund Limit per User
                      </label>
                      <div className="relative">
                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="number"
                          value={refundLimit}
                          onChange={(e) => setRefundLimit(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Maximum tokens a support agent can refund without admin approval.
                      </p>
                    </div>

                    {/* Setting 2 */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900">
                        Total Monthly Budget
                      </label>
                      <div className="relative">
                        <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="number"
                          value={monthlyBudget}
                          onChange={(e) => setMonthlyBudget(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Global ceiling for all token refunds per billing cycle.
                      </p>
                    </div>

                    {/* Auto-Alert Toggle */}
                    <div className="flex items-center justify-between py-4 border-y border-slate-100">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Enable Auto-Alerts</p>
                        <p className="text-xs text-slate-500">Notify admins at 80% budget usage.</p>
                      </div>
                      <button
                        onClick={() => setAutoAlertsEnabled(!autoAlertsEnabled)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                          autoAlertsEnabled ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            autoAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Configuration
                    </button>

                    {/* Pro Tip */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                      <div className="flex gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-600 uppercase">Pro Tip</p>
                          <p className="text-xs text-slate-700 leading-relaxed mt-1">
                            Lowering the per-user limit usually reduces monthly overages by 15%.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-500 text-sm">
            <p>© 2024 Grounded Admin • Financial Controls Division</p>
          </footer>
        </div>
      </main>
    </div>
  )
}
