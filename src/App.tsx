import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { UserProfileProvider } from './context/UserProfileContext';

import { Toaster } from 'react-hot-toast';

const App: React.FC = () => (
  <UserProfileProvider>
    <AppRoutes />
    <Toaster position="top-right" />
  </UserProfileProvider>
);

export default App;
