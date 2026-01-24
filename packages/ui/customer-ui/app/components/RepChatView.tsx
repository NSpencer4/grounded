import { useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Bell,
  Bot,
  ChevronRight,
  FileText,
  Hand,
  Plus,
  PlusCircle,
  Search,
  Send,
  Settings,
} from 'lucide-react'

interface RepChatViewProps {
  onLogout: () => void
  userName?: string
  userAvatar?: string
  onBack?: () => void
}

// Mock chat list data
const chatList = [
  {
    id: 1,
    name: 'Alex Rivera',
    avatar: null,
    initials: 'AR',
    lastMessage: 'AI unable to connect domain...',
    time: '2m ago',
    status: 'escalated',
    isOnline: false,
    isSelected: true,
  },
  {
    id: 2,
    name: 'Sarah Chen',
    avatar: null,
    initials: 'SC',
    lastMessage: 'Billing discrepancy for Pro plan renewal',
    time: '15m ago',
    status: 'ai-handled',
    isOnline: true,
    isSelected: false,
  },
  {
    id: 3,
    name: 'Marcus Thorne',
    avatar: null,
    initials: 'MT',
    lastMessage: 'How do I export my project to HTML?',
    time: '1h ago',
    status: 'normal',
    isOnline: false,
    isSelected: false,
  },
]

// Mock messages data
const messages = [
  {
    id: 1,
    type: 'user',
    sender: 'Alex Rivera',
    initials: 'AR',
    content:
      "I'm trying to connect my custom domain (alexrivera.io) but I keep getting a CNAME error. I followed the documentation but it's not working.",
    time: '10:42 AM',
  },
  {
    id: 2,
    type: 'ai',
    sender: 'AI Assistant',
    content:
      "I've checked your DNS records. It seems the CNAME points to the wrong host. Please ensure it is pointing to `proxy.builder.com`. Would you like me to guide you through the setup for Namecheap?",
    time: '10:43 AM',
  },
  {
    id: 3,
    type: 'user',
    sender: 'Alex Rivera',
    initials: 'AR',
    content:
      "I did that, but it's still failing. I need a real person to check this because I have a launch in 2 hours.",
    time: '10:44 AM',
  },
  {
    id: 4,
    type: 'escalation',
    content: 'Escalated to Human Support',
  },
  {
    id: 5,
    type: 'system',
    content: 'Agent (You) joined the conversation',
  },
]

// Selected customer data
const selectedCustomer = {
  name: 'Alex Rivera',
  email: 'alex.rivera@designstudio.co',
  initials: 'AR',
  tier: 'Pro Plan',
  joined: 'Oct 2023',
  tokenBalance: 8400,
  tokenLimit: 10000,
  lastBilling: 'Mar 01, 2024',
  activeSites: 3,
  sitesLimit: 10,
  ticketId: 'AI-9402',
  issue: 'Connection Issue',
  summary: {
    problem: 'CNAME configuration error',
    details:
      'The user is experiencing a CNAME configuration error for their custom domain. They have attempted manual setup via Namecheap documentation but the record is not resolving.',
    urgency: 'High (Project launch in 2 hours)',
    recommendation:
      'Verify the record in our backend and check for propagation status via Cloudflare.',
  },
  context: [
    { label: 'Browser', value: 'Chrome 122' },
    { label: 'OS', value: 'macOS 14.3' },
    { label: 'Location', value: 'London, UK' },
  ],
}

const quickReplies = ['/greet', '/dns-guide', '/wait']

