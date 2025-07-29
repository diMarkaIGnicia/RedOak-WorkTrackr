import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserProfileContext } from '../context/UserProfileContext';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  action?: 'logout';
}

const MENU_ITEMS: { [key: string]: MenuItem[] } = {
  employee: [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
        </svg>
      ),
    },
    {
      label: 'Horas',
      path: '/horas-trabajadas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Reportes',
      path: '/reportes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
      ),
    },
    {
      label: 'Facturas',
      path: '/facturas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ],
  administrator: [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
        </svg>
      ),
    },
    {
      label: 'Reportes',
      path: '/reportes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
      ),
    },
    {
      label: 'Tareas',
      path: '/tareas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Usuarios',
      path: '/usuarios',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 10-5.656 5.656 3.75 3.75 0 005.656-5.656zM18 18.72a9.094 9.094 0 01-3.741-.479 3 3 0 014.682-2.72m-7.5-2.962a3.75 3.75 0 115.656 5.656 3.75 3.75 0 01-5.656-5.656zM18 18.72L18.75 15.75m-7.5-2.962L11.25 11.25" />
        </svg>
      ),
    },
  ],
};

const bottomMenu: MenuItem[] = [
  {
    label: 'Mi perfil',
    path: '/perfil',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    label: 'Cerrar sesión',
    path: '/logout',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12" />
      </svg>
    ),
    action: 'logout',
  },
];

interface ModuleSidebarProps {
  open: boolean;
  onClose: () => void;
}

const ModuleSidebar: React.FC<ModuleSidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useUserProfileContext();

  // Determinar menú según rol
  let mainMenu: MenuItem[] = [];
  if (profile?.role === 'administrator') {
    mainMenu = MENU_ITEMS.administrator;
  } else if (profile?.role === 'employee') {
    mainMenu = MENU_ITEMS.employee;
  }

  return (
    <>
      {/* Overlay para móvil */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden" onClick={onClose}></div>
      )}
      <aside
        className={`fixed z-50 lg:static left-0 top-14 lg:top-0 h-[calc(100vh-56px)] lg:h-full bg-white border-r shadow-xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64 lg:w-56 overflow-y-auto pb-28 lg:pb-0`}
      >
        <nav className="flex-1 flex flex-col gap-2 py-6">
          {mainMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-2 font-semibold text-base transition-colors group ${location.pathname === item.path ? 'bg-secondary text-white shadow-inner' : 'text-gray-700 hover:bg-accent hover:text-white'}`}
              onClick={onClose}
            >
              <span className="text-secondary group-hover:text-white group-active:scale-95 transition-transform">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        {/* Menú inferior */}
        <div className="flex flex-col gap-2 px-4 pb-6 mt-auto border-t border-gray-200 pt-4 sticky bottom-0 bg-white">
          {bottomMenu.map((item) => {
            if (item.action === 'logout') {
              return (
                <button
                  key={item.label}
                  className="flex items-center gap-4 w-full px-2 py-2 rounded-lg font-semibold text-base transition-colors group text-muted hover:bg-primary hover:text-white"
                  onClick={async () => {
                    const { supabase } = await import('../services/supabaseClient');
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                  }}
                >
                  <span className="text-primary group-hover:text-white group-active:scale-95 transition-transform">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            } else {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-2 py-2 rounded-lg font-semibold text-base transition-colors group text-muted hover:bg-secondary hover:text-white`}
                  onClick={onClose}
                >
                  <span className="text-secondary group-hover:text-white group-active:scale-95 transition-transform">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      </aside>
      
    </>
  );
};

export default ModuleSidebar;
