import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData, useFetcher, Link } from '@remix-run/react'
import { MessageCircle, Plus } from 'lucide-react'
import {
  createGraphQLClient,
  LIST_CONVERSATIONS,
  CREATE_CONVERSATION,
  type ConversationsConnection,
  type Conversation,
  ConversationStatus,
} from '../lib/graphql'

interface LoaderData {
  conversations: Conversation[]
  orgId: string
  userId: string
}

/**
 * Loader: Fetch all conversations for the user
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare?.env as { GRAPHQL_ENDPOINT?: string; DEFAULT_ORG_ID?: string }
  const endpoint = env?.GRAPHQL_ENDPOINT || 'http://localhost:8787/graphql'
  const graphqlClient = createGraphQLClient(endpoint)

  // In a real app, get these from session/auth
  const orgId = env?.DEFAULT_ORG_ID || 'acme-corp'
  const userId = 'user_456' // Would come from authenticated session

  try {
    const data = await graphqlClient.request<{ conversations: ConversationsConnection }>(
      LIST_CONVERSATIONS,
      {
        orgId,
        limit: 50,
      },
    )

    const conversations = data.conversations.edges.map((edge) => edge.node)

    return json<LoaderData>({
      conversations,
      orgId,
      userId,
    })
  } catch (error) {
    console.error('Error loading conversations:', error)
    return json<LoaderData>({
      conversations: [],
      orgId,
      userId,
    })
  }
}

/**
 * Action: Create a new conversation
 */
export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare?.env as { GRAPHQL_ENDPOINT?: string }
  const endpoint = env?.GRAPHQL_ENDPOINT || 'http://localhost:8787/graphql'
  const graphqlClient = createGraphQLClient(endpoint)
  const formData = await request.formData()
  const actionType = formData.get('_action')

  if (actionType === 'createConversation') {
    const orgId = formData.get('orgId') as string
    const userId = formData.get('userId') as string
    const initialMessage = formData.get('initialMessage') as string

    try {
      const data = await graphqlClient.request<{ createConversation: Conversation }>(
        CREATE_CONVERSATION,
        {
          orgId,
          userId,
          initialMessage: initialMessage || 'Hello, I need help',
        },
      )

      return json({ conversation: data.createConversation, success: true })
    } catch (error) {
      console.error('Error creating conversation:', error)
      return json({ error: 'Failed to create conversation' }, { status: 500 })
    }
  }

  return json({ error: 'Invalid action' }, { status: 400 })
}

export default function ConversationsIndexRoute() {
  const { conversations, orgId, userId } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  const handleCreateConversation = () => {
    const formData = new FormData()
    formData.append('_action', 'createConversation')
    formData.append('orgId', orgId)
    formData.append('userId', userId)
    formData.append('initialMessage', 'Hello, I need help')

    fetcher.submit(formData, { method: 'post' })
  }

  const isCreating = fetcher.state === 'submitting'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <header className="bg-white shadow-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">My Conversations</h1>
            <p className="text-sm text-gray-500">{conversations.length} total conversations</p>
          </div>
          <button
            onClick={handleCreateConversation}
            disabled={isCreating}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
          >
            <Plus className="w-5 h-5" />
            {isCreating ? 'Creating...' : 'New Conversation'}
          </button>
        </div>
      </header>

      <div className="p-6">
        {conversations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No conversations yet</h2>
            <p className="text-gray-600 mb-6">Start a new conversation to get help from support</p>
            <button
              onClick={handleCreateConversation}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Start Conversation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                to={`/conversations/${conversation.id}`}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      conversation.status === ConversationStatus.ACTIVE
                        ? 'bg-green-100 text-green-700'
                        : conversation.status === ConversationStatus.WAITING
                          ? 'bg-yellow-100 text-yellow-700'
                          : conversation.status === ConversationStatus.ESCALATED
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {conversation.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Conversation #{conversation.id.slice(-8)}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {conversation.messages && conversation.messages.length > 0
                    ? `${conversation.messages.length} messages`
                    : 'No messages yet'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {new Date(conversation.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(conversation.updatedAt).toLocaleTimeString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
