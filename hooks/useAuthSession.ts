import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseService';

export interface UseAuthSessionReturn {
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook for managing Supabase authentication session state.
 * Handles session initialization and auth state change subscription.
 */
export function useAuthSession(): UseAuthSessionReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return {
    session,
    loading,
    isAuthenticated: !!session?.user,
  };
}

export default useAuthSession;
