import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { UserProfileProvider } from './context/UserProfileContext';

import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {

  return (
    <AuthProvider>
      <UserProfileProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </UserProfileProvider>
    </AuthProvider>
  );
};

export default App;

