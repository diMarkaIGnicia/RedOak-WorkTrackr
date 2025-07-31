import React, { useState, useEffect } from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../hooks/useUsers';
import { useUserProfileContext } from '../context/UserProfileContext';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiFilter, FiPlus, FiSearch, FiX } from 'react-icons/fi';

export default function UsersPage() {
    const navigate = useNavigate();
    const { profile } = useUserProfileContext();
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({
        full_name: '',
        email: '',
        role: ''
    });
    const [pendingFilters, setPendingFilters] = useState({
        full_name: '',
        email: '',
        role: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { users, loading, totalCount, softDeleteUser, updateUserActiveStatus } = useUsers(filters, page, pageSize);
    const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

    const totalPages = Math.ceil(totalCount / pageSize);
    const startItem = totalCount === 0 ? 0 : ((page - 1) * pageSize) + 1;
    const endItem = Math.min(page * pageSize, totalCount);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPendingFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        setFilters({ ...pendingFilters });
        setPage(1);
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <ModuleTemplate>
            <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
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
                        onClick={() => navigate('/usuarios/nuevo')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-semibold shadow-sm flex items-center gap-2 text-sm transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Usuario</span>
                    </button>
                </div>

                {/* Filtros */}
                <div className={`bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-6 ${isFiltersOpen ? 'block' : 'hidden'} md:block`}>
                    <form onSubmit={applyFilters} className="space-y-4">
                        <div className="flex flex-col md:flex-row items-end gap-4">
                            {/* Filtro Nombre */}
                            <div className="flex-1 w-full md:w-auto">
                                <label className="block text-sm font-medium mb-1">Nombre</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={pendingFilters.full_name || ''}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border rounded"
                                    placeholder="Buscar por nombre"
                                />
                            </div>
                            {/* Filtro Correo */}
                            <div className="flex-1 w-full md:w-auto">
                                <label className="block text-sm font-medium mb-1">Correo</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={pendingFilters.email || ''}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border rounded"
                                    placeholder="Buscar por correo"
                                />
                            </div>
                            {/* Filtro Rol */}
                            <div className="flex-1 w-full md:w-auto">
                                <label className="block text-sm font-medium mb-1">Rol</label>
                                <select
                                    name="role"
                                    value={pendingFilters.role || ''}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border rounded"
                                >
                                    <option value="">Todos</option>
                                    <option value="administrator">Administrador</option>
                                    <option value="employee">Empleado</option>
                                </select>
                            </div>
                            {/* Botones */}
                            <div className="flex items-center gap-2">
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-semibold shadow-sm flex items-center gap-2 text-sm transition-colors"
                                    onClick={() => setFilters({ ...pendingFilters })}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Buscar
                                </button>
                                {(filters.full_name || filters.email || filters.role) && (
                                    <button
                                        className="ml-auto flex items-center gap-1 px-2 py-1 rounded border border-gray-300 bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition btn-xs"
                                        style={{ minHeight: 0, height: 28 }}
                                        title="Limpiar filtros"
                                        onClick={() => {
                                            setFilters({ full_name: '', email: '', role: '' });
                                            setPendingFilters({ full_name: '', email: '', role: '' });
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

                    </form>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
                    {loading ? (
                        <div className="p-8 text-center">Cargando...</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Activo
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'administrator' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {user.role === 'administrator' ? 'Administrador' : 'Empleado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <button
                                                    type="button"
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${user.active ? 'bg-blue-600' : 'bg-gray-200'}`}
                                                    role="switch"
                                                    aria-checked={user.active}
                                                    onClick={async () => {
                                                        const newActiveState = !user.active;
                                                        const result = await updateUserActiveStatus(user.id, newActiveState);
                                                        if (result.success) {
                                                            toast.success(`Usuario ${newActiveState ? 'activado' : 'desactivado'} correctamente`);
                                                        } else {
                                                            toast.error(result.error || 'Error al actualizar el estado del usuario');
                                                        }
                                                    }}
                                                >
                                                    <span className="sr-only">Activo</span>
                                                    <span
                                                        aria-hidden="true"
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.active ? 'translate-x-5' : 'translate-x-0'}`}
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button
                                                className="text-yellow-500 hover:bg-yellow-50 rounded-full p-1"
                                                title="Editar"
                                                onClick={() => navigate(`/users/editar/${user.id}`, {
                                                    state: {
                                                        user: {
                                                            id: user.id,
                                                            full_name: user.full_name || '',
                                                            email: user.email || '',
                                                            role: user.role || '',
                                                        }
                                                    }
                                                })}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.21l-4 1 1-4 12.362-12.723z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="text-red-600 hover:bg-red-50 rounded-full p-1 disabled:opacity-50"
                                                title="Eliminar"
                                                disabled={isDeleting[user.id]}
                                                onClick={async () => {
                                                    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
                                                        try {
                                                            setIsDeleting(prev => ({ ...prev, [user.id]: true }));
                                                            const result = await softDeleteUser(user.id);
                                                            if (result.success) {
                                                                toast.success('Usuario eliminado correctamente');
                                                            } else {
                                                                toast.error(result.error || 'Error al eliminar el usuario');
                                                            }
                                                        } catch (error) {
                                                            console.error('Error deleting user:', error);
                                                            toast.error('Ocurrió un error al eliminar el usuario');
                                                        } finally {
                                                            setIsDeleting(prev => ({ ...prev, [user.id]: false }));
                                                        }
                                                    }
                                                }}
                                            >
                                                {isDeleting[user.id] ? (
                                                    <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Paginación */}
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2 mt-4 px-4 py-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                            Mostrando {startItem} a {endItem} de {totalCount} registros
                        </span>

                        <nav className="flex items-center gap-1 text-xs text-gray-500" aria-label="Paginación">
                            <button
                                className={`px-2 py-1 rounded border ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                Anterior
                            </button>

                            {/* Numeración dinámica */}
                            {(() => {
                                const pages = [];
                                const maxNumbers = 5;
                                let start = Math.max(1, page - 2);
                                let end = Math.min(totalPages, page + 2);

                                if (page <= 3) {
                                    end = Math.min(totalPages, maxNumbers);
                                }
                                if (page >= totalPages - 2) {
                                    start = Math.max(1, totalPages - maxNumbers + 1);
                                }

                                if (start > 1) {
                                    pages.push(
                                        <span key="start-ellipsis" className="px-2">...</span>
                                    );
                                }

                                for (let i = start; i <= end; i++) {
                                    pages.push(
                                        <button
                                            key={i}
                                            className={`px-2 py-1 rounded border ${i === page ? 'bg-blue-600 text-white font-medium' : 'hover:bg-gray-100'}`}
                                            style={{ minWidth: '28px' }}
                                            onClick={() => setPage(i)}
                                            disabled={i === page}
                                        >
                                            {i}
                                        </button>
                                    );
                                }

                                if (end < totalPages) {
                                    pages.push(
                                        <span key="end-ellipsis" className="px-2">...</span>
                                    );
                                }

                                return pages;
                            })()}

                            <button
                                className={`px-2 py-1 rounded border ${page >= totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                Siguiente
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </ModuleTemplate>
    );
}
