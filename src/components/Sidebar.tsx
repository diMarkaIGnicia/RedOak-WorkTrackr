import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v6m4-6v6m-4 0h4" /></svg>
    ),
  },
  {
    label: 'Reports',
    path: '/reportes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m4 0V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10m16 0a2 2 0 01-2 2H7a2 2 0 01-2-2" /></svg>
    ),
  },
  {
    label: 'Tasks',
    path: '/tareas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  {
    label: 'Users',
    path: '/usuarios',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" /></svg>
    ),
  },
];

const miscItems = [
  {
    label: 'Settings',
    path: '/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
    ),
  },
  {
    label: 'Logout',
    path: '/logout',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2h-2a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2v1" /></svg>
    ),
  },
];

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden" onClick={() => setOpen(false)}></div>
      )}
      <aside
        className={`fixed z-50 md:static left-0 top-0 h-full bg-white border-r shadow-lg flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64 md:w-56`}
      >
        <div className="flex items-center gap-2 px-6 py-6 mb-4 border-b">
          <img src="/logo.png" alt="RedOak Logo" className="w-8 h-8" />
          <span className="font-bold text-red-800 text-xl">RedOak</span>
        </div>
        <nav className="flex-1 flex flex-col gap-2 px-2 mt-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${location.pathname === item.path ? 'bg-red-50 text-red-800' : 'text-gray-700 hover:bg-gray-100 hover:text-red-700'}`}
              onClick={() => setOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 px-2 pb-6">
          {miscItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${location.pathname === item.path ? 'bg-gray-100 text-red-800' : 'text-gray-500 hover:bg-gray-100 hover:text-red-700'}`}
              onClick={() => setOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </aside>
      {/* Hamburger button for mobile */}
      <button
        className="fixed z-50 top-4 left-4 md:hidden bg-white border shadow-lg rounded-full p-2 flex items-center justify-center"
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir menú"
      >
        <svg className="w-7 h-7 text-red-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
    </>
  );
};

export default Sidebar;
