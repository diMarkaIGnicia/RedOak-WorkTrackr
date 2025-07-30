import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  photo_path?: string;
  account_name?: string;
  account_number?: string;
  bsb?: string;
  abn?: string;
  mobile_number?: string;
  address?: string;
  email?: string;
  created_at?: string;
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserProfile(userId: string | undefined): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .single();
        
      if (error) {
        console.error('Error al cargar el perfil:', error);
        setError(error.message);
        return;
      }
      
      setProfile(data || null);
    } catch (err) {
      console.error('Excepción al cargar el perfil:', err);
      setError('Error inesperado al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refetch = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      await fetchUserProfile();
    };
    
    if (userId) {
      loadProfile();
    }
    
    return () => {
      isMounted = false;
    };
  }, [userId, fetchUserProfile, refreshTrigger]);

  return { profile, loading, error, refetch };
}
