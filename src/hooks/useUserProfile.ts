import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  foto_url?: string;
}

export function useUserProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setProfile(data || null);
        setLoading(false);
      });
  }, [userId]);

  return { profile, loading, error };
}
