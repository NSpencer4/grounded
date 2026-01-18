import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Send, MessageCircle, User, Menu, X, Plus, LogOut } from 'lucide-react'
import type { Database } from '../lib/database.types'

type Message = Database['public']['Tables']['messages']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']

interface CustomerChatProps {
  profile: Profile
}

export default function CustomerChat({ profile }: CustomerChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    loadOrCreateConversation()
    loadConversations()
  }, [profile.id])

  useEffect(() => {
    if (conversationId) {
      loadMessages()
      subscribeToMessages()
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadOrCreateConversation() {
    try {
      const { data: existingConversations, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('customer_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

      if (fetchError) throw fetchError

      if (existingConversations && existingConversations.length > 0) {
        setConversationId(existingConversations[0].id)
      } else {
        const { data: waitingConversation, error: waitingError } = await supabase
          .from('conversations')
          .select('*')
          .eq('customer_id', profile.id)
          .eq('status', 'waiting')
          .order('created_at', { ascending: false })
          .limit(1)

        if (waitingError) throw waitingError

        if (waitingConversation && waitingConversation.length > 0) {
          setConversationId(waitingConversation[0].id)
        } else {
          const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({ customer_id: profile.id, status: 'waiting' })
            .select()
            .single()

          if (createError) throw createError
          setConversationId(newConversation.id)
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadConversations() {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('customer_id', profile.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setConversations(data || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  async function createNewConversation() {
    try {
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({ customer_id: profile.id, status: 'waiting' })
        .select()
        .single()

      if (error) throw error

      setConversationId(newConversation.id)
      await loadConversations()
      setSidebarOpen(false)
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  function switchConversation(id: string) {
    setConversationId(id)
    setSidebarOpen(false)
  }

  async function loadMessages() {
    if (!conversationId) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  function subscribeToMessages() {
    if (!conversationId) return

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
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

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId || sending) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setSending(true)

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: profile.id,
      content: messageContent,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempMessage])

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content: messageContent,
        })
        .select()
        .single()

      if (error) throw error

      setMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? data : msg)))
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-gray-600">Loading chat...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <header className="bg-white shadow-md px-6 py-4 flex items-center gap-3 z-50 relative">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-1 hover:bg-gray-100 rounded"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <MessageCircle className="w-6 h-6 text-blue-600" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800">Customer Support</h1>
          <p className="text-sm text-gray-500">We're here to help you</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 top-[73px] left-0 z-40 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:top-0 lg:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4">
              <button
                onClick={createNewConversation}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Conversation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No conversations yet</div>
              ) : (
                <div className="space-y-1 px-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => switchConversation(conv.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        conv.id === conversationId
                          ? 'bg-blue-100 border border-blue-300'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-gray-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">Conversation</p>
                          <p className="text-xs text-gray-500">
                            {new Date(conv.updated_at || conv.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            conv.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : conv.status === 'waiting'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {conv.status}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 top-[73px] bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Start a conversation</p>
                  <p className="text-sm">Send a message to connect with a support representative</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === profile.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className="flex flex-col max-w-xs lg:max-w-md">
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {message.sender_id === profile.id ? profile.name : 'Support'}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        message.sender_id === profile.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_id === profile.id ? 'text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
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

          <form onSubmit={sendMessage} className="bg-white border-t px-6 py-4">
            <div className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[48px] max-h-[200px]"
                disabled={sending}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 200) + 'px'
                }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
