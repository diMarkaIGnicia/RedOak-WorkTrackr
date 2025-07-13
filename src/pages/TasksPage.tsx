import React, { useState } from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { useAuth } from '../hooks/useAuth';
import { useTasks, Task } from '../hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import { useUserProfileContext } from '../context/UserProfileContext';

const ESTADOS = ['Creada', 'Enviada', 'Pagada'];
const TIPOS_TRABAJO = [
  'Soporte',
  'Mantenimiento',
  'Consultoría',
  'Desarrollo',
  'Otro',
];

export default function TasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: loadingProfile } = useUserProfileContext();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    cliente: '',
    estado: '',
  });
  // Estado temporal para los inputs de filtro
  const [pendingFilters, setPendingFilters] = useState({
    fecha_inicio: '',
    cliente: '',
    estado: '',
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { tasks, loading, error, totalCount, page: currentPage, pageSize: currentPageSize, setPage: setPageFromHook, deleteTask } = useTasks(profile?.id, filters, page, pageSize);
  const [deletedMsg, setDeletedMsg] = useState("");

  if (loadingProfile) {
    return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;
  }

  // Eliminar tarea con confirmación
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta tarea?')) {
      await deleteTask(id);
      setDeletedMsg('Tarea eliminada correctamente');
      setTimeout(() => setDeletedMsg(''), 2000);
    }
  };

  return (
    <ModuleTemplate>
      <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-montserrat font-bold text-blue-dark">Tareas</h1>
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
              onClick={() => navigate('/tareas/nueva')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Tarea</span>
            </button>
          </div>
        </div>
        <div className={`bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-6 ${isFiltersOpen ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col md:flex-row items-end gap-4">
            {/* Filtro Fecha */}
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={pendingFilters.fecha_inicio}
                onChange={e => setPendingFilters(f => ({ ...f, fecha_inicio: e.target.value }))}
                className="border border-gray-400 rounded px-2 py-1 w-full sm:text-sm"
              />
            </div>

            {/* Filtro Cliente */}
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <input
                type="text"
                value={pendingFilters.cliente}
                onChange={e => setPendingFilters(f => ({ ...f, cliente: e.target.value }))}
                className="border border-gray-400 rounded px-2 py-1 w-full sm:text-sm"
                placeholder="Buscar cliente"
              />
            </div>

            {/* Filtro Estado */}
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={pendingFilters.estado}
                onChange={e => setPendingFilters(f => ({ ...f, estado: e.target.value }))}
                className="border border-gray-400 rounded px-2 py-1 w-full sm:text-sm"
              >
                <option value="">Todos</option>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
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
              {(filters.fecha_inicio || filters.cliente || filters.estado) && (
                <button
                  className="ml-auto flex items-center gap-1 px-2 py-1 rounded border border-gray-300 bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition btn-xs"
                  style={{ minHeight: 0, height: 28 }}
                  title="Limpiar filtros"
                  onClick={() => {
                    setFilters({ fecha_inicio: '', cliente: '', estado: '' });
                    setPendingFilters({ fecha_inicio: '', cliente: '', estado: '' });
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
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Fecha Inicio</th>
<th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Cliente</th>
<th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Tipo de Trabajo</th>
<th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Horas Trabajadas</th>
<th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-left">Estado</th>
<th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center p-4">Cargando...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="text-center p-4 text-red-600">{error}</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4 text-gray-500">No hay tareas.</td></tr>
              ) : (
                 tasks.map((task: Task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2 text-sm">{task.fecha_inicio}</td>
                    <td className="px-4 py-2 text-sm">{task.cliente}</td>
                    <td className="px-4 py-2 text-sm">{task.tipo_trabajo}</td>
                    <td className="px-4 py-2 text-sm">{task.horas_trabajadas}</td>
                    <td className="px-4 py-2 text-sm">
  <span className={`px-2 py-1 rounded text-xs font-semibold ${
    task.estado === 'Pagada'
      ? 'bg-green-100 text-green-700'
      : task.estado === 'Enviada'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-gray-100 text-gray-600'
  }`}>
    {task.estado}
  </span>
</td>
<td className="px-4 py-2 text-sm text-center">
  <div className="flex justify-center gap-2">
    <button
      className="text-blue-500 hover:bg-blue-50 rounded-full p-1"
      title="Ver detalle"
      onClick={() => navigate(`/tareas/detalle/${task.id}`, { state: { task } })}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </button>
    <button
      className="text-yellow-500 hover:bg-yellow-50 rounded-full p-1"
      title="Editar"
      onClick={() => navigate(`/tareas/editar/${task.id}`, { state: { task } })}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.21l-4 1 1-4 12.362-12.723z" />
      </svg>
    </button>
    <button
      className="text-red-600 hover:bg-red-50 rounded-full p-1"
      title="Eliminar"
      onClick={() => handleDelete(task.id)}
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

