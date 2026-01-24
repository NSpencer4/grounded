import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Flame,
  Medal,
  MessageSquare,
  Star,
  Target,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'

// Time range options
const timeRanges = ['Today', 'This Week', 'This Month', 'This Quarter']

// KPI data
const kpis = [
  {
    label: 'Avg. Response Time',
    value: '1.2m',
    change: '-18%',
    changeType: 'positive',
    icon: Clock,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    description: 'vs last period',
  },
  {
    label: 'First Contact Resolution',
    value: '78%',
    change: '+5%',
    changeType: 'positive',
    icon: CheckCircle,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    description: 'vs last period',
  },
  {
    label: 'Customer Satisfaction',
    value: '4.6',
    change: '+0.3',
    changeType: 'positive',
    icon: ThumbsUp,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    description: 'out of 5.0',
  },
  {
    label: 'Tickets Resolved',
    value: '1,247',
    change: '+12%',
    changeType: 'positive',
    icon: MessageSquare,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    description: 'this period',
  },
]

// Leaderboard data
const leaderboard = [
  {
    rank: 1,
    name: 'Alex Rivera',
    initials: 'AR',
    score: 98.5,
    tickets: 187,
    avgTime: '0.8m',
    csat: 4.9,
    streak: 12,
  },
  {
    rank: 2,
    name: 'Jordan Smith',
    initials: 'JS',
    score: 96.2,
    tickets: 165,
    avgTime: '1.1m',
    csat: 4.8,
    streak: 8,
  },
  {
    rank: 3,
    name: 'Sarah Chen',
    initials: 'SC',
    score: 94.8,
    tickets: 152,
    avgTime: '1.3m',
    csat: 4.7,
    streak: 5,
  },
]

// Performance categories
const categories = [
  { label: 'Technical Issues', value: 342, percentage: 35, color: 'bg-blue-500' },
  { label: 'Billing & Payments', value: 256, percentage: 26, color: 'bg-emerald-500' },
  { label: 'Account Management', value: 198, percentage: 20, color: 'bg-amber-500' },
  { label: 'Feature Requests', value: 124, percentage: 13, color: 'bg-purple-500' },
  { label: 'Other', value: 58, percentage: 6, color: 'bg-slate-400' },
]

// Team members detailed performance
const teamPerformance = [
  {
    name: 'Alex Rivera',
    initials: 'AR',
    role: 'Senior Support',
    ticketsHandled: 187,
    avgResponseTime: '0.8m',
    resolutionRate: 94,
    csat: 4.9,
    trend: 'up',
  },
  {
    name: 'Jordan Smith',
    initials: 'JS',
    role: 'Team Lead',
    ticketsHandled: 165,
    avgResponseTime: '1.1m',
    resolutionRate: 91,
    csat: 4.8,
    trend: 'up',
  },
  {
    name: 'Sarah Chen',
    initials: 'SC',
    role: 'Senior Support',
    ticketsHandled: 152,
    avgResponseTime: '1.3m',
    resolutionRate: 88,
    csat: 4.7,
    trend: 'stable',
  },
  {
    name: 'Michael Scott',
    initials: 'MS',
    role: 'Junior Support',
    ticketsHandled: 98,
    avgResponseTime: '2.1m',
    resolutionRate: 72,
    csat: 3.8,
    trend: 'down',
  },
  {
    name: 'Emily Watson',
    initials: 'EW',
    role: 'Senior Support',
    ticketsHandled: 143,
    avgResponseTime: '1.4m',
    resolutionRate: 85,
    csat: 4.5,
    trend: 'up',
  },
]

// Weekly performance data for chart
const weeklyData = [
  { day: 'Mon', tickets: 185, responseTime: 1.4, csat: 4.5 },
  { day: 'Tue', tickets: 210, responseTime: 1.2, csat: 4.6 },
  { day: 'Wed', tickets: 195, responseTime: 1.3, csat: 4.5 },
  { day: 'Thu', tickets: 225, responseTime: 1.1, csat: 4.7 },
  { day: 'Fri', tickets: 240, responseTime: 1.0, csat: 4.8 },
  { day: 'Sat', tickets: 120, responseTime: 1.5, csat: 4.4 },
  { day: 'Sun', tickets: 72, responseTime: 1.8, csat: 4.3 },
]

