import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, requestPublisher?: boolean) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const getUserRole = async (userId: string): Promise<UserRole> => {
  if (!isSupabaseConfigured) return 'publisher';
  
  try {
    console.log('[getUserRole] Starting query for:', userId);
    
    // WORKAROUND: Add 3-second timeout since Supabase queries hang in browser
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), 3000)
    );
    
    const queryPromise = supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    console.log('[getUserRole] Query created, awaiting with timeout...');
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    console.log('[getUserRole] Query complete:', { data, error });
    
    if (error) {
      console.warn('Could not fetch user role, defaulting to publisher:', error.message);
      return 'publisher'; // Default to publisher for development
    }
    
    return (data?.role as UserRole) || 'publisher';
  } catch (err: any) {
    console.warn('Error fetching user role, defaulting to publisher:', err.message);
    return 'publisher'; // Default to publisher on timeout/error
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Skip auth if Supabase is not configured (development mode)
    if (!isSupabaseConfigured) {
      // Set a mock user for development
      setUser({
        id: 'dev-user',
        email: 'dev@localhost',
        role: 'publisher'
      });
      setLoading(false);
      return;
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH] State change:', event, !!session);
      try {
        if (session?.user) {
          console.log('[AUTH] Fetching role for user:', session.user.id);
          const role = await getUserRole(session.user.id);
          console.log('[AUTH] Got role:', role);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role
          });
          console.log('[AUTH] User set successfully');
        } else {
          console.log('[AUTH] No session, clearing user');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setUser(null);
      } finally {
        // Mark initial check as done after first auth state change
        if (!initialCheckDone) {
          setInitialCheckDone(true);
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data.user) {
      const role = await getUserRole(data.user.id);
      setUser({
        id: data.user.id,
        email: data.user.email!,
        role
      });
    }
  };

  const signUp = async (email: string, password: string, role: UserRole, requestPublisher: boolean = false) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    // Create role record
    if (data.user) {
      await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role,
        publisher_requested: requestPublisher
      });

      setUser({
        id: data.user.id,
        email: data.user.email!,
        role
      });
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;

    // Note: User data will be set via onAuthStateChange after redirect
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithProvider, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
