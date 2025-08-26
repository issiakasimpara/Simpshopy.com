
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  redirectToAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour rediriger vers l'interface admin (appelée explicitement)
  const redirectToAdmin = () => {
    const currentHostname = window.location.hostname;
    
    // Si on est déjà sur admin.simpshopy.com, ne rien faire
    if (currentHostname === 'admin.simpshopy.com') {
      return;
    }
    
    // Rediriger vers admin.simpshopy.com
    const adminUrl = `https://admin.simpshopy.com${window.location.pathname === '/' ? '/dashboard' : window.location.pathname}`;
    window.location.href = adminUrl;
  };

  useEffect(() => {
    // Vérifier d'abord la session existante
    const getInitialSession = async () => {
      // Log seulement en développement et très rarement
      if (import.meta.env.DEV && Math.random() < 0.01) {
        console.log('Checking for existing session...');
      }
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      if (session) {
        // Log seulement en développement et très rarement
        if (import.meta.env.DEV && Math.random() < 0.01) {
          console.log('Found existing session for user:', session.user?.email);
        }
        setSession(session);
        setUser(session.user);
      } else {
        // Log seulement en développement et très rarement
        if (import.meta.env.DEV && Math.random() < 0.01) {
          console.log('No existing session found');
        }
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Ensuite configurer l'écoute des changements d'état
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Log seulement en développement et très rarement
        if (import.meta.env.DEV && Math.random() < 0.01) {
          console.log('Auth state changed:', event, session?.user?.email);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Ne plus rediriger automatiquement après connexion
        // L'utilisateur reste sur simpshopy.com et peut accéder à l'admin via le bouton
        if (event === 'SIGNED_IN' && session) {
          // Log seulement en développement et très rarement
          if (import.meta.env.DEV && Math.random() < 0.01) {
            console.log('User signed in, staying on current domain');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    // Pour l'inscription, rediriger vers admin.simpshopy.com
    const redirectUrl = `https://admin.simpshopy.com/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    
    // Après déconnexion, rediriger vers le domaine principal
    const currentHostname = window.location.hostname;
    if (currentHostname === 'admin.simpshopy.com') {
      window.location.href = 'https://simpshopy.com';
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
    redirectToAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
