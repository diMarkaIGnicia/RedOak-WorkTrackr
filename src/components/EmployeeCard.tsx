import React from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { useHoursWorked } from '../hooks/useHoursWorked';

interface Task {
  horas_trabajadas?: number;
  rate_hour?: number;
  hours?: number;
  invoice_id?: string | null;
  [key: string]: any;
}

interface EmployeeCardProps {
  nombre: string;
  photo_url?: string | null;
  tareas: Task[];
  userId: string;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ nombre, photo_url, tareas, userId }) => {
  // Obtener facturas del usuario
  const { invoices, loading: loadingInvoices } = useInvoices(userId);
  // Obtener horas trabajadas libres (sin factura)
  const { hoursWorked: freeHours, loading: loadingFreeHours } = useHoursWorked(userId, { invoice_id: null }, 1, 1000);
  const photoUrl = photo_url || '/avatar-placeholder.jpg';

  // Por Pagar: suma de total de facturas en estado 'Enviada' o 'En Revisión'
  const porPagar = !loadingInvoices && invoices
    ? invoices
        .filter(inv => inv.status === 'Enviada' || inv.status === 'En Revisión')
        .reduce((acc, inv) => acc + (inv.total || 0), 0)
    : 0;

  // Por Facturar: suma de (hours * rate_hour) de horas libres
  const porFacturar = !loadingFreeHours && freeHours
    ? freeHours.reduce((acc, h) => acc + (h.hours * h.rate_hour), 0)
    : 0;

  return (
    <div className="flex items-center bg-white rounded-xl shadow border px-4 py-3 gap-4 max-w-md w-full">
      <div className="relative">
        <img
          src={photoUrl}
          alt={nombre}
          className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/avatar-placeholder.jpg';
          }}
        />
        <span className="absolute bottom-1 left-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" title="Activo" />
      </div>
      <div className="flex flex-col justify-center">
        <div className="font-bold text-lg leading-tight">{nombre}</div>
        <div className="text-gray-600 text-sm">Por Pagar: ${porPagar.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</div>
        <div className="text-gray-600 text-sm">Por Facturar: ${porFacturar.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</div>
      </div>
    </div>
  );
};

export default EmployeeCard;
