import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { createGraphQLClient, LIST_REFUNDS, LIST_BUDGETS, type Refund, type Budget } from '../lib/graphql'

interface RefundsData {
  refunds: Refund[]
  budget: Budget | null
  kpis: {
    totalProcessed: number
    averageAmount: number
    pendingCount: number
    approvalRate: number
  }
}

export async function loader({ context }: LoaderFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const orgId = context.env?.DEFAULT_ORG_ID || 'org_123'

  try {
    const [refundsData, budgetsData] = await Promise.all([
      graphqlClient.request<{ refunds: Refund[] }>(LIST_REFUNDS, {
        orgId,
        limit: 50,
      }),
      graphqlClient.request<{ budgets: Budget[] }>(LIST_BUDGETS, {
        orgId,
        limit: 1,
      }),
    ])

    const refunds = refundsData.refunds || []
    const budget = budgetsData.budgets?.[0] || null

    // Calculate KPIs
    const totalProcessed = refunds.filter((r) => r.status === 'PROCESSED').length
    const averageAmount =
      refunds.length > 0
        ? refunds.reduce((sum, r) => sum + r.amount, 0) / refunds.length
        : 0
    const pendingCount = refunds.filter((r) => r.status === 'PENDING').length
    const approvalRate =
      refunds.length > 0
        ? (refunds.filter((r) => r.status !== 'REJECTED').length / refunds.length) * 100
        : 0

    return json<RefundsData>({
      refunds: refunds.slice(0, 10),
      budget,
      kpis: {
        totalProcessed,
        averageAmount,
        pendingCount,
        approvalRate,
      },
    })
  } catch (error) {
    console.error('Error loading refunds:', error)
    return json<RefundsData>({
      refunds: [],
      budget: null,
      kpis: {
        totalProcessed: 0,
        averageAmount: 0,
        pendingCount: 0,
        approvalRate: 0,
      },
    })
  }
}

export default function RefundsRoute() {
  const { refunds, budget, kpis } = useLoaderData<typeof loader>()

  const kpiCards = [
    {
      label: 'Total Processed',
      value: kpis.totalProcessed.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Average Amount',
      value: `$${kpis.averageAmount.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Pending',
      value: kpis.pendingCount.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Approval Rate',
      value: `${kpis.approvalRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    PROCESSED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Refund Management</h1>
            <p className="text-slate-600">Track and manage customer refunds</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            New Refund
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => {
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

        {budget && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Budget</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Used: ${budget.spent.toFixed(2)}</span>
                <span className="text-slate-600">Total: ${budget.amount.toFixed(2)}</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${(budget.spent / budget.amount) * 100}%` }}
                />
              </div>
              <p className="text-sm text-slate-600">
                ${budget.remaining.toFixed(2)} remaining ({((budget.remaining / budget.amount) * 100).toFixed(0)}%)
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recent Refunds</h2>
          </div>
          {refunds.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-sm">
                    <th className="px-6 py-3 text-left font-medium">Order ID</th>
                    <th className="px-6 py-3 text-left font-medium">Customer</th>
                    <th className="px-6 py-3 text-left font-medium">Amount</th>
                    <th className="px-6 py-3 text-left font-medium">Reason</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {refunds.map((refund) => (
                    <tr key={refund.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 font-mono">
                        #{refund.orderId.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {refund.customerId.slice(0, 20)}...
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        ${refund.amount.toFixed(2)} {refund.currency}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                        {refund.reason}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[refund.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {refund.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(refund.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No refunds to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