export default function TeamPerformanceContent() {
  const [selectedRange, setSelectedRange] = useState('This Week')
  const [showRangeDropdown, setShowRangeDropdown] = useState(false)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-amber-500" />
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-700" />
      default:
        return <span className="text-slate-400 font-bold">#{rank}</span>
    }
  }

  const maxTickets = Math.max(...weeklyData.map((d) => d.tickets))

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-tight">
            Team Performance
          </h1>
          <p className="text-slate-500 text-base font-normal leading-normal">
            Track your team's efficiency, quality metrics, and individual contributions.
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowRangeDropdown(!showRangeDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            {selectedRange}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showRangeDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setSelectedRange(range)
                    setShowRangeDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${
                    selectedRange === range
                      ? 'text-blue-600 font-semibold bg-blue-50'
                      : 'text-slate-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${kpi.iconBg}`}>
                  <Icon className={`w-6 h-6 ${kpi.iconColor}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-bold ${
                    kpi.changeType === 'positive' ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {kpi.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {kpi.change}
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{kpi.value}</p>
              <p className="text-sm text-slate-500">{kpi.label}</p>
              <p className="text-xs text-slate-400 mt-1">{kpi.description}</p>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Weekly Performance Trend</h3>
              <p className="text-sm text-slate-500">Tickets resolved per day</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-600">Tickets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-600">CSAT</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end gap-4">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-slate-900">{day.tickets}</span>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${(day.tickets / maxTickets) * 180}px` }}
                  ></div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-slate-500">{day.csat}</span>
                </div>
                <span className="text-xs font-medium text-slate-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">Top Performers</h3>
          </div>
          <div className="space-y-4">
            {leaderboard.map((person) => (
              <div
                key={person.rank}
                className={`p-4 rounded-xl border transition-all ${
                  person.rank === 1
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                    : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(person.rank)}
                  </div>
                  <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                    {person.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{person.name}</p>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-xs text-orange-500 font-medium">
                        {person.streak} day streak
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">{person.score}</p>
                    <p className="text-xs text-slate-500">score</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/60 rounded-lg py-1.5">
                    <p className="text-xs text-slate-500">Tickets</p>
                    <p className="text-sm font-bold text-slate-900">{person.tickets}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg py-1.5">
                    <p className="text-xs text-slate-500">Avg Time</p>
                    <p className="text-sm font-bold text-slate-900">{person.avgTime}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg py-1.5">
                    <p className="text-xs text-slate-500">CSAT</p>
                    <p className="text-sm font-bold text-slate-900">{person.csat}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Tickets by Category</h3>
          </div>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{category.label}</span>
                  <span className="text-sm font-bold text-slate-900">{category.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${category.color}`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Tickets</span>
              <span className="text-lg font-black text-slate-900">978</span>
            </div>
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Individual Performance</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Avg. Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Resolution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    CSAT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamPerformance.map((member) => (
                  <tr key={member.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {member.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">
                        {member.ticketsHandled}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{member.avgResponseTime}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              member.resolutionRate >= 90
                                ? 'bg-emerald-500'
                                : member.resolutionRate >= 80
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${member.resolutionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {member.resolutionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-slate-900">{member.csat}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {member.trend === 'up' && (
                        <div className="flex items-center gap-1 text-emerald-500">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs font-bold">Up</span>
                        </div>
                      )}
                      {member.trend === 'down' && (
                        <div className="flex items-center gap-1 text-red-500">
                          <TrendingDown className="w-4 h-4" />
                          <span className="text-xs font-bold">Down</span>
                        </div>
                      )}
                      {member.trend === 'stable' && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Zap className="w-4 h-4" />
                          <span className="text-xs font-bold">Stable</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