export default function RepChatView({
  onLogout,
  userName = 'Agent',
  userAvatar,
  onBack,
}: RepChatViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'escalated' | 'history'>('active')
  const [messageInput, setMessageInput] = useState('')
  const [selectedChatId, setSelectedChatId] = useState(1)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 h-16 shrink-0">
        <div className="flex items-center gap-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">
              Live Support Console
            </h2>
          </div>
          <div className="flex items-center h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-slate-400 flex bg-slate-100 items-center justify-center pl-4 rounded-l-lg">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex w-full min-w-0 flex-1 border-none bg-slate-100 focus:ring-0 h-full placeholder:text-slate-500 px-4 rounded-r-lg text-sm font-normal outline-none"
                placeholder="Search chats or users..."
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
            <span className="size-2 rounded-full bg-green-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider">Online</span>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center rounded-lg size-10 bg-slate-100 text-slate-600 hover:bg-slate-200">
              <Bell className="w-5 h-5" />
            </button>
            <button className="flex items-center justify-center rounded-lg size-10 bg-slate-100 text-slate-600 hover:bg-slate-200">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          {userAvatar ? (
            <div
              className="size-10 rounded-full bg-cover bg-center border border-slate-200"
              style={{ backgroundImage: `url("${userAvatar}")` }}
            />
          ) : (
            <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(userName)}
            </div>
          )}
          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar: Chat List */}
        <aside className="w-80 border-r border-slate-200 flex flex-col bg-white">
          <div className="p-4 flex flex-col gap-4 border-b border-slate-200">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {(['active', 'escalated', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-md capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chatList.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`flex items-center gap-3 px-4 min-h-[72px] py-3 cursor-pointer border-b border-slate-100 transition-colors ${
                  chat.id === selectedChatId
                    ? 'bg-blue-50 border-l-4 border-l-blue-600'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative">
                  <div className="size-12 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                    {chat.initials}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${
                      chat.status === 'escalated'
                        ? 'bg-orange-500'
                        : chat.isOnline
                          ? 'bg-green-500'
                          : 'bg-slate-400'
                    }`}
                  />
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-slate-900 text-sm font-bold truncate">{chat.name}</p>
                    <span className="text-[10px] text-slate-500">{chat.time}</span>
                  </div>
                  <p
                    className={`text-xs truncate ${
                      chat.id === selectedChatId ? 'text-blue-600 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {chat.lastMessage}
                  </p>
                  {chat.status === 'escalated' && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-[10px] text-orange-500 font-bold uppercase tracking-tight">
                        Escalated
                      </span>
                    </div>
                  )}
                  {chat.status === 'ai-handled' && (
                    <div className="flex items-center gap-1 mt-1 text-slate-400">
                      <Bot className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium">Handled by AI</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Chat Window */}
        <section className="flex-1 flex flex-col bg-slate-50 relative">
          {/* Chat Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                {selectedCustomer.initials}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-500">
                  Ticket #{selectedCustomer.ticketId} • {selectedCustomer.issue}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50">
                Transfer
              </button>
              <button className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Resolve Chat
              </button>
            </div>
          </div>

          {/* Message Feed */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {messages.map((message) => {
              if (message.type === 'user') {
                return (
                  <div key={message.id} className="flex gap-3 max-w-[80%]">
                    <div className="size-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600">
                      {message.initials}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-slate-200">
                        <p className="text-sm leading-relaxed text-slate-700">{message.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 ml-1">{message.time}</span>
                    </div>
                  </div>
                )
              }

              if (message.type === 'ai') {
                return (
                  <div
                    key={message.id}
                    className="flex gap-3 max-w-[80%] self-end flex-row-reverse"
                  >
                    <div className="size-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <div className="bg-blue-600 text-white p-3 rounded-xl rounded-tr-none shadow-md">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 mr-1">
                        {message.time} • AI Assistant
                      </span>
                    </div>
                  </div>
                )
              }

              if (message.type === 'escalation') {
                return (
                  <div key={message.id} className="flex items-center gap-4 py-4">
                    <div className="flex-1 h-[1px] bg-orange-200"></div>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                      <Hand className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {message.content}
                      </span>
                    </div>
                    <div className="flex-1 h-[1px] bg-orange-200"></div>
                  </div>
                )
              }

              if (message.type === 'system') {
                return (
                  <div key={message.id} className="flex justify-center">
                    <p className="text-[11px] font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      {message.content}
                    </p>
                  </div>
                )
              }

              return null
            })}

            {/* Typing Indicator */}
            <div className="flex gap-3 max-w-[80%] self-end flex-row-reverse opacity-60">
              <div className="size-8 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                {getInitials(userName)}
              </div>
              <div className="flex flex-col gap-1 items-end">
                <div className="bg-slate-200 p-2 px-4 rounded-xl">
                  <div className="flex gap-1 py-1">
                    <div className="size-1.5 rounded-full bg-slate-400 animate-bounce"></div>
                    <div className="size-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="size-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    className="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 rounded hover:text-blue-600 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
                <div className="h-3 w-[1px] bg-slate-200 mx-1"></div>
                <span className="text-[10px] text-slate-400">Type '/' for quick replies</span>
              </div>
              <div className="flex items-end gap-3 bg-slate-50 rounded-xl p-2 border border-slate-200 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600/20 transition-all">
                <button className="p-2 text-slate-400 hover:text-slate-600">
                  <PlusCircle className="w-5 h-5" />
                </button>
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none py-2 px-0 max-h-32 min-h-[40px] placeholder:text-slate-500 outline-none"
                  placeholder={`Type a message to ${selectedCustomer.name}...`}
                />
                <button className="size-10 flex items-center justify-center bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Context Panel */}
        <aside className="w-80 border-l border-slate-200 flex flex-col bg-white overflow-y-auto">
          {/* Customer Profile */}
          <div className="p-6 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Customer Profile
            </h4>
            <div className="flex flex-col items-center text-center">
              <div className="size-20 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 mb-3 border-4 border-slate-50 shadow-sm">
                {selectedCustomer.initials}
              </div>
              <h5 className="text-base font-bold text-slate-900 leading-tight">
                {selectedCustomer.name}
              </h5>
              <p className="text-xs text-slate-500 mb-4">{selectedCustomer.email}</p>
              <div className="flex w-full gap-2">
                <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-500 mb-1">Tier</p>
                  <div className="flex items-center justify-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold">{selectedCustomer.tier}</span>
                  </div>
                </div>
                <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-500 mb-1">Joined</p>
                  <p className="text-xs font-bold">{selectedCustomer.joined}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="p-6 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Account Stats
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-xs font-medium text-slate-700">AI Token Balance</p>
                  <span className="text-xs font-bold text-blue-600">
                    {(selectedCustomer.tokenBalance / 1000).toFixed(1)}k /{' '}
                    {selectedCustomer.tokenLimit / 1000}k
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{
                      width: `${(selectedCustomer.tokenBalance / selectedCustomer.tokenLimit) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Last Billing</span>
                <span className="font-medium text-slate-900">{selectedCustomer.lastBilling}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Active Sites</span>
                <span className="font-medium text-slate-900">
                  {selectedCustomer.activeSites} / {selectedCustomer.sitesLimit}
                </span>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Smart Summary
              </h4>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <p className="text-xs leading-relaxed text-slate-700">
                The user is experiencing a{' '}
                <span className="text-blue-600 font-bold">{selectedCustomer.summary.problem}</span>{' '}
                for their custom domain. {selectedCustomer.summary.details.split('.')[1]}.
                <br />
                <br />
                <span className="font-bold">Urgency:</span> {selectedCustomer.summary.urgency}
                <br />
                <br />
                <span className="font-bold">Recommendation:</span>{' '}
                {selectedCustomer.summary.recommendation}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                User Context
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCustomer.context.map((ctx) => (
                  <span
                    key={ctx.label}
                    className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-medium"
                  >
                    {ctx.label}: {ctx.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Internal Notes Button */}
          <div className="mt-auto p-4 border-t border-slate-200">
            <button className="flex w-full items-center justify-between px-4 py-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors">
              <span className="text-xs font-bold">Internal Notes</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </main>
    </div>
  )
}
