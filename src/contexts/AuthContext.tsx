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
    // Use RPC function to bypass PostgREST schema cache issues
    // Add a 2-second timeout as safety net
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 2000)
    );
    
    const rpcPromise = supabase.rpc('get_user_role', { p_user_id: userId });
    const { data, error } = await Promise.race([rpcPromise, timeoutPromise]);
    
    if (error) {
      console.warn('Could not fetch user role, defaulting to reader:', error.message);
      return 'reader'; // Conservative default - readers have limited access
    }
    
    return (data as UserRole) || 'reader';
  } catch (err) {
    console.warn('Error fetching user role, defaulting to reader');
    return 'reader'; // Conservative default on timeout/error
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

    // Check active session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          const role = await getUserRole(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role
          });
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const role = await getUserRole(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setUser(null);
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
