import { RouteContext, RouteResult } from './types'

// Import all controllers
import * as organizationsCtrl from './controllers/organizations'
import * as usersCtrl from './controllers/users'
import * as representativesCtrl from './controllers/representatives'
import * as customerProfilesCtrl from './controllers/customer-profiles'
import * as ticketsCtrl from './controllers/tickets'
import * as escalationsCtrl from './controllers/escalations'
import * as refundsCtrl from './controllers/refunds'
import * as budgetsCtrl from './controllers/budgets'
import * as agentsCtrl from './controllers/agents'
import * as decisionRulesCtrl from './controllers/decision-rules'
import * as performanceCtrl from './controllers/performance'

export interface Route {
  method: string
  pattern: RegExp
  handler: string
  paramNames: string[]
}

export interface RouteMatch {
  handler: string
  params: Record<string, string>
}

// Define all routes
export const routes: Route[] = [
  // Health check
  { method: 'GET', pattern: /^\/health$/, handler: 'health', paramNames: [] },

  // Organizations
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)$/,
    handler: 'getOrganization',
    paramNames: ['id'],
  },
  { method: 'POST', pattern: /^\/organizations$/, handler: 'createOrganization', paramNames: [] },
  {
    method: 'PATCH',
    pattern: /^\/organizations\/([^/]+)$/,
    handler: 'updateOrganization',
    paramNames: ['id'],
  },
  {
    method: 'DELETE',
    pattern: /^\/organizations\/([^/]+)$/,
    handler: 'deleteOrganization',
    paramNames: ['id'],
  },

  // Users
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/users$/,
    handler: 'listUsers',
    paramNames: ['orgId'],
  },
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/users\/([^/]+)$/,
    handler: 'getUser',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'POST',
    pattern: /^\/organizations\/([^/]+)\/users$/,
    handler: 'createUser',
    paramNames: ['orgId'],
  },
  {
    method: 'PATCH',
    pattern: /^\/organizations\/([^/]+)\/users\/([^/]+)$/,
    handler: 'updateUser',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'DELETE',
    pattern: /^\/organizations\/([^/]+)\/users\/([^/]+)$/,
    handler: 'deleteUser',
    paramNames: ['orgId', 'id'],
  },

  // Representatives
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/representatives$/,
    handler: 'listRepresentatives',
    paramNames: ['orgId'],
  },
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/representatives\/([^/]+)$/,
    handler: 'getRepresentative',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'POST',
    pattern: /^\/organizations\/([^/]+)\/representatives$/,
    handler: 'createRepresentative',
    paramNames: ['orgId'],
  },
  {
    method: 'PATCH',
    pattern: /^\/organizations\/([^/]+)\/representatives\/([^/]+)$/,
    handler: 'updateRepresentative',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'DELETE',
    pattern: /^\/organizations\/([^/]+)\/representatives\/([^/]+)$/,
    handler: 'deleteRepresentative',
    paramNames: ['orgId', 'id'],
  },

  // Customer Profiles
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/customer-profiles$/,
    handler: 'listCustomerProfiles',
    paramNames: ['orgId'],
  },
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/customer-profiles\/([^/]+)$/,
    handler: 'getCustomerProfile',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'POST',
    pattern: /^\/organizations\/([^/]+)\/customer-profiles$/,
    handler: 'createCustomerProfile',
    paramNames: ['orgId'],
  },
  {
    method: 'PATCH',
    pattern: /^\/organizations\/([^/]+)\/customer-profiles\/([^/]+)$/,
    handler: 'updateCustomerProfile',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'DELETE',
    pattern: /^\/organizations\/([^/]+)\/customer-profiles\/([^/]+)$/,
    handler: 'deleteCustomerProfile',
    paramNames: ['orgId', 'id'],
  },

  // Tickets
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/tickets$/,
    handler: 'listTickets',
    paramNames: ['orgId'],
  },
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/tickets\/([^/]+)$/,
    handler: 'getTicket',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'POST',
    pattern: /^\/organizations\/([^/]+)\/tickets$/,
    handler: 'createTicket',
    paramNames: ['orgId'],
  },
  {
    method: 'PATCH',
    pattern: /^\/organizations\/([^/]+)\/tickets\/([^/]+)$/,
    handler: 'updateTicket',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'DELETE',
    pattern: /^\/organizations\/([^/]+)\/tickets\/([^/]+)$/,
    handler: 'deleteTicket',
    paramNames: ['orgId', 'id'],
  },

  // Escalations
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/escalations$/,
    handler: 'listEscalations',
    paramNames: ['orgId'],
  },
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/escalations\/([^/]+)$/,
    handler: 'getEscalation',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'POST',
    pattern: /^\/organizations\/([^/]+)\/escalations$/,
    handler: 'createEscalation',
    paramNames: ['orgId'],
  },
  {
    method: 'PATCH',
    pattern: /^\/organizations\/([^/]+)\/escalations\/([^/]+)$/,
    handler: 'updateEscalation',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'DELETE',
    pattern: /^\/organizations\/([^/]+)\/escalations\/([^/]+)$/,
    handler: 'deleteEscalation',
    paramNames: ['orgId', 'id'],
  },

  // Refunds
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/refunds$/,
    handler: 'listRefunds',
    paramNames: ['orgId'],
  },
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/refunds\/([^/]+)$/,
    handler: 'getRefund',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'POST',
    pattern: /^\/organizations\/([^/]+)\/refunds$/,
    handler: 'createRefund',
    paramNames: ['orgId'],
  },
  {
    method: 'PATCH',
    pattern: /^\/organizations\/([^/]+)\/refunds\/([^/]+)$/,
    handler: 'updateRefund',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'DELETE',
    pattern: /^\/organizations\/([^/]+)\/refunds\/([^/]+)$/,
    handler: 'deleteRefund',
    paramNames: ['orgId', 'id'],
  },

  // Budgets
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/budgets$/,
    handler: 'listBudgets',
    paramNames: ['orgId'],
  },
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/budgets\/([^/]+)$/,
    handler: 'getBudget',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'POST',
    pattern: /^\/organizations\/([^/]+)\/budgets$/,
    handler: 'createBudget',
    paramNames: ['orgId'],
  },
  {
    method: 'PATCH',
    pattern: /^\/organizations\/([^/]+)\/budgets\/([^/]+)$/,
    handler: 'updateBudget',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'DELETE',
    pattern: /^\/organizations\/([^/]+)\/budgets\/([^/]+)$/,
    handler: 'deleteBudget',
    paramNames: ['orgId', 'id'],
  },

  // Agent Configurations
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/agents$/,
    handler: 'listAgents',
    paramNames: ['orgId'],
  },
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/agents\/([^/]+)$/,
    handler: 'getAgent',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'POST',
    pattern: /^\/organizations\/([^/]+)\/agents$/,
    handler: 'createAgent',
    paramNames: ['orgId'],
  },
  {
    method: 'PATCH',
    pattern: /^\/organizations\/([^/]+)\/agents\/([^/]+)$/,
    handler: 'updateAgent',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'DELETE',
    pattern: /^\/organizations\/([^/]+)\/agents\/([^/]+)$/,
    handler: 'deleteAgent',
    paramNames: ['orgId', 'id'],
  },

  // Decision Rules
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/decision-rules$/,
    handler: 'listDecisionRules',
    paramNames: ['orgId'],
  },
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/decision-rules\/([^/]+)$/,
    handler: 'getDecisionRule',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'POST',
    pattern: /^\/organizations\/([^/]+)\/decision-rules$/,
    handler: 'createDecisionRule',
    paramNames: ['orgId'],
  },
  {
    method: 'PATCH',
    pattern: /^\/organizations\/([^/]+)\/decision-rules\/([^/]+)$/,
    handler: 'updateDecisionRule',
    paramNames: ['orgId', 'id'],
  },
  {
    method: 'DELETE',
    pattern: /^\/organizations\/([^/]+)\/decision-rules\/([^/]+)$/,
    handler: 'deleteDecisionRule',
    paramNames: ['orgId', 'id'],
  },

  // Performance Metrics
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/performance-metrics$/,
    handler: 'listPerformanceMetrics',
    paramNames: ['orgId'],
  },
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/team-performance$/,
    handler: 'listTeamPerformance',
    paramNames: ['orgId'],
  },
  {
    method: 'GET',
    pattern: /^\/organizations\/([^/]+)\/representatives\/([^/]+)\/performance$/,
    handler: 'getRepresentativePerformance',
    paramNames: ['orgId', 'repId'],
  },
]

