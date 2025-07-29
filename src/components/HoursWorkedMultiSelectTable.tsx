import React from 'react';
import { useHoursWorked, HoursWorked } from '../hooks/useHoursWorked';
import { useUserProfileContext } from '../context/UserProfileContext';

interface HoursWorkedMultiSelectTableProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

interface HoursWorkedMultiSelectTableProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  hoursWorked: HoursWorked[];
  loading: boolean;
}

const HoursWorkedMultiSelectTable: React.FC<HoursWorkedMultiSelectTableProps> = ({ selected, onChange, disabled, hoursWorked, loading }) => {
  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(sid => sid !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Cargando horas trabajadas...</div>;
  }

  return (
    <div className="border rounded-xl shadow bg-white p-4">
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left">
                <input
                  type="checkbox"
                  checked={hoursWorked?.length > 0 && hoursWorked.every(hw => selected.includes(hw.id))}
                  onChange={e => {
                    if (e.target.checked) {
                      onChange(hoursWorked.map(hw => hw.id));
                    } else {
                      onChange([]);
                    }
                  }}
                  disabled={disabled || !hoursWorked?.length}
                />
              </th>
              <th className="px-2 py-2 text-left">Fecha</th>
              <th className="px-2 py-2 text-left">Cliente</th>
              <th className="px-2 py-2 text-right">Costo del Servicio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {hoursWorked && hoursWorked.length > 0 ? (
              hoursWorked.map(hw => (
                <tr key={hw.id} className={selected.includes(hw.id) ? 'bg-blue-50' : ''}>
                  <td className="px-2 py-1">
                    <input
                      type="checkbox"
                      checked={selected.includes(hw.id)}
                      onChange={() => handleToggle(hw.id)}
                      disabled={disabled}
                    />
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">{hw.date_worked}</td>
                  <td className="px-2 py-1">{hw.customer_name || hw.customer_id}</td>
                  <td className="px-2 py-1 text-right">${Number(hw.hours * hw.rate_hour).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-4">No hay horas trabajadas libres para asociar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoursWorkedMultiSelectTable;
