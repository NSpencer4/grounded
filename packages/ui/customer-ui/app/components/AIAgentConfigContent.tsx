import { useState } from 'react'
import {
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  DollarSign,
  GitBranch,
  Info,
  MessageSquare,
  Play,
  Settings2,
  Shield,
  Sliders,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Zap,
} from 'lucide-react'

// Agent configurations
const agents = [
  {
    id: 'response-recommendation',
    name: 'Response Recommendation Agent',
    description:
      'Generates contextual response suggestions based on customer intent and conversation history.',
    icon: MessageSquare,
    color: 'blue',
    enabled: true,
    status: 'active',
    assertions: 142,
    accuracy: 94.2,
    avgLatency: '1.2s',
    lastUpdated: '2 hours ago',
    dataSources: ['Conversation History', 'Customer Profile', 'Knowledge Base'],
    thresholds: {
      confidence: 0.85,
      maxTokens: 500,
      temperature: 0.7,
    },
  },
  {
    id: 'customer-spend',
    name: 'Customer Spend Agent',
    description:
      'Analyzes customer spending patterns, billing history, and account value for informed decisions.',
    icon: DollarSign,
    color: 'green',
    enabled: true,
    status: 'active',
    assertions: 89,
    accuracy: 97.8,
    avgLatency: '0.8s',
    lastUpdated: '1 hour ago',
    dataSources: ['Billing History', 'Subscription Data', 'Transaction Records'],
    thresholds: {
      confidence: 0.9,
      highValueThreshold: 1000,
      refundLimit: 500,
    },
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis Agent',
    description:
      'Detects customer emotion and urgency levels to prioritize and route conversations appropriately.',
    icon: Brain,
    color: 'purple',
    enabled: true,
    status: 'active',
    assertions: 256,
    accuracy: 91.5,
    avgLatency: '0.5s',
    lastUpdated: '30 mins ago',
    dataSources: ['Message Content', 'Conversation Tone', 'Historical Sentiment'],
    thresholds: {
      confidence: 0.8,
      escalationThreshold: 0.3,
      urgencyWeight: 1.5,
    },
  },
  {
    id: 'escalation-predictor',
    name: 'Escalation Predictor Agent',
    description:
      'Predicts likelihood of escalation and proactively routes to human agents when needed.',
    icon: AlertTriangle,
    color: 'orange',
    enabled: false,
    status: 'paused',
    assertions: 0,
    accuracy: 88.3,
    avgLatency: '0.6s',
    lastUpdated: '1 day ago',
    dataSources: ['Conversation History', 'Sentiment Scores', 'Issue Complexity'],
    thresholds: {
      confidence: 0.75,
      escalationTrigger: 0.7,
      cooldownPeriod: 300,
    },
  },
]

// Decision rules configuration
const decisionRules = [
  {
    id: 1,
    name: 'Auto-resolve Simple Queries',
    description: 'Automatically resolve queries when confidence > 95% and sentiment is positive',
    enabled: true,
    priority: 1,
    conditions: ['confidence > 0.95', 'sentiment > 0.6', 'complexity < 0.3'],
  },
  {
    id: 2,
    name: 'High-Value Customer Priority',
    description: 'Route high-value customers to senior agents with full context',
    enabled: true,
    priority: 2,
    conditions: ['customer_value > $1000/mo', 'account_age > 1 year'],
  },
  {
    id: 3,
    name: 'Refund Auto-Approval',
    description: 'Auto-approve refunds under threshold for customers in good standing',
    enabled: true,
    priority: 3,
    conditions: ['refund_amount < $50', 'previous_refunds < 2', 'account_standing = good'],
  },
  {
    id: 4,
    name: 'Escalation Override',
    description: 'Force escalation when negative sentiment persists across multiple messages',
    enabled: true,
    priority: 4,
    conditions: ['sentiment < 0.3', 'message_count > 3', 'no_resolution'],
  },
]

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    icon: 'bg-blue-100',
    badge: 'bg-blue-100 text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-600',
    icon: 'bg-green-100',
    badge: 'bg-green-100 text-green-700',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    icon: 'bg-purple-100',
    badge: 'bg-purple-100 text-purple-700',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    icon: 'bg-orange-100',
    badge: 'bg-orange-100 text-orange-700',
  },
}

