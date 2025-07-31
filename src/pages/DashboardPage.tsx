import React, { useState, useEffect } from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';

// Componente para mostrar preview con loading/skeleton
const PreviewWithLoading: React.FC<{ url?: string; cliente: string }> = ({ url, cliente }) => {
  const [loading, setLoading] = useState(!!url);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    if (!url) return;
    setIsVideo(/\.(mp4|webm|ogg)(\?|$)/i.test(url));
  }, [url]);

  if (!url) {
    return (
      <div className="w-20 h-20 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-2xl">🖼️</span>
      </div>
    );
  }

  return (
    <div className="w-20 h-20 rounded overflow-hidden bg-gray-100 flex items-center justify-center relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      )}
      {isVideo ? (
        <video
          src={url}
          className="object-cover w-full h-full"
          controls={false}
          autoPlay={false}
          muted
          playsInline
          onLoadedData={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      ) : (
        <img
          src={url}
          alt={`Adjunto de tarea ${cliente}`}
          className="object-cover w-full h-full"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      )}
    </div>
  );
};

import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useHoursWorked } from '../hooks/useHoursWorked';
import { UserIcon, CalendarIcon, LockClosedIcon, LockOpenIcon, CurrencyDollarIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAllEmployeesWithTasks } from '../hooks/useAllEmployees'; // Nuevo hook para admin
import EmployeeCard from '../components/EmployeeCard';
import { useNavigate } from 'react-router-dom';
// Ahora los empleados y tareas se obtienen con useAllEmployeesWithTasks

const opcionesRango = [
  { value: 'all', label: 'All time' },
  { value: '15', label: 'Últimos 15 días' },
  { value: '30', label: 'Últimos 30 días' },
];

// El perfil ahora viene del hook useUserProfile

const DashboardPage: React.FC = () => {
  const [rango, setRango] = useState('all');
  const navigate = useNavigate();
  const { user, loading: loadingUser } = useAuth();
  const { profile, loading: loadingProfile } = useUserProfile(user?.id);
  const { hoursWorked, loading: loadingHoursWorked } = useHoursWorked(profile?.id);
  // Nuevo hook para admin
  const { empleados, loading: loadingEmpleados, error: errorEmpleados } = useAllEmployeesWithTasks({ rango });

  // Loading global
  if (loadingUser || loadingProfile || loadingHoursWorked || (profile?.role === 'administrator' && loadingEmpleados)) {
    return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;
  }
  if (!profile) {
    return <ModuleTemplate><div className="p-8 text-red-700">No se pudo cargar el perfil de usuario.</div></ModuleTemplate>;
  }
  if (profile.role === 'administrator' && errorEmpleados) {
    return <ModuleTemplate><div className="p-8 text-red-700">Error cargando empleados: {errorEmpleados}</div></ModuleTemplate>;
  }

  return (
    <ModuleTemplate>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Dashboard para EMPLEADO */}
        {profile.role === 'employee' && (
          <>
            <h1 className="text-3xl font-bold mb-2">Bienvenido de nuevo</h1>
            <div className="flex justify-center mb-8">
              <div className="bg-blue-50 border border-blue-200 shadow-lg rounded-2xl flex flex-col md:flex-row items-center gap-4 px-8 py-6 w-full max-w-xl animate-fade-in">
                <div className="w-full">
                  <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow flex items-center gap-2 text-base transition-colors w-full md:w-auto"
                      onClick={() => navigate('/horas-trabajadas/nueva')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-montserrat">Horas</span>
                    </button>
                    <button
                      className="bg-white border border-blue-400 text-blue-700 hover:bg-blue-100 px-5 py-2 rounded-lg font-semibold shadow flex items-center gap-2 text-base transition-colors w-full md:w-auto"
                      onClick={() => navigate('/reportes/nuevo')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-montserrat">Reporte</span>
                    </button>
                    <button
                      className="bg-white border border-blue-400 text-blue-700 hover:bg-blue-100 px-5 py-2 rounded-lg font-semibold shadow flex items-center gap-2 text-base transition-colors w-full md:w-auto"
                      onClick={() => navigate('/facturas/crear')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-montserrat">Factura</span>
                    </button>
                  </div>
                  <div className="text-xs text-blue-700 mt-2 text-center font-montserrat">Accesos rápidos para registrar horas, reportes o facturas</div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-4">Horas Trabajadas de Hoy</h3>
            <div className="flex flex-col gap-4">
              {(() => {
                const hoursWorkedToday = hoursWorked.filter(hoursWorked => {
                  if (!hoursWorked.created_at) return false;
                  const today = new Date();
                  const dateHourWorked = new Date(hoursWorked.created_at);
                  return (
                    today.getFullYear() === dateHourWorked.getFullYear() &&
                    today.getMonth() === dateHourWorked.getMonth() &&
                    today.getDate() === dateHourWorked.getDate()
                  );
                });
                if (hoursWorkedToday.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-8 text-blue-700/80">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-lg">No tienes horas registradas hoy.</span>
                      <span className="text-sm text-blue-400">¡Disfruta tu día o registra nuevas horas trabajadas!</span>
                    </div>
                  );
                }
                return hoursWorkedToday.map(hoursWorked => (
                  <div key={hoursWorked.id} className="flex items-center bg-white rounded-xl shadow-lg border border-blue-100 p-4 gap-4 hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-bold">
                        <span className="inline-flex items-center text-base">
                          <UserIcon className="w-5 h-5 mr-1" />
                          <button
                            type="button"
                            className="text-blue-700 hover:underline focus:outline-none font-semibold"
                            onClick={() => navigate(`/horas-trabajadas/detalle/${hoursWorked.id}`, { state: { hoursWorked } })}
                            title="Ver detalle de las horas trabajadas"
                          >
                            {hoursWorked.customer_name}
                          </button>
                        </span>
                        {('alerta' in hoursWorked) && hoursWorked.alerta && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 ml-2" />}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm gap-2 mt-1">
                        <CalendarIcon className="w-4 h-4" />
                        {hoursWorked.date_worked}
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Total Horas: {hoursWorked.hours}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
  ${hoursWorked.invoice_id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                        {hoursWorked.invoice_id ? (
                          <>
                            <LockClosedIcon className="w-4 h-4 mr-1" />
                            {hoursWorked.invoice_status ? hoursWorked.invoice_status : 'En factura'}
                          </>
                        ) : (
                          <>
                            <LockOpenIcon className="w-4 h-4 mr-1" />
                            No está en una factura
                          </>
                        )}
                      </span>
                      <span className="flex items-center text-gray-700 text-sm">
                        <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                        {Number(hoursWorked.hours * hoursWorked.rate_hour).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </>
        )}
        {/* Dashboard para ADMINISTRADOR */}
        {profile.role === 'administrator' && (
          <div>
            <h1 className="text-3xl font-montserrat font-bold mb-2">Bienvenido de nuevo</h1>
            <h2 className="text-lg font-montserrat font-normal mb-6">Este es el resumen de tu Empleados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {empleados.map(emp => (
                <EmployeeCard
                  key={emp.id}
                  userId={emp.id}
                  nombre={emp.full_name}
                  photo_url={emp.photo_url}
                  tareas={emp.tareas}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ModuleTemplate>
  );
};

export default DashboardPage;
