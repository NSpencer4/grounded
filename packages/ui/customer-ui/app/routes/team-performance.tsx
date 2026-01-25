import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { Users, MessageSquare, Clock, TrendingUp, Award } from 'lucide-react'
import { createGraphQLClient, LIST_REPRESENTATIVES, type Representative } from '../lib/graphql'

interface TeamPerformanceData {
  representatives: Representative[]
  teamMetrics: {
    totalReps: number
    activeNow: number
    avgResolutionRate: number
    avgResponseTime: number
  }
}

export async function loader({ context }: LoaderFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const orgId = context.env?.DEFAULT_ORG_ID || 'org_123'

  try {
    const data = await graphqlClient.request<{ representatives: Representative[] }>(
      LIST_REPRESENTATIVES,
      {
        orgId,
        limit: 20,
      },
    )

    const representatives = data.representatives || []
    const activeReps = representatives.filter((r) => r.status === 'AVAILABLE')

    const avgResolutionRate =
      representatives.length > 0
        ? representatives.reduce((sum, r) => sum + (r.metrics?.resolutionRate || 0), 0) /
          representatives.length
        : 0

    const avgResponseTime =
      representatives.length > 0
        ? representatives.reduce((sum, r) => sum + (r.metrics?.averageResponseTime || 0), 0) /
          representatives.length
        : 0

    return json<TeamPerformanceData>({
      representatives: representatives.slice(0, 10),
      teamMetrics: {
        totalReps: representatives.length,
        activeNow: activeReps.length,
        avgResolutionRate: avgResolutionRate * 100,
        avgResponseTime,
      },
    })
  } catch (error) {
    console.error('Error loading team performance:', error)
    return json<TeamPerformanceData>({
      representatives: [],
      teamMetrics: {
        totalReps: 0,
        activeNow: 0,
        avgResolutionRate: 0,
        avgResponseTime: 0,
      },
    })
  }
}

export default function TeamPerformanceRoute() {
  const { representatives, teamMetrics } = useLoaderData<typeof loader>()

  const kpis = [
    {
      label: 'Total Representatives',
      value: teamMetrics.totalReps.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active Now',
      value: teamMetrics.activeNow.toString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Avg Resolution Rate',
      value: `${teamMetrics.avgResolutionRate.toFixed(1)}%`,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Avg Response Time',
      value: `${(teamMetrics.avgResponseTime / 60).toFixed(1)}m`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const statusColors = {
    AVAILABLE: 'bg-green-100 text-green-700',
    BUSY: 'bg-yellow-100 text-yellow-700',
    OFFLINE: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Performance</h1>
          <p className="text-slate-600">Monitor your support team's performance and metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className={`${kpi.bgColor} ${kpi.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-slate-600 text-sm mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Representative Leaderboard</h2>
          </div>
          {representatives.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-sm">
                    <th className="px-6 py-3 text-left font-medium">Rank</th>
                    <th className="px-6 py-3 text-left font-medium">Name</th>
                    <th className="px-6 py-3 text-left font-medium">Department</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Conversations</th>
                    <th className="px-6 py-3 text-left font-medium">Resolution Rate</th>
                    <th className="px-6 py-3 text-left font-medium">Avg Response Time</th>
                    <th className="px-6 py-3 text-left font-medium">Satisfaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {representatives
                    .sort((a, b) => 
                      (b.metrics?.resolutionRate || 0) - (a.metrics?.resolutionRate || 0)
                    )
                    .map((rep, index) => (
                      <tr key={rep.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {index < 3 ? (
                              <Award className={`w-5 h-5 ${
                                index === 0 ? 'text-yellow-500' :
                                index === 1 ? 'text-gray-400' :
                                'text-orange-600'
                              }`} />
                            ) : (
                              <span className="text-slate-600 font-medium">#{index + 1}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-600">
                              {rep.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{rep.name}</p>
                              <p className="text-xs text-slate-500">{rep.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {rep.department || 'General'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[rep.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}
                          >
                            {rep.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                          {rep.metrics?.totalConversations || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                          {((rep.metrics?.resolutionRate || 0) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {((rep.metrics?.averageResponseTime || 0) / 60).toFixed(1)}m
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-slate-900">
                              {(rep.metrics?.customerSatisfaction || 0).toFixed(1)}
                            </span>
                            <span className="text-xs text-slate-500">/5.0</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No representatives to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
