import React from 'react';

interface Task {
  horas_trabajadas?: number;
  [key: string]: any;
}

interface EmployeeCardProps {
  nombre: string;
  foto: string;
  tareas: Task[];
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ nombre, foto, tareas }) => {
  const tareasCompletadas = tareas.length;
  const horasTrabajadas = tareas.reduce((acc, t) => acc + (t.horas_trabajadas || 0), 0);

  return (
    <div className="flex items-center bg-white rounded-xl shadow border px-4 py-3 gap-4 max-w-md w-full">
      <div className="relative">
        <img
          src={foto || '/avatar-placeholder.png'}
          alt={nombre}
          className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
        />
        <span className="absolute bottom-1 left-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" title="Activo" />
      </div>
      <div className="flex flex-col justify-center">
        <div className="font-bold text-lg leading-tight">{nombre}</div>
        <div className="text-gray-600 text-sm">Tareas Realizadas: {tareasCompletadas}</div>
        <div className="text-gray-600 text-sm">Horas Trabajadas: {horasTrabajadas}</div>
      </div>
    </div>
  );
};

export default EmployeeCard;
