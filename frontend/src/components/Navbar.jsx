import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FolderKanban, Plus, User, LogOut, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar({ onNewProjectClick }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#1e2638] bg-[#0b0f17]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-md bg-[#1e2638] border border-[#2d3852] flex items-center justify-center text-blue-400 group-hover:border-blue-500/50 transition-colors">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-slate-100 font-mono">
                  Hack<span className="text-blue-400">X</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-[#232c3f] bg-[#111724] text-slate-400">
                  v1.0
                </span>
              </div>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1 text-xs">
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/project')
                    ? 'bg-[#161c2a] text-slate-100 border border-[#232d42]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131722]'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Projects</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {onNewProjectClick && (
              <button
                onClick={onNewProjectClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            )}

            <div className="h-4 w-px bg-[#1e2638]" />

            {/* Auth status */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#111622] border border-[#1e2638] text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="max-w-[120px] truncate font-mono text-[11px]">
                    {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                  </span>
                  {user.isGuest && (
                    <span className="text-[9px] font-mono bg-[#1a2130] text-slate-400 px-1 py-0.5 rounded">
                      GUEST
                    </span>
                  )}
                </div>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#161c2a] rounded-md transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#111622] hover:bg-[#161c2a] border border-[#1e2638] rounded-md transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
