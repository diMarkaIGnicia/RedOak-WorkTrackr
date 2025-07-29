import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

export interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  photo_url?: string;
  account_name?: string;
  account_number?: string;
  bsb?: string;
  abn?: string;
  mobile_number?: string;
  address?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const { profile, loading, error, refetch } = useUserProfile(user?.id);
  
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await refetch();
    }
  }, [user?.id, refetch]);
  
  return (
    <UserProfileContext.Provider value={{ profile, loading, error, refreshProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfileContext = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfileContext must be used within a UserProfileProvider');
  return ctx;
};
