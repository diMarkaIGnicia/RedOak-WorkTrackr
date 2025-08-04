import React, { useState, useEffect } from 'react';
import CustomerAutocomplete from '../components/CustomerAutocomplete';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { useAuth } from '../context/AuthContext';
import { useReports, Report } from '../hooks/useReports';
import { useUsers, User } from '../hooks/useUsers';
import { useNavigate } from 'react-router-dom';
import { useUserProfileContext } from '../context/UserProfileContext';


export default function ReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: loadingProfile } = useUserProfileContext();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    report_date: '',
    customer_id: '',
    user_id: '',
  });
  // Estado temporal para los inputs de filtro
  const [pendingFilters, setPendingFilters] = useState({
    report_date: '',
    customer_id: '',
    user_id: '',
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  // Obtener usuarios para el filtro (solo admin)
  const userFilters = React.useMemo(() => ({}), []);
  const { users: userOptions, loading: loadingUsers } = useUsers(userFilters, 1, 100);

  // Determinar userId para la consulta de reportes
  // Si es admin y filtra por usuario, usar ese userId; si no hay filtro, ver todos los reportes (userId undefined)
  // Si es empleado, solo ver sus propios reportes
  const userId = profile?.role === 'administrator'
    ? (filters.user_id ? filters.user_id : undefined)
    : profile?.id;

  const { reports, loading, error, totalCount, page: currentPage, pageSize: currentPageSize, setPage: setPageFromHook, deleteReport } = useReports(userId, filters, page, pageSize);
  const [deletedMsg, setDeletedMsg] = useState("");

  if (loadingProfile) {
    return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;
  }

  // Eliminar tarea con confirmación
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este reporte?')) {
      await deleteReport(id);
      setDeletedMsg('Reporte eliminado correctamente');
      setTimeout(() => setDeletedMsg(''), 2000);
    }
  };

  return (
    <ModuleTemplate>
      <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-montserrat font-bold text-blue-dark">Reportes</h1>
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
              onClick={() => navigate('/reportes/nuevo')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Reporte</span>
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
                  onChange={e => setPendingFilters(f => ({ ...f, user_id: e.target.value }))}
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
                value={pendingFilters.report_date}
                onChange={e => setPendingFilters(f => ({ ...f, report_date: e.target.value }))}
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
                onClick={() => setFilters({ ...pendingFilters })}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
              {(filters.report_date || filters.customer_id || filters.user_id) && (
                <button
                  className="ml-auto flex items-center gap-1 px-2 py-1 rounded border border-gray-300 bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition btn-xs"
                  style={{ minHeight: 0, height: 28 }}
                  title="Limpiar filtros"
                  onClick={() => {
                    setFilters({ report_date: '', customer_id: '', user_id: '' });
                    setPendingFilters({ report_date: '', customer_id: '', user_id: '' });
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
                {profile?.role === 'administrator' && <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Usuario</th>}
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Fecha</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Hora</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Cliente</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Descripción</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center p-4">Cargando...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="text-center p-4 text-red-600">{error}</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4 text-gray-500">No hay reportes.</td></tr>
              ) : (
                reports.map((report: Report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-gray-50 transition"
                  >
                    {profile?.role === 'administrator' && (
                      <td className="px-4 py-2 text-sm">{userOptions?.find(u => u.id === report.user_id)?.full_name || report.user_id}</td>
                    )}
                    <td className="px-4 py-2 text-sm">{report.report_date}</td>
                    <td className="px-4 py-2 text-sm">{report.report_time}</td>
                    <td className="px-4 py-2 text-sm">{report.customer_name || report.customer_id}</td>
                    <td className="px-4 py-2 text-sm">{report.description}</td>
                    <td className="px-4 py-2 text-sm text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          className="text-yellow-500 hover:bg-yellow-50 rounded-full p-1"
                          title="Editar"
                          onClick={() => navigate(`/reportes/editar/${report.id}`, {
                            state: {
                              report: {
                                id: report.id,
                                report_date: report.report_date || '',
                                report_time: report.report_time || '',
                                customer_id: report.customer_id || '',
                                description: report.description || '',
                                user_id: report.user_id || '',
                              }
                            }
                          })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.21l-4 1 1-4 12.362-12.723z" />
                          </svg>
                        </button>
                        <button
                          className="text-red-600 hover:bg-red-50 rounded-full p-1"
                          title="Eliminar"
                          onClick={() => handleDelete(report.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
      {deletedMsg && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all animate-fade-in">
          {deletedMsg}
        </div>
      )}
    </ModuleTemplate>
  );
}

