import React, { useState, useEffect } from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserProfileContext } from '../context/UserProfileContext';
import { useInvoices } from '../hooks/useInvoices';
import { toast } from 'react-hot-toast';
import { getUserIdToNameMap } from '../utils/userIdToNameMap';

export default function InvoicePage() {
  const { user } = useAuth();
  const { profile, loading: loadingProfile } = useUserProfileContext();
  const [filters, setFilters] = useState({ date_off: '' });
  const [pendingFilters, setPendingFilters] = useState({ date_off: '' });
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const {
    invoices,
    loading,
    deleteInvoice,
    fetchInvoices,
    totalCount,
    page: currentPage,
    pageSize: currentPageSize,
    setPage: setPageFromHook
  } = useInvoices(undefined, filters, page, pageSize);
  const navigate = useNavigate();

  useEffect(() => {
    getUserIdToNameMap().then(setUserMap);
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta factura?')) {
      await deleteInvoice(id);
      toast.success('Factura eliminada correctamente');
      fetchInvoices();
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...pendingFilters });
    setPage(1);
    setPageFromHook(1);
  };

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
            + Nueva Factura
          </button>
        </div>
        {/* Filtro por fecha */}
        <form onSubmit={handleFilter} className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-6 flex flex-col md:flex-row items-end gap-4 justify-center md:justify-center w-full">
  <div className="flex-1 w-full md:w-auto max-w-xs">
    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
    <input
      type="date"
      value={pendingFilters.date_off}
      onChange={e => setPendingFilters(f => ({ ...f, date_off: e.target.value }))}
      className="border border-gray-400 rounded px-2 py-1 w-full sm:text-sm focus:ring-2 focus:ring-blue-500 transition text-gray-700 max-w-[170px]"
      style={{ minHeight: 32, maxWidth: 170 }}
    />
  </div>
  <div className="flex flex-row gap-2 items-end">
    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow btn-xs flex items-center gap-1" style={{ minHeight: 32 }}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      Filtrar
    </button>
    {(filters.date_off) && (
      <button
        type="button"
        className="flex items-center gap-1 px-2 py-1 rounded border border-gray-300 bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition btn-xs"
        style={{ minHeight: 32, height: 32 }}
        title="Limpiar filtros"
        onClick={() => {
          setFilters({ date_off: '' });
          setPendingFilters({ date_off: '' });
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
                  <th className="px-4 py-2">Número</th>
                  <th className="px-4 py-2">Cuenta</th>
                  <th className="px-4 py-2">Fecha de Emisión</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{inv.invoice_number}</td>
                    <td className="px-4 py-2">{inv.account_name}</td>
                    <td className="px-4 py-2">{inv.date_off}</td>
                    <td className="px-4 py-2 flex gap-2">
  <button
    className="text-blue-600 hover:bg-blue-50 rounded-full p-1"
    title="Ver"
    onClick={() => navigate(`/facturas/detalle/${inv.id}`, { state: { invoice: inv } })}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5-7 9-9 9s-9-4-9-9 7-9 9-9 9 4 9 9z" />
    </svg>
  </button>
  <button
    className="text-yellow-600 hover:bg-yellow-50 rounded-full p-1"
    title="Editar"
    onClick={() => navigate(`/facturas/editar/${inv.id}`, { state: { invoice: inv } })}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.21l-4 1 1-4 12.362-12.723z" />
    </svg>
  </button>
  <button
    className="text-red-600 hover:bg-red-50 rounded-full p-1"
    title="Eliminar"
    onClick={() => handleDelete(inv.id)}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

