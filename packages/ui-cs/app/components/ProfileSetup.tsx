import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserCircle, LogOut } from 'lucide-react';

interface ProfileSetupProps {
  onProfileCreated: () => void;
}

export default function ProfileSetup({ onProfileCreated }: ProfileSetupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setEmail(user.email || '');
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!userId) {
      setError('User authentication error. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            user_id: userId,
            name: name.trim(),
          })
          .eq('id', existingProfile.id);

        if (updateError) throw updateError;
      } else {
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            name: name.trim(),
            email: email.toLowerCase(),
            role: 'customer',
          });

        if (createError) throw createError;
      }

      onProfileCreated();
    } catch (err: any) {
      console.error('Error creating profile:', err);
      const errorMessage = err?.message || 'Failed to create profile. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCircle className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Profile Setup</h1>
            <p className="text-sm text-gray-500">Complete your profile</p>
          </div>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </header>

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-73px)]">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <UserCircle className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
          <p className="text-gray-600">Set up your profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="john@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">Email from your account</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {loading ? 'Creating Profile...' : 'Continue'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Complete your profile to access the support system
        </p>
        </div>
      </div>
    </div>
  );
}
