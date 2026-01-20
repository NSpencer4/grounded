export interface CustomerSpendData {
  customerId: string
  totalSpend: number
  currency: string
  subscriptionTier: 'free' | 'starter' | 'professional' | 'enterprise'
  accountAge: {
    months: number
    startDate: string
  }
  recentTransactions: Transaction[]
  usageMetrics: UsageMetrics
}

export interface Transaction {
  id: string
  date: string
  amount: number
  type: 'subscription' | 'usage' | 'addon' | 'refund'
  description: string
}

export interface UsageMetrics {
  apiCallsThisMonth: number
  apiCallsLimit: number
  storageUsedGb: number
  storageLimitGb: number
  activeUsers: number
  userLimit: number
}

export interface SpendAnalysis {
  customerValue: 'low' | 'medium' | 'high' | 'enterprise'
  churnRisk: 'low' | 'medium' | 'high'
  upsellOpportunity: boolean
  keyInsights: string[]
  recommendedActions: string[]
  spendTrend: 'increasing' | 'stable' | 'decreasing'
  lifetimeValue: number
}

export interface CustomerSpendAgentOutput {
  customerId: string
  spendData: CustomerSpendData
  analysis: SpendAnalysis
  generatedAt: string
}
