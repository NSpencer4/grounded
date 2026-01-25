import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CheckCircle, Clock, MessageCircle, Send, Users } from 'lucide-react'
import TopNav, { type NavItem } from './TopNav'

/**
 * Legacy Types (for Supabase database access)
 * TODO: Migrate this component to use GraphQL routes
 * See: COMPONENTS_TO_MIGRATE.md for migration guide
 */
type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

type Conversation = {
  id: string
  customer_id: string
  rep_id: string | null
  status: 'active' | 'closed' | 'waiting'
  created_at: string
  updated_at: string
}

type Profile = {
  id: string
  user_id: string
  email: string
  name: string
  role: 'customer' | 'representative' | 'admin'
  created_at: string
}

interface ConversationWithCustomer extends Conversation {
  customer: Profile
}

interface RepresentativeDashboardProps {
  profile: Profile
}

export default function RepresentativeDashboard({ profile }: RepresentativeDashboardProps) {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')
  const [conversations, setConversations] = useState<ConversationWithCustomer[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    loadConversations()
    subscribeToConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages()
      subscribeToMessages()
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadConversations() {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(
          `
          *,
          customer:profiles!conversations_customer_id_fkey(*)
        `,
        )
        .in('status', ['waiting', 'active'])
        .order('updated_at', { ascending: false })

      if (error) {
        throw error
      }
      setConversations(data as ConversationWithCustomer[])
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  function subscribeToConversations() {
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          loadConversations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function loadMessages() {
    if (!selectedConversation) {
      return
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  function subscribeToMessages() {
    if (!selectedConversation) {
      return
    }

    const channel = supabase
      .channel(`conversation-${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) {
              return prev
            }
            return [...prev, newMessage]
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function assignConversation(conversationId: string) {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ rep_id: profile.id, status: 'active' })
        .eq('id', conversationId)

      if (error) {
        throw error
      }
      setSelectedConversation(conversationId)
      loadConversations()
    } catch (error) {
      console.error('Error assigning conversation:', error)
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || sending) {
      return
    }

    const messageContent = newMessage.trim()
    setNewMessage('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setSending(true)

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversation,
      sender_id: profile.id,
      content: messageContent,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempMessage])

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: profile.id,
          content: messageContent,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? data : msg)))
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  async function closeConversation() {
    if (!selectedConversation) {
      return
    }

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'closed' })
        .eq('id', selectedConversation)

      if (error) {
        throw error
      }
      setSelectedConversation(null)
      setMessages([])
      loadConversations()
    } catch (error) {
      console.error('Error closing conversation:', error)
    }
  }

  const currentConversation = conversations.find((c) => c.id === selectedConversation)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <TopNav activeItem={activeNav} onNavigate={setActiveNav} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TopNav activeItem={activeNav} onNavigate={setActiveNav} onLogout={handleLogout} />
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-80 bg-white border-r flex flex-col shadow-lg">
          <div className="p-6 border-b bg-gradient-to-r from-slate-700 to-slate-800">
            <div className="flex items-center gap-3 text-white mb-2">
              <Users className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Support Queue</h2>
            </div>
            <p className="text-slate-300 text-sm">{conversations.length} active conversations</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No active conversations</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => {
                    if (conversation.status === 'waiting') {
                      assignConversation(conversation.id)
                    } else {
                      setSelectedConversation(conversation.id)
                    }
                  }}
                  className={`w-full p-4 text-left border-b hover:bg-slate-50 transition-colors ${
                    selectedConversation === conversation.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-600'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{conversation.customer.name}</h3>
                    {conversation.status === 'waiting' ? (
                      <Clock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{conversation.customer.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        conversation.status === 'waiting'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {conversation.status === 'waiting' ? 'Waiting' : 'Active'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(conversation.updated_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedConversation && currentConversation ? (
            <>
              <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-800">
                    {currentConversation.customer.name}
                  </h1>
                  <p className="text-sm text-gray-500">{currentConversation.customer.email}</p>
                </div>
                <button
                  onClick={closeConversation}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  Close Conversation
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === profile.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        message.sender_id === profile.id
                          ? 'bg-slate-700 text-white'
                          : 'bg-white text-gray-800'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_id === profile.id ? 'text-slate-300' : 'text-gray-400'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="bg-white border-t px-6 py-4">
                <div className="flex gap-3 items-end">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none min-h-[48px] max-h-[200px]"
                    disabled={sending}
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = `${Math.min(target.scrollHeight, 200)}px`
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-slate-700 text-white px-6 py-3 rounded-full hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <header className="bg-white shadow-md px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-800">Support Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {profile.name}</p>
              </header>
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
