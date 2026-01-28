import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
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
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    // If no role exists (OAuth first-time login), create reader role
    await supabase.from('user_roles').insert({
      user_id: userId,
      role: 'reader',
      publisher_requested: false
    });
    return 'reader';
  }
  
  return data.role as UserRole;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await getUserRole(session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
      setLoading(false);
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
