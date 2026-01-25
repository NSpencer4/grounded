import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import {
  createGraphQLClient,
  GET_PERFORMANCE_METRICS,
  type PerformanceMetrics,
} from '../lib/graphql'

/**
 * API Route for performance metrics
 */

export async function loader({ request, context }: LoaderFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const url = new URL(request.url)
  const orgId = url.searchParams.get('orgId') || context.env?.DEFAULT_ORG_ID || 'org_123'

  // Default to last 24 hours
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000)

  const startDateParam = url.searchParams.get('startDate')
  const endDateParam = url.searchParams.get('endDate')

  const start = startDateParam || startDate.toISOString()
  const end = endDateParam || endDate.toISOString()

  try {
    const data = await graphqlClient.request<{ performanceMetrics: PerformanceMetrics }>(
      GET_PERFORMANCE_METRICS,
      {
        orgId,
        startDate: start,
        endDate: end,
      },
    )
    return json({ metrics: data.performanceMetrics })
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    // Return mock data for development
    return json({
      metrics: {
        orgId,
        period: { start, end },
        conversations: {
          total: 142,
          active: 89,
          resolved: 45,
          escalated: 8,
          averageDuration: 840, // 14 minutes in seconds
        },
        representatives: {
          total: 12,
          active: 8,
          averageResponseTime: 84, // 1.4 minutes in seconds
          averageResolutionRate: 0.64,
        },
        customers: {
          total: 324,
          new: 45,
          returning: 279,
          satisfactionScore: 4.2,
        },
        ai: {
          totalInvocations: 456,
          successRate: 0.92,
          averageLatency: 1250,
          costSavings: 2840.5,
        },
        timestamp: new Date().toISOString(),
      },
    })
  }
}
