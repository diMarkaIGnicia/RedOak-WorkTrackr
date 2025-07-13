import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { UserProfileProvider } from './context/UserProfileContext';

const App: React.FC = () => (
  <UserProfileProvider>
    <AppRoutes />
  </UserProfileProvider>
);

export default App;
