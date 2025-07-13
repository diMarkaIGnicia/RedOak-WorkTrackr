import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.id);
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header sticky solo en móvil */}
        <header className="md:hidden sticky top-0 z-30 bg-white flex items-center justify-between px-4 h-14 border-b shadow-sm">
          {/* El botón hamburguesa ya está en Sidebar, así que solo dejamos espacio aquí */}
          <div className="w-10"></div>
          {/* Solo nombre en móvil, avatar completo en desktop si se requiere */}
          <span className="md:hidden font-semibold text-red-900 truncate max-w-[120px]">{profile?.nombre || user?.email || 'Usuario'}</span>
        </header>
        {/* Padding top para que el contenido no quede tapado por el header en móvil */}
        <main className="flex-1 bg-gray-50 p-6 overflow-auto pt-0 md:pt-6">
          <div className="md:pt-0 pt-4">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
