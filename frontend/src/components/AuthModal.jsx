import React, { useState } from 'react';
import { X, Lock, Mail, User, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose }) {
  const { signIn, signUp, continueAsGuest, isSupabaseAuthAvailable } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-[#111622] border border-[#1e2638] rounded-md shadow-2xl p-6 relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded hover:bg-[#1a2130] transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#1e2638]">
          <div className="w-8 h-8 rounded bg-[#161c2a] border border-[#232d42] flex items-center justify-center text-blue-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              {isSignUp ? 'Create Workspace Account' : 'Sign In to HackX'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isSupabaseAuthAvailable
                ? 'Sync and access your solution blueprints'
                : 'Local Development / Preview Session'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-red-950/40 border border-red-800/40 flex items-start gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#0b0f17] border border-[#1e2638] rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="email"
                required
                placeholder="developer@hackathon.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#0b0f17] border border-[#1e2638] rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#0b0f17] border border-[#1e2638] rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded flex items-center justify-center gap-1.5 transition-colors mt-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSignUp ? 'Create Account' : 'Authenticate'}</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#1e2638] space-y-1.5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors block w-full text-center"
          >
            {isSignUp ? 'Already registered? Sign In' : 'No account? Create One'}
          </button>

          {!isSupabaseAuthAvailable && (
            <button
              type="button"
              onClick={() => {
                continueAsGuest?.();
                onClose();
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors block w-full text-center pt-1"
            >
              Continue as Guest Developer (Dev Mode)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
