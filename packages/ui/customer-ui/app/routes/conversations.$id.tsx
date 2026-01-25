import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData, useFetcher, useRevalidator } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { Send, MessageCircle, User } from 'lucide-react'
import {
  createGraphQLClient,
  GET_CONVERSATION,
  SEND_MESSAGE,
  type Conversation,
  type Message,
  MessageRole,
} from '../lib/graphql'

interface LoaderData {
  conversation: Conversation
  orgId: string
}

/**
 * Loader: Fetch conversation data including messages
 */
export async function loader({ params, context }: LoaderFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const conversationId = params.id

  if (!conversationId) {
    throw new Response('Conversation ID is required', { status: 400 })
  }

  try {
    const data = await graphqlClient.request<{ conversation: Conversation }>(GET_CONVERSATION, {
      id: conversationId,
    })

    if (!data.conversation) {
      throw new Response('Conversation not found', { status: 404 })
    }

    return json<LoaderData>({
      conversation: data.conversation,
      orgId: data.conversation.orgId,
    })
  } catch (error) {
    console.error('Error loading conversation:', error)
    throw new Response('Failed to load conversation', { status: 500 })
  }
}

/**
 * Action: Handle sending new messages
 */
export async function action({ request, params }: ActionFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const conversationId = params.id

  if (!conversationId) {
    return json({ error: 'Conversation ID is required' }, { status: 400 })
  }

  const formData = await request.formData()
  const content = formData.get('content')
  const actionType = formData.get('_action')

  if (actionType === 'sendMessage' && typeof content === 'string') {
    try {
      const data = await graphqlClient.request<{ sendMessage: Message }>(SEND_MESSAGE, {
        conversationId,
        content,
      })

      return json({ message: data.sendMessage, success: true })
    } catch (error) {
      console.error('Error sending message:', error)
      return json({ error: 'Failed to send message' }, { status: 500 })
    }
  }

  return json({ error: 'Invalid action' }, { status: 400 })
}

export default function ConversationRoute() {
  const { conversation } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const revalidator = useRevalidator()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation.messages])

  // SSE for real-time updates (commented out for now - requires SSE endpoint to be configured)
  // Uncomment when Gateway API SSE is ready
  /*
  const { isConnected, messages: sseMessages } = useConversationSSE(conversation.id)
  
  useEffect(() => {
    if (sseMessages.length > 0) {
      // Revalidate when new messages arrive via SSE
      revalidator.revalidate()
    }
  }, [sseMessages, revalidator])
  */

  // Fallback: Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate()
    }, 5000)

    return () => clearInterval(interval)
  }, [revalidator])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    fetcher.submit(formData, { method: 'post' })

    // Reset the form
    if (textareaRef.current) {
      textareaRef.current.value = ''
      textareaRef.current.style.height = 'auto'
    }
  }

  const isSending = fetcher.state === 'submitting'

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <header className="bg-white shadow-md px-6 py-4 flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-blue-600" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800">Conversation</h1>
          <p className="text-sm text-gray-500">Status: {conversation.status}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {!conversation.messages || conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Send a message to connect with a support representative</p>
            </div>
          </div>
        ) : (
          conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === MessageRole.USER ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="flex flex-col max-w-xs lg:max-w-md">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {message.role === MessageRole.USER ? 'You' : 'Support'}
                  </span>
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.role === MessageRole.USER
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === MessageRole.USER ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <fetcher.Form method="post" onSubmit={handleSubmit} className="bg-white border-t px-6 py-4">
        <input type="hidden" name="_action" value="sendMessage" />
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            name="content"
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[48px] max-h-[200px]"
            disabled={isSending}
            rows={1}
            required
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 200) + 'px'
            }}
          />
          <button
            type="submit"
            disabled={isSending}
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </fetcher.Form>
    </div>
  )
}
