import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, LogOut, Users, Pencil, Trash2, X, Shield, MessageSquare, Eye } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Conversation = Database['public']['Tables']['conversations']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'representatives' | 'admins' | 'chats';

interface ConversationWithProfiles extends Conversation {
  customer?: Profile;
  representative?: Profile;
  messageCount?: number;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('representatives');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [representatives, setRepresentatives] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [conversations, setConversations] = useState<ConversationWithProfiles[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithProfiles | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [editingRep, setEditingRep] = useState<Profile | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<Profile | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  useEffect(() => {
    fetchRepresentatives();
    fetchAdmins();
    fetchConversations();
  }, []);

  const fetchRepresentatives = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'representative')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRepresentatives(data);
    }
  };

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAdmins(data);
    }
  };

  const fetchConversations = async () => {
    const { data: convos, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !convos) return;

    const conversationsWithProfiles = await Promise.all(
      convos.map(async (convo) => {
        const { data: customer } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', convo.customer_id)
          .maybeSingle();

        let representative = null;
        if (convo.rep_id) {
          const { data: rep } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', convo.rep_id)
            .maybeSingle();
          representative = rep;
        }

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', convo.id);

        return {
          ...convo,
          customer: customer || undefined,
          representative: representative || undefined,
          messageCount: count || 0,
        };
      })
    );

    setConversations(conversationsWithProfiles);
  };

  const handleCreateRep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          email,
          name,
          role: 'representative',
        });

      if (profileError) throw profileError;

      setMessage('Representative profile created successfully! They can now sign up with this email.');
      setEmail('');
      setName('');
      setShowAddModal(false);
      fetchRepresentatives();
    } catch (error: any) {
      setMessage(error.message || 'Failed to create representative profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (rep: Profile) => {
    setEditingRep(rep);
    setEditName(rep.name);
    setEditEmail(rep.email);
  };

  const handleCancelEdit = () => {
    setEditingRep(null);
    setEditName('');
    setEditEmail('');
  };

  const handleUpdateRep = async (rep: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editName,
          email: editEmail,
        })
        .eq('id', rep.id);

      if (error) throw error;

      setMessage('Representative updated successfully!');
      setEditingRep(null);
      fetchRepresentatives();
    } catch (error: any) {
      setMessage(error.message || 'Failed to update representative');
    }
  };

  const handleDeleteRep = async (rep: Profile) => {
    if (!confirm(`Are you sure you want to delete ${rep.name}?`)) {
      return;
    }

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', rep.id);

      if (profileError) throw profileError;

      setMessage('Representative deleted successfully!');
      fetchRepresentatives();
    } catch (error: any) {
      setMessage(error.message || 'Failed to delete representative');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          email,
          name,
          role: 'admin',
        });

      if (profileError) throw profileError;

      setMessage('Admin profile created successfully! They can now sign up with this email.');
      setEmail('');
      setName('');
      setShowAddModal(false);
      fetchAdmins();
    } catch (error: any) {
      setMessage(error.message || 'Failed to create admin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditAdmin = (admin: Profile) => {
    setEditingAdmin(admin);
    setEditName(admin.name);
    setEditEmail(admin.email);
  };

  const handleCancelEditAdmin = () => {
    setEditingAdmin(null);
    setEditName('');
    setEditEmail('');
  };

  const handleUpdateAdmin = async (admin: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editName,
          email: editEmail,
        })
        .eq('id', admin.id);

      if (error) throw error;

      setMessage('Admin updated successfully!');
      setEditingAdmin(null);
      fetchAdmins();
    } catch (error: any) {
      setMessage(error.message || 'Failed to update admin');
    }
  };

  const handleDeleteAdmin = async (admin: Profile) => {
    if (!confirm(`Are you sure you want to delete ${admin.name}?`)) {
      return;
    }

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', admin.id);

      if (profileError) throw profileError;

      setMessage('Admin deleted successfully!');
      fetchAdmins();
    } catch (error: any) {
      setMessage(error.message || 'Failed to delete admin');
    }
  };

  const handleViewConversation = async (conversation: ConversationWithProfiles) => {
    setSelectedConversation(conversation);
    setShowMessagesModal(true);

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (!error && messages) {
      setConversationMessages(messages);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 p-3 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 text-sm">Manage support representatives</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('representatives')}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'representatives'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Representatives ({representatives.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'admins'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admins ({admins.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'chats'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chats ({conversations.length})</span>
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  {activeTab === 'representatives' ? (
                    <Users className="w-5 h-5 text-slate-600" />
                  ) : activeTab === 'admins' ? (
                    <Shield className="w-5 h-5 text-slate-600" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {activeTab === 'representatives'
                    ? `Support Representatives (${representatives.length})`
                    : activeTab === 'admins'
                    ? `Admins (${admins.length})`
                    : `Active Chats (${conversations.length})`}
                </h2>
              </div>
              {activeTab !== 'chats' && (
                <button
                  onClick={() => {
                    setShowAddModal(true);
                    setEmail('');
                    setName('');
                    setMessage('');
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add {activeTab === 'representatives' ? 'Representative' : 'Admin'}</span>
                </button>
              )}
            </div>

          {activeTab === 'chats' ? (
            conversations.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet.</p>
                <p className="text-sm mt-1">Conversations will appear here when customers start chatting.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Representative</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Messages</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Last Updated</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversations.map((convo) => (
                      <tr key={convo.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                          {convo.customer?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {convo.representative?.name || 'Unassigned'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              convo.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : convo.status === 'waiting'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {convo.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {convo.messageCount || 0}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {new Date(convo.updated_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleViewConversation(convo)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Messages"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === 'representatives' ? (
            representatives.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No support representatives yet.</p>
                <p className="text-sm mt-1">Create your first one using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Created</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {representatives.map((rep) => (
                    <tr key={rep.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      {editingRep?.id === rep.id ? (
                        <>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            />
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {new Date(rep.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleUpdateRep(rep)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 text-sm text-slate-900 font-medium">{rep.name}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{rep.email}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {new Date(rep.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleStartEdit(rep)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRep(rep)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            admins.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No admins yet.</p>
                <p className="text-sm mt-1">Create your first one using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Created</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        {editingAdmin?.id === admin.id ? (
                          <>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                              />
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {new Date(admin.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleUpdateAdmin(admin)}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEditAdmin}
                                  className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4 text-sm text-slate-900 font-medium">{admin.name}</td>
                            <td className="py-3 px-4 text-sm text-slate-600">{admin.email}</td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {new Date(admin.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleStartEditAdmin(admin)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAdmin(admin)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  {activeTab === 'representatives' ? (
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Shield className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Add {activeTab === 'representatives' ? 'Support Representative' : 'Admin'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setMessage('');
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={activeTab === 'representatives' ? handleCreateRep : handleCreateAdmin} className="p-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <p className="text-sm text-slate-500 mt-1">
                  {activeTab === 'representatives'
                    ? 'The representative will be able to sign up with this email'
                    : 'The admin will be able to sign up with this email'}
                </p>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.includes('successfully')
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : `Create ${activeTab === 'representatives' ? 'Representative' : 'Admin'} Profile`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setMessage('');
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMessagesModal && selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Conversation Details
                  </h2>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span>Customer: <strong>{selectedConversation.customer?.name}</strong></span>
                  <span>|</span>
                  <span>Representative: <strong>{selectedConversation.representative?.name || 'Unassigned'}</strong></span>
                  <span>|</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedConversation.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : selectedConversation.status === 'waiting'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {selectedConversation.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMessagesModal(false);
                  setSelectedConversation(null);
                  setConversationMessages([]);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              {conversationMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages in this conversation yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversationMessages.map((msg) => {
                    const isCustomer = msg.sender_id === selectedConversation.customer_id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[70%] ${isCustomer ? 'order-1' : 'order-2'}`}>
                          <div className="flex items-baseline space-x-2 mb-1">
                            <span className="text-xs font-medium text-slate-600">
                              {isCustomer ? selectedConversation.customer?.name : selectedConversation.representative?.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              isCustomer
                                ? 'bg-slate-100 text-slate-900'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