export default function AIAgentConfigContent() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [agentStates, setAgentStates] = useState<Record<string, boolean>>(
    Object.fromEntries(agents.map((a) => [a.id, a.enabled])),
  )
  const [ruleStates, setRuleStates] = useState<Record<number, boolean>>(
    Object.fromEntries(decisionRules.map((r) => [r.id, r.enabled])),
  )

  const toggleAgent = (agentId: string) => {
    setAgentStates((prev) => ({ ...prev, [agentId]: !prev[agentId] }))
  }

  const toggleRule = (ruleId: number) => {
    setRuleStates((prev) => ({ ...prev, [ruleId]: !prev[ruleId] }))
  }

  const activeAgents = agents.filter((a) => agentStates[a.id]).length
  const totalAssertions = agents.reduce((acc, a) => acc + a.assertions, 0)
  const avgAccuracy = (agents.reduce((acc, a) => acc + a.accuracy, 0) / agents.length).toFixed(1)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">AI Agent Configuration</h2>
            <p className="text-slate-500 text-sm mt-1">
              Configure AI agents that evaluate conversations and make decisions
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              <Play className="w-4 h-4" />
              Test Agents
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <Settings2 className="w-4 h-4" />
              Global Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Active Agents</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {activeAgents}
            <span className="text-lg text-slate-400 font-normal">/{agents.length}</span>
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Assertions Today</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalAssertions}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Avg Accuracy</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{avgAccuracy}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Decision Rules</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {decisionRules.filter((r) => ruleStates[r.id]).length}
            <span className="text-lg text-slate-400 font-normal"> active</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Agent Cards */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-900">Evaluation Agents</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              + Add Custom Agent
            </button>
          </div>

          {agents.map((agent) => {
            const colors = colorClasses[agent.color as keyof typeof colorClasses]
            const isEnabled = agentStates[agent.id]
            const isSelected = selectedAgent === agent.id
            const Icon = agent.icon

            return (
              <div
                key={agent.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${colors.icon}`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-slate-900">{agent.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              isEnabled
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isEnabled ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 max-w-lg">{agent.description}</p>
                        <div className="flex items-center gap-6 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Zap className="w-3.5 h-3.5" />
                            <span>{agent.assertions} assertions</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{agent.accuracy}% accuracy</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{agent.avgLatency} avg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleAgent(agent.id)
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {isEnabled ? (
                          <ToggleRight className="w-8 h-8 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8" />
                        )}
                      </button>
                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          isSelected ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Configuration */}
                {isSelected && (
                  <div className={`border-t border-slate-100 ${colors.bg} p-5`}>
                    <div className="grid grid-cols-2 gap-6">
                      {/* Data Sources */}
                      <div>
                        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Database className="w-4 h-4" />
                          Data Sources
                        </h5>
                        <div className="space-y-2">
                          {agent.dataSources.map((source) => (
                            <div
                              key={source}
                              className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-200"
                            >
                              <span className="text-sm text-slate-700">{source}</span>
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Thresholds */}
                      <div>
                        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Sliders className="w-4 h-4" />
                          Thresholds
                        </h5>
                        <div className="space-y-3">
                          {Object.entries(agent.thresholds).map(([key, value]) => (
                            <div
                              key={key}
                              className="bg-white rounded-lg px-3 py-2 border border-slate-200"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-500 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-sm font-medium text-slate-900">{value}</span>
                              </div>
                              {typeof value === 'number' && value <= 1 && (
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${colors.text.replace('text', 'bg')}`}
                                    style={{ width: `${value * 100}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200/50">
                      <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white rounded-lg">
                        View Logs
                      </button>
                      <button
                        className={`px-3 py-1.5 text-sm font-medium ${colors.text} ${colors.badge} rounded-lg`}
                      >
                        Configure Agent
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Decision Rules Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-900">Decision Rules</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              + Add Rule
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <GitBranch className="w-4 h-4" />
                <span className="font-medium">Orchestration Pipeline</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Rules are evaluated in priority order. First matching rule wins.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {decisionRules.map((rule) => {
                const isEnabled = ruleStates[rule.id]
                return (
                  <div key={rule.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded bg-slate-100 text-xs font-bold text-slate-500">
                          {rule.priority}
                        </span>
                        <h4 className="font-medium text-slate-900 text-sm">{rule.name}</h4>
                      </div>
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {isEnabled ? (
                          <ToggleRight className="w-6 h-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{rule.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.conditions.map((condition, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">How Decisions Work</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Agents evaluate conversations and produce assertions. The Responder Lambda then
                  applies decision rules to determine the appropriate action: auto-resolve, escalate
                  to human, or request more information.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                <span>Export Agent Configs</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                <span>View Assertion Logs</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                <span>Run Simulation</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
