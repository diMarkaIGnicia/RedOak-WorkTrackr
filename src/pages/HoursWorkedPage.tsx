import React, { useState } from 'react';
import CustomerAutocomplete from '../components/CustomerAutocomplete';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { useHoursWorked, HoursWorked } from '../hooks/useHoursWorked';
import { useNavigate } from 'react-router-dom';
import { useUserProfileContext } from '../context/UserProfileContext';
import Toast from '../components/Toast';
import { useUsers, User } from '../hooks/useUsers';

export default function HoursWorkedPage() {

  const navigate = useNavigate();
  const { profile, loading: loadingProfile } = useUserProfileContext();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  // Memo para estabilizar los filtros y evitar ciclos infinitos
  const [filtersState, setFiltersState] = useState({
    date_worked: '',
    customer_id: '',
    user_id: ''
  });
  const filters = React.useMemo(() => ({ ...filtersState }), [filtersState]);
  // Estado temporal para los inputs de filtro
  const [pendingFilters, setPendingFilters] = useState({
    date_worked: '',
    customer_id: '',
    user_id: ''
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  // Siempre llamar al hook; el propio hook debe proteger el fetch si userId no está listo
  // Si es administrador y no hay filtro de usuario, ver todas las horas (userId undefined)
  const userId = profile?.role === 'administrator'
    ? (filters.user_id ? filters.user_id : undefined)
    : profile?.id;
  const { hoursWorked, loading, error, totalCount, page: currentPage, pageSize: currentPageSize, setPage: setPageFromHook, deleteHoursWorked } = useHoursWorked(userId, filters, page, pageSize);

  // Obtener usuarios para el filtro
  // Memo para evitar ciclo infinito
  const stableUserFilters = React.useMemo(() => ({}), []);
  const { users: userOptions, loading: loadingUsers } = useUsers(stableUserFilters, 1, 100); // cargar hasta 100 usuarios
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    show: boolean;
  }>({ message: '', type: 'info', show: false });

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  if (loadingProfile) {
    return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;
  }

  // Eliminar tarea con confirmación
  const handleDelete = async (id: string) => {
    // Usar un diálogo personalizado en lugar de window.confirm
    const confirmDelete = window.confirm('¿Seguro que deseas eliminar esta hora trabajada?');
    if (!confirmDelete) return;

    const result = await deleteHoursWorked(id);
    if (result.success) {
      showToast('Hora trabajada eliminada correctamente', 'success');
    } else if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Ocurrió un error al procesar la solicitud', 'error');
    }
  };

  // Handler para aplicar filtros
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFiltersState({
      date_worked: pendingFilters.date_worked,
      customer_id: pendingFilters.customer_id,
      user_id: pendingFilters.user_id,
    });
    setPage(1);
    setPageFromHook(1);
  };


  return (
    <ModuleTemplate>
      <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-montserrat font-bold text-blue-dark">Horas Trabajadas</h1>
          <div className="flex items-center gap-2">
            <button
              title="Mostrar filtros"
              className="md:hidden bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg font-semibold shadow-sm flex items-center justify-center transition w-9 h-9"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10m-9 8h8" />
              </svg>
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-semibold shadow-sm flex items-center gap-2 text-sm transition-colors"
              onClick={() => navigate('/horas-trabajadas/nueva')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Registrar Horas</span>
            </button>
          </div>
        </div>
        <div className={`bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-6 ${isFiltersOpen ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col md:flex-row items-end gap-4">
            {/* Filtro Usuario (solo para administradores) */}
            {profile?.role === 'administrator' && (
              <div className="flex-1 w-full md:w-auto">
                <label className="block text-sm font-medium mb-1">Usuario</label>
                <select
                  name="user_id"
                  value={pendingFilters.user_id || ''}
                  onChange={e => setPendingFilters(prev => ({ ...prev, user_id: e.target.value }))}
                  className="border border-gray-400 rounded px-2 py-1 w-full sm:text-sm focus:ring-2 focus:ring-blue-500 transition text-gray-700"
                  disabled={loadingUsers}
                >
                  <option value="">Todos</option>
                  {userOptions && userOptions.map((user: User) => (
                    <option key={user.id} value={user.id}>{user.full_name}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Filtro Fecha */}
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={pendingFilters.date_worked}
                onChange={e => setPendingFilters(f => ({ ...f, date_worked: e.target.value }))}
                className="border border-gray-400 rounded px-2 py-1 w-full sm:text-sm"
              />
            </div>

            {/* Filtro Cliente */}
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <CustomerAutocomplete
                value={pendingFilters.customer_id}
                onChange={(id: string, name: string) => setPendingFilters(f => ({ ...f, customer_id: id }))}
                readOnly={false}
                className="border border-gray-400 rounded px-2 py-1 w-full sm:text-sm"
              />
            </div>

            {/* Botones */}
            <div className="flex items-center gap-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow-sm flex items-center gap-2 text-sm transition-colors"
                onClick={() => setFiltersState({ ...pendingFilters })}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
              {(filters.date_worked || filters.customer_id || filters.user_id) && (
                <button
                  className="ml-auto flex items-center gap-1 px-2 py-1 rounded border border-gray-300 bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition btn-xs"
                  style={{ minHeight: 0, height: 28 }}
                  title="Limpiar filtros"
                  onClick={() => {
                    setFiltersState({ date_worked: '', customer_id: '', user_id: '' });
                    setPendingFilters({ date_worked: '', customer_id: '', user_id: '' });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {profile?.role === 'administrator' && (
                  <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Usuario</th>
                )}
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Fecha</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Cliente</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Tipo de Trabajo</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Horas Trabajadas</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Total</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center p-4">Cargando...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="text-center p-4 text-red-600">{error}</td></tr>
              ) : hoursWorked.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4 text-gray-500">No hay horas trabajadas.</td></tr>
              ) : (
                hoursWorked.map((hoursWorked: HoursWorked) => {
                  const usuario = userOptions?.find(u => u.id === hoursWorked.user_id)?.full_name || hoursWorked.user_id;
                  return (
                    <tr
                      key={hoursWorked.id}
                      className="hover:bg-gray-50 transition"
                    >
                      {profile?.role === 'administrator' && (
                        <td className="px-4 py-2 text-sm">{usuario}</td>
                      )}
                      <td className="px-4 py-2 text-sm">{hoursWorked.date_worked}</td>
                      <td className="px-4 py-2 text-sm">{hoursWorked.customer_name || hoursWorked.customer_id}</td>
                      <td className="px-4 py-2 text-sm">{hoursWorked.type_work}</td>
                      <td className="px-4 py-2 text-sm">{hoursWorked.hours}</td>
                      <td className="px-4 py-2 text-sm text-right">
                        $ {Number(hoursWorked.hours * hoursWorked.rate_hour).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-sm text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="text-blue-500 hover:bg-blue-50 rounded-full p-1"
                            title="Ver detalle"
                            onClick={() => navigate(`/horas-trabajadas/detalle/${hoursWorked.id}`, { state: { hoursWorked } })}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            className={`${hoursWorked.invoice_id ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-500 hover:bg-yellow-50'} rounded-full p-1`}
                            title={hoursWorked.invoice_id ? 'No se puede editar - Tiene factura asociada' : 'Editar'}
                            disabled={!!hoursWorked.invoice_id}
                            onClick={(e) => {
                              if (hoursWorked.invoice_id) {
                                e.preventDefault();
                                showToast('No se puede editar una hora trabajada que ya está asociada a una factura', 'warning');
                                return;
                              }
                              navigate(`/horas-trabajadas/editar/${hoursWorked.id}`, {
                                state: {
                                  hoursWorked: {
                                    id: hoursWorked.id,
                                    date_worked: hoursWorked.date_worked || '',
                                    customer_id: hoursWorked.customer_id || '',
                                    type_work: hoursWorked.type_work || '',
                                    type_work_other: hoursWorked.type_work_other || '',
                                    hours: typeof hoursWorked.hours === 'number' ? hoursWorked.hours : 0,
                                    rate_hour: typeof hoursWorked.rate_hour === 'number' ? hoursWorked.rate_hour : 0,
                                    user_id: hoursWorked.user_id || ''
                                    }
                                }
                              });
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            className="text-red-600 hover:bg-red-50 rounded-full p-1"
                            title="Eliminar"
                            onClick={() => handleDelete(hoursWorked.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {/* Paginación y cantidad de registros al final */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-end sm:items-center gap-1 mt-4 mb-2 mx-2">
            <span className="text-xs text-gray-500 mr-2">
              Mostrando {totalCount === 0 ? 0 : ((currentPage - 1) * currentPageSize + 1)} a {Math.min(currentPage * currentPageSize, totalCount)} de {totalCount} registros
            </span>
            <nav className="flex items-center gap-1 text-xs text-gray-500" aria-label="Paginación">
              <button
                className={`btn btn-xs ${currentPage === 1 ? 'btn-disabled' : 'btn-outline'}`}
                disabled={currentPage === 1}
                onClick={() => { setPage(currentPage - 1); setPageFromHook(currentPage - 1); }}
              >Anterior</button>
              {/* Numeración dinámica */}
              {(() => {
                const pageCount = Math.ceil(totalCount / currentPageSize);
                const pages = [];
                const maxNumbers = 5;
                let start = Math.max(1, currentPage - 2);
                let end = Math.min(pageCount, currentPage + 2);
                if (currentPage <= 3) { end = Math.min(pageCount, maxNumbers); }
                if (currentPage >= pageCount - 2) { start = Math.max(1, pageCount - maxNumbers + 1); }
                if (start > 1) pages.push(<span key="start-ellipsis" className="px-1">...</span>);
                for (let i = start; i <= end; i++) {
                  pages.push(
                    <button
                      key={i}
                      className={`btn btn-xs px-2 ${i === currentPage ? 'bg-blue-600 text-white font-bold' : 'btn-outline'}`}
                      style={{ minWidth: 28 }}
                      onClick={() => { setPage(i); setPageFromHook(i); }}
                      disabled={i === currentPage}
                    >{i}</button>
                  );
                }
                if (end < pageCount) pages.push(<span key="end-ellipsis" className="px-1">...</span>);
                return pages;
              })()}
              <button
                className={`btn btn-xs ${currentPage * currentPageSize >= totalCount ? 'btn-disabled' : 'btn-outline'}`}
                disabled={currentPage * currentPageSize >= totalCount}
                onClick={() => { setPage(currentPage + 1); setPageFromHook(currentPage + 1); }}
              >Siguiente</button>
            </nav>
          </div>
        </div>
      </div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
    </ModuleTemplate>
  );
}

