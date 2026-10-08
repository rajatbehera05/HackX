import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseAuthAvailable } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseAuthAvailable || !supabase) {
      // Demo / Guest mode
      const savedGuest = localStorage.getItem('hackx_guest_user');
      if (savedGuest) {
        setUser(JSON.parse(savedGuest));
      } else {
        const defaultGuest = {
          id: 'dev-user',
          email: 'hacker@hackx.dev',
          user_metadata: { name: 'Hackathon Lead' },
          isGuest: true,
        };
        setUser(defaultGuest);
        localStorage.setItem('hackx_guest_user', JSON.stringify(defaultGuest));
      }
      setLoading(false);
      return;
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('hackx_token', session.access_token);
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
      const guest = { id: 'dev-user', email, user_metadata: { name: email.split('@')[0] }, isGuest: true };
      setUser(guest);
      localStorage.setItem('hackx_guest_user', JSON.stringify(guest));
      return { user: guest };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, name) => {
    if (!isSupabaseAuthAvailable || !supabase) {
      const guest = { id: 'dev-user', email, user_metadata: { name: name || email.split('@')[0] }, isGuest: true };
      setUser(guest);
      localStorage.setItem('hackx_guest_user', JSON.stringify(guest));
      return { user: guest };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (isSupabaseAuthAvailable && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('hackx_token');
    localStorage.removeItem('hackx_guest_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isSupabaseAuthAvailable }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
