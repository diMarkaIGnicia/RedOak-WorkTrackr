import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

interface UserProfileContextType {
  profile: any;
  loading: boolean;
  error: string | null;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const { profile, loading, error } = useUserProfile(user?.id);
  return (
    <UserProfileContext.Provider value={{ profile, loading, error }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfileContext = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfileContext must be used within a UserProfileProvider');
  return ctx;
};