export function matchRoute(method: string, path: string): RouteMatch | null {
  for (const route of routes) {
    if (route.method !== method) {
      continue
    }
    const match = path.match(route.pattern)
    if (match) {
      const params: Record<string, string> = {}
      route.paramNames.forEach((name, index) => {
        params[name] = match[index + 1]
      })
      return { handler: route.handler, params }
    }
  }
  return null
}

/**
 * Execute route handler
 */
export async function executeHandler(
  handlerName: string,
  params: Record<string, string>,
  query: Record<string, string | undefined>,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  switch (handlerName) {
    // Organizations
    case 'getOrganization':
      return organizationsCtrl.getOrganization(params.id, ctx)
    case 'createOrganization':
      return organizationsCtrl.createOrganization(body || {}, ctx)
    case 'updateOrganization':
      return organizationsCtrl.updateOrganization(params.id, body || {}, ctx)
    case 'deleteOrganization':
      return organizationsCtrl.deleteOrganization(params.id, ctx)

    // Users
    case 'listUsers':
      return usersCtrl.listUsers(params.orgId, query, ctx)
    case 'getUser':
      return usersCtrl.getUser(params.orgId, params.id, ctx)
    case 'createUser':
      return usersCtrl.createUser(params.orgId, body || {}, ctx)
    case 'updateUser':
      return usersCtrl.updateUser(params.orgId, params.id, body || {}, ctx)
    case 'deleteUser':
      return usersCtrl.deleteUser(params.orgId, params.id, ctx)

    // Representatives
    case 'listRepresentatives':
      return representativesCtrl.listRepresentatives(params.orgId, query, ctx)
    case 'getRepresentative':
      return representativesCtrl.getRepresentative(params.orgId, params.id, ctx)
    case 'createRepresentative':
      return representativesCtrl.createRepresentative(params.orgId, body || {}, ctx)
    case 'updateRepresentative':
      return representativesCtrl.updateRepresentative(params.orgId, params.id, body || {}, ctx)
    case 'deleteRepresentative':
      return representativesCtrl.deleteRepresentative(params.orgId, params.id, ctx)

    // Customer Profiles
    case 'listCustomerProfiles':
      return customerProfilesCtrl.listCustomerProfiles(params.orgId, query, ctx)
    case 'getCustomerProfile':
      return customerProfilesCtrl.getCustomerProfile(params.orgId, params.id, ctx)
    case 'createCustomerProfile':
      return customerProfilesCtrl.createCustomerProfile(params.orgId, body || {}, ctx)
    case 'updateCustomerProfile':
      return customerProfilesCtrl.updateCustomerProfile(params.orgId, params.id, body || {}, ctx)
    case 'deleteCustomerProfile':
      return customerProfilesCtrl.deleteCustomerProfile(params.orgId, params.id, ctx)

    // Tickets
    case 'listTickets':
      return ticketsCtrl.listTickets(params.orgId, query, ctx)
    case 'getTicket':
      return ticketsCtrl.getTicket(params.orgId, params.id, ctx)
    case 'createTicket':
      return ticketsCtrl.createTicket(params.orgId, body || {}, ctx)
    case 'updateTicket':
      return ticketsCtrl.updateTicket(params.orgId, params.id, body || {}, ctx)
    case 'deleteTicket':
      return ticketsCtrl.deleteTicket(params.orgId, params.id, ctx)

    // Escalations
    case 'listEscalations':
      return escalationsCtrl.listEscalations(params.orgId, query, ctx)
    case 'getEscalation':
      return escalationsCtrl.getEscalation(params.orgId, params.id, ctx)
    case 'createEscalation':
      return escalationsCtrl.createEscalation(params.orgId, body || {}, ctx)
    case 'updateEscalation':
      return escalationsCtrl.updateEscalation(params.orgId, params.id, body || {}, ctx)
    case 'deleteEscalation':
      return escalationsCtrl.deleteEscalation(params.orgId, params.id, ctx)

    // Refunds
    case 'listRefunds':
      return refundsCtrl.listRefunds(params.orgId, query, ctx)
    case 'getRefund':
      return refundsCtrl.getRefund(params.orgId, params.id, ctx)
    case 'createRefund':
      return refundsCtrl.createRefund(params.orgId, body || {}, ctx)
    case 'updateRefund':
      return refundsCtrl.updateRefund(params.orgId, params.id, body || {}, ctx)
    case 'deleteRefund':
      return refundsCtrl.deleteRefund(params.orgId, params.id, ctx)

    // Budgets
    case 'listBudgets':
      return budgetsCtrl.listBudgets(params.orgId, query, ctx)
    case 'getBudget':
      return budgetsCtrl.getBudget(params.orgId, params.id, ctx)
    case 'createBudget':
      return budgetsCtrl.createBudget(params.orgId, body || {}, ctx)
    case 'updateBudget':
      return budgetsCtrl.updateBudget(params.orgId, params.id, body || {}, ctx)
    case 'deleteBudget':
      return budgetsCtrl.deleteBudget(params.orgId, params.id, ctx)

    // Agents
    case 'listAgents':
      return agentsCtrl.listAgentConfigurations(params.orgId, query, ctx)
    case 'getAgent':
      return agentsCtrl.getAgentConfiguration(params.orgId, params.id, ctx)
    case 'createAgent':
      return agentsCtrl.createAgentConfiguration(params.orgId, body || {}, ctx)
    case 'updateAgent':
      return agentsCtrl.updateAgentConfiguration(params.orgId, params.id, body || {}, ctx)
    case 'deleteAgent':
      return agentsCtrl.deleteAgentConfiguration(params.orgId, params.id, ctx)

    // Decision Rules
    case 'listDecisionRules':
      return decisionRulesCtrl.listDecisionRules(params.orgId, query, ctx)
    case 'getDecisionRule':
      return decisionRulesCtrl.getDecisionRule(params.orgId, params.id, ctx)
    case 'createDecisionRule':
      return decisionRulesCtrl.createDecisionRule(params.orgId, body || {}, ctx)
    case 'updateDecisionRule':
      return decisionRulesCtrl.updateDecisionRule(params.orgId, params.id, body || {}, ctx)
    case 'deleteDecisionRule':
      return decisionRulesCtrl.deleteDecisionRule(params.orgId, params.id, ctx)

    // Performance
    case 'listPerformanceMetrics':
      return performanceCtrl.listPerformanceMetrics(params.orgId, query, ctx)
    case 'listTeamPerformance':
      return performanceCtrl.listTeamPerformance(params.orgId, query, ctx)
    case 'getRepresentativePerformance':
      return performanceCtrl.getRepresentativePerformance(params.orgId, params.repId, query, ctx)

    default:
      return {
        status: 500,
        body: { error: 'Handler not implemented', handler: handlerName },
      }
  }
}
