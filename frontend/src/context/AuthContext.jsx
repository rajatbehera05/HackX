import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseAuthAvailable } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseAuthAvailable || !supabase) {
      // Dev / Demo Mode: restore existing session if present, otherwise remain logged out
      const savedGuest = localStorage.getItem('hackx_guest_user');
      const savedToken = localStorage.getItem('hackx_token');
      if (savedGuest && savedToken) {
        try {
          const parsed = JSON.parse(savedGuest);
          setUser(parsed);
        } catch {
          localStorage.removeItem('hackx_guest_user');
          localStorage.removeItem('hackx_token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      return;
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('hackx_token', session.access_token);
      } else {
        setUser(null);
        localStorage.removeItem('hackx_token');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('hackx_token', session.access_token);
      } else {
        setUser(null);
        localStorage.removeItem('hackx_token');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseAuthAvailable || !supabase) {
      const cleanEmail = email.trim().toLowerCase();
      const userId = 'dev-' + cleanEmail.replace(/[^a-z0-9]/g, '_');
      const guest = {
        id: userId,
        email: cleanEmail,
        user_metadata: { name: cleanEmail.split('@')[0] },
        isGuest: true,
      };
      setUser(guest);
      localStorage.setItem('hackx_guest_user', JSON.stringify(guest));
      localStorage.setItem('hackx_token', `dev-token-${guest.id}`);
      return { user: guest };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      localStorage.setItem('hackx_token', data.session.access_token);
    }
    return data;
  };

  const signUp = async (email, password, name) => {
    if (!isSupabaseAuthAvailable || !supabase) {
      const cleanEmail = email.trim().toLowerCase();
      const userId = 'dev-' + cleanEmail.replace(/[^a-z0-9]/g, '_');
      const guest = {
        id: userId,
        email: cleanEmail,
        user_metadata: { name: name?.trim() || cleanEmail.split('@')[0] },
        isGuest: true,
      };
      setUser(guest);
      localStorage.setItem('hackx_guest_user', JSON.stringify(guest));
      localStorage.setItem('hackx_token', `dev-token-${guest.id}`);
      return { user: guest };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    if (data.session) {
      localStorage.setItem('hackx_token', data.session.access_token);
    }
    return data;
  };

  const continueAsGuest = () => {
    const guest = {
      id: 'guest-developer',
      email: 'guest@hackx.dev',
      user_metadata: { name: 'Guest Developer' },
      isGuest: true,
    };
    setUser(guest);
    localStorage.setItem('hackx_guest_user', JSON.stringify(guest));
    localStorage.setItem('hackx_token', `dev-token-${guest.id}`);
    return { user: guest };
  };

  const signOut = async () => {
    if (isSupabaseAuthAvailable && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    localStorage.removeItem('hackx_token');
    localStorage.removeItem('hackx_guest_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, continueAsGuest, isSupabaseAuthAvailable }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
