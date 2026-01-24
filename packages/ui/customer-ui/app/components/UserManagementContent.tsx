import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Pencil,
  Radio,
  Star,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from 'lucide-react'

// Stats data
const stats = [
  {
    label: 'Total Representatives',
    value: '24',
    icon: Users,
    iconColor: 'text-blue-600',
    trend: '+2%',
    trendUp: true,
  },
  {
    label: 'Currently Online',
    value: '18',
    icon: Radio,
    iconColor: 'text-emerald-500',
    trend: '+5%',
    trendUp: true,
  },
  {
    label: 'Avg. Team Rating',
    value: '4.8',
    icon: Star,
    iconColor: 'text-amber-400',
    trend: '+0.2',
    trendUp: true,
  },
]

// Representatives data
const representatives = [
  {
    id: 1,
    name: 'Alex Rivera',
    email: 'alex.r@company.com',
    initials: 'AR',
    status: 'online',
    activeChats: 7,
    maxChats: 10,
    rating: 4.9,
    role: 'Senior Support',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    email: 's.chen@company.com',
    initials: 'SC',
    status: 'away',
    activeChats: 4,
    maxChats: 10,
    rating: 4.7,
    role: 'Senior Support',
  },
  {
    id: 3,
    name: 'Michael Scott',
    email: 'm.scott@company.com',
    initials: 'MS',
    status: 'offline',
    activeChats: 0,
    maxChats: 10,
    rating: 3.2,
    role: 'Junior Support',
  },
  {
    id: 4,
    name: 'Jordan Smith',
    email: 'j.smith@company.com',
    initials: 'JS',
    status: 'online',
    activeChats: 10,
    maxChats: 10,
    rating: 4.8,
    role: 'Team Lead',
  },
]

const statusConfig = {
  online: {
    label: 'Online',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    dotColor: 'bg-emerald-500',
  },
  away: {
    label: 'Away',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    dotColor: 'bg-amber-500',
  },
  offline: {
    label: 'Offline',
    bgColor: 'bg-slate-200',
    textColor: 'text-slate-500',
    dotColor: 'bg-slate-400',
  },
}

export default function UserManagementContent() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [newRep, setNewRep] = useState({
    name: '',
    email: '',
    role: 'Senior Support',
    maxChats: '10',
  })

  const getWorkloadColor = (active: number, max: number) => {
    const percentage = (active / max) * 100
    if (percentage >= 100) {
      return 'bg-red-500'
    }
    if (percentage >= 70) {
      return 'bg-amber-500'
    }
    return 'bg-blue-600'
  }

  const handleAddRep = () => {
    // Handle adding new representative
    console.log('Adding new rep:', newRep)
    setShowAddModal(false)
    setNewRep({ name: '', email: '', role: 'Senior Support', maxChats: '10' })
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 text-base font-normal leading-normal">
            Monitor and manage your customer service team performance in real-time.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-11 px-5 bg-blue-600 text-white text-sm font-bold leading-normal tracking-wide hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <UserPlus className="w-5 h-5" />
          <span className="truncate">Add New Rep</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="flex flex-wrap gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex min-w-[240px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white"
            >
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm font-medium leading-normal">{stat.label}</p>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-slate-900 tracking-tight text-3xl font-bold leading-tight">
                  {stat.value}
                </p>
                <p className="text-emerald-500 text-sm font-bold leading-normal flex items-center gap-0.5">
                  <TrendingUp className="w-4 h-4" /> {stat.trend}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between px-4 pb-4">
        <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">
          Active Team Directory
        </h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Representative
                </th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Workload (Active Chats)
                </th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {representatives.map((rep) => {
                const status = statusConfig[rep.status as keyof typeof statusConfig]
                const workloadPercentage = (rep.activeChats / rep.maxChats) * 100
                const isOverloaded = workloadPercentage >= 100

                return (
                  <tr key={rep.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                          {rep.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-900 text-sm font-semibold">{rep.name}</span>
                          <span className="text-slate-400 text-xs">{rep.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bgColor} ${status.textColor} text-xs font-bold`}
                      >
                        <span className={`size-1.5 rounded-full ${status.dotColor}`}></span>
                        {status.label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 max-w-[160px]">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full ${getWorkloadColor(rep.activeChats, rep.maxChats)}`}
                            style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <span
                          className={`text-sm font-medium ${isOverloaded ? 'text-red-500 font-bold' : 'text-slate-900'}`}
                        >
                          {rep.activeChats}/{rep.maxChats}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-slate-900 text-sm font-bold">{rep.rating}</span>
                        <span className="text-slate-400 text-xs font-normal">/ 5.0</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
            Showing {representatives.length} of 24 representatives
          </p>
          <div className="flex gap-1">
            <button
              className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg border text-xs font-bold transition-colors ${
                  currentPage === page
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 transition-colors"
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Representative Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Add New Representative</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={newRep.name}
                    onChange={(e) => setNewRep({ ...newRep, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-slate-900"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={newRep.email}
                    onChange={(e) => setNewRep({ ...newRep, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-slate-900"
                    placeholder="john.doe@company.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Role</label>
                  <select
                    value={newRep.role}
                    onChange={(e) => setNewRep({ ...newRep, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-slate-900"
                  >
                    <option value="Junior Support">Junior Support</option>
                    <option value="Senior Support">Senior Support</option>
                    <option value="Team Lead">Team Lead</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Max Chat Capacity</label>
                  <input
                    type="number"
                    value={newRep.maxChats}
                    onChange={(e) => setNewRep({ ...newRep, maxChats: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-slate-900"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  onClick={handleAddRep}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Save Representative
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
