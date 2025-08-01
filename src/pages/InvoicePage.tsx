import React, { useState } from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { useNavigate } from 'react-router-dom';
import { useUserProfileContext } from '../context/UserProfileContext';
import { useInvoices, Invoice } from '../hooks/useInvoices';
import { useUsers, User } from '../hooks/useUsers';
import { toast } from 'react-hot-toast';
import { generateInvoicePdf } from '../utils/generateInvoicePdf';

export default function InvoicePage() {
  const { profile, loading: loadingProfile } = useUserProfileContext();
  interface InvoiceFilters {
    date_off: string;
    invoice_number: string;
  }

  const [filters, setFilters] = useState<Partial<Invoice>>({});
  const [pendingFilters, setPendingFilters] = useState<Partial<Invoice & { user_id?: string }>>({ 
    date_off: '', 
    invoice_number: '',
    status: '',
    user_id: '',
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  // Determinar userId para la consulta de facturas
  // Si es admin y filtra por usuario, usar ese userId; si no hay filtro, ver todas las facturas (userId undefined)
  // Si es empleado, solo ver sus propias facturas
  const userId = profile?.role === 'administrator'
    ? (filters.user_id ? filters.user_id : undefined)
    : profile?.id;
  const {
    invoices,
    loading,
    deleteInvoice,
    fetchInvoices,
    totalCount,
    page: currentPage,
    pageSize: currentPageSize,
    setPage: setPageFromHook
  } = useInvoices(userId, filters, page, pageSize);
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta factura?')) {
      await deleteInvoice(id);
      toast.success('Factura eliminada correctamente');
      fetchInvoices();
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    // Create a new filters object with only non-empty values
    const newFilters: Partial<Invoice & { user_id?: string }> = {};
    if (pendingFilters.date_off) newFilters.date_off = pendingFilters.date_off;
    if (pendingFilters.invoice_number) newFilters.invoice_number = pendingFilters.invoice_number;
    if (pendingFilters.status) newFilters.status = pendingFilters.status;
    if (pendingFilters.user_id) newFilters.user_id = pendingFilters.user_id;
    setFilters(newFilters);
    setPage(1);
    setPageFromHook(1);
  };

  // Obtener usuarios para el filtro (solo para admin)
  const userFilters = React.useMemo(() => ({}), []);
  const { users: userOptions, loading: loadingUsers } = useUsers(userFilters, 1, 100);

  if (loadingProfile || loading) return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;

  return (
    <ModuleTemplate>
      <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-montserrat font-bold text-blue-dark">Facturas</h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow-sm flex items-center gap-2 text-sm transition-colors"
            onClick={() => navigate('/facturas/crear')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Factura
          </button>
        </div>
        {/* Filtro por fecha */}
        <form onSubmit={handleFilter} className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-6 flex flex-col md:flex-row items-end gap-4 justify-center md:justify-center w-full">
          {/* Filtro Usuario (solo para administradores) */}
          {profile?.role === 'administrator' && (
            <div className="flex-1 w-full md:w-auto max-w-xs">
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
          <div className="flex-1 w-full md:w-auto max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Factura</label>
            <input
              type="text"
              placeholder="Buscar por número"
              value={pendingFilters.invoice_number}
              onChange={e => setPendingFilters(f => ({ ...f, invoice_number: e.target.value }))}
              className="border border-gray-400 rounded px-2 py-1 w-full sm:text-sm focus:ring-2 focus:ring-blue-500 transition text-gray-700"
              style={{ minHeight: 32, minWidth: 170 }}
            />
          </div>
          <div className="flex-1 w-full md:w-auto max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Corte</label>
            <input
              type="date"
              value={pendingFilters.date_off}
              onChange={e => setPendingFilters(f => ({ ...f, date_off: e.target.value }))}
              className="border border-gray-400 rounded px-2 py-1 w-full sm:text-sm focus:ring-2 focus:ring-blue-500 transition text-gray-700"
              style={{ minHeight: 32, minWidth: 170 }}
            />
          </div>
          <div className="flex-1 w-full md:w-auto max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={pendingFilters.status || ''}
              onChange={e => setPendingFilters(f => ({ ...f, status: e.target.value || undefined }))}
              className="border border-gray-400 rounded px-2 py-1 w-full sm:text-sm focus:ring-2 focus:ring-blue-500 transition text-gray-700"
              style={{ minHeight: 32, minWidth: 170 }}
            >
              <option value="">Todos los estados</option>
              <option value="Creada">Creada</option>
              <option value="Enviada">Enviada</option>
              <option value="En Revisión">En Revisión</option>
              <option value="Pagada">Pagada</option>
            </select>
          </div>
          <div className="flex flex-row gap-2 items-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow-sm flex items-center gap-2 text-sm transition-colors" style={{ minHeight: 32 }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
            {(filters.date_off || filters.invoice_number || filters.status || filters.user_id) && (
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 rounded border border-gray-300 bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition btn-xs"
                style={{ minHeight: 32, height: 32 }}
                title="Limpiar filtros"
                onClick={() => {
                  setFilters({});
                  setPendingFilters({ date_off: '', invoice_number: '', status: '', user_id: '' });
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </button>
            )}
          </div>
        </form>
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
          {invoices.length === 0 ? (
            <div className="border rounded p-4 text-center text-gray-400">No hay facturas registradas aún.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {profile?.role === 'administrator' && <th className="px-4 py-2">Usuario</th>}
                  <th className="px-4 py-2">Número</th>
                  <th className="px-4 py-2">Cuenta</th>
                  <th className="px-4 py-2">Fecha de Corte</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    {profile?.role === 'administrator' && (
                      <td className="px-4 py-2">{userOptions?.find(u => u.id === inv.user_id)?.full_name || inv.user_id}</td>
                    )}
                    <td className="px-4 py-2">{inv.invoice_number}</td>
                    <td className="px-4 py-2">{inv.account_name}</td>
                    <td className="px-4 py-2 text-center">{inv.date_off}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {inv.total !== undefined ? `$${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="px-4 py-2 text-center">{inv.status}</td>
                    <td className="px-4 py-2 text-sm text-center">
                      <button
                        className="text-blue-600 hover:bg-blue-50 rounded-full p-1"
                        title="Ver"
                        onClick={() => navigate(`/facturas/detalle/${inv.id}`, { state: { invoice: inv } })}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        className={`${profile?.role === 'employee' && inv.status !== 'Creada' ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-600 hover:bg-yellow-50'} rounded-full p-1`}
                        title={profile?.role === 'employee' && inv.status !== 'Creada' ? 'No puedes editar facturas que no estén en estado Creada' : 'Editar'}
                        onClick={() => {
                          if (profile?.role === 'employee' && inv.status !== 'Creada') {
                            toast.error('Solo puedes editar facturas en estado Creada');
                            return;
                          }
                          navigate(`/facturas/editar/${inv.id}`, { state: { invoice: inv } });
                        }}
                        disabled={profile?.role === 'employee' && inv.status !== 'Creada'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.21l-4 1 1-4 12.362-12.723z" />
                        </svg>
                      </button>
                      <button
                        className="text-green-600 hover:bg-green-50 rounded-full p-1"
                        title="Exportar PDF"
                        onClick={() => generateInvoicePdf({ invoice: inv, profile })}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        className="text-red-600 hover:bg-red-50 rounded-full p-1"
                        title="Eliminar"
                        onClick={() => handleDelete(inv.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Paginación */}
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
    </ModuleTemplate>
  );
}

