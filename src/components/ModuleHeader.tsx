import React from 'react';
import { useUserProfileContext } from '../context/UserProfileContext';
import { useAuth } from '../hooks/useAuth';

interface ModuleHeaderProps {
  onMenuClick?: () => void;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { profile } = useUserProfileContext();
  return (
    <header className="w-full h-14 bg-primary shadow-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa solo en móvil */}
        <button
          className="lg:hidden mr-2 p-2 rounded hover:bg-red-900 focus:outline-none"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src="/logo.png" alt="Logo" className="h-8 w-auto filter brightness-0 invert" />
      </div>
      <span className="font-semibold text-white truncate max-w-[180px] text-right">
        {profile?.nombre_completo || user?.email || 'Usuario'}
      </span>
    </header>
  );
};

export default ModuleHeader;
